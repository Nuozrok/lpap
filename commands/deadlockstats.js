const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { dotenv } = require('dotenv/config');
var fs = require('fs');
// both the autocomplete and the result need to be able to reference heroscache.json
const accountscache= JSON.parse(fs.readFileSync('data/accountscache.json', 'utf8'));
const heroscache= JSON.parse(fs.readFileSync('data/deadlockherodata.json', 'utf8'));
var Vibrant = require('node-vibrant');


// inside a command, event listener, etc.
module.exports = {
    data: new SlashCommandBuilder()
        .setName('deadlockstats')
        .setDescription('See your encounters with a deadlock hero in last 30 days of match history')
        .addStringOption(option =>
            option.setName('account')
                .setDescription('Select the account')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName('hero')
                .setDescription('Select the hero')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        /* the opendota api has an annoying format where you can either choose the objects to be indexed by heroid, or by name
         * I chose to grab the objects indexed by id (see dotarefreshcache.js)
         * 
         * the name is useless for display purposes (who wants an autocomplete where the search shows 
         * "npc_dota_hero_antimage")??
         * 
         * we really want to calculate and the hero id the whole time as that is what the opendota api wants
         * 
        */

       	const focusedOption = interaction.options.getFocused(true);
		let choices;

      
        // if nothing is put, just grab some defaults
		if(!focusedOption.value){
            if (focusedOption.name === 'account') {
			    choices = accountscache.slice(0,5).map(accountscache => ({'name': accountscache.personaname, 'value':accountscache.steamid}));
		    }

		    if (focusedOption.name === 'hero') {
			    choices = heroscache.slice(0,5).map(heroscache => ({'name': heroscache.name, 'value': heroscache.id}));
		    }
        }
        // if a value was put, grab records that start with that persons name
        else{
            if (focusedOption.name === 'account'){
                choices = accountscache.map(accountscache => ({'name': accountscache.personaname, 'value':accountscache.steamid}));
            }
            if (focusedOption.name === 'hero'){
                choices = heroscache.map(heroscache => ({'name': heroscache.name, 'value': heroscache.id}));
            }
        }

		const filtered = choices.filter(choice => choice.name.toUpperCase().startsWith(focusedOption.value.toUpperCase()));
		console.log(filtered);
        await interaction.respond(
			filtered.map(choice => ({ name: choice.name, value: choice.value.toString() })),
		);
    },


    async execute(interaction) {

        // this might take a few seconds, tell discord to hold its horses
        await interaction.deferReply();

        try {
            if (isNaN(interaction.options.getString('hero'))) {
                interaction.editReply('you did not put in a valid hero id');
            }
            if (isNaN(interaction.options.getString('account'))) {
                interaction.editReply('you did not put in a valid steam account');
            }
        }
        catch (exception) {
            interaction.editReply('did you even enter a value at all?');
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
        const unixTimestamp = Math.floor(thirtyDaysAgo.getTime() / 1000); // Convert to seconds
        

        // control flow will require multiple deadlock API calls
        // first call the  https://analytics.deadlock-api.com/v2/players/{steam ID}/match-history endpoint to find recent matches
        // then extract match ID's from match-history
        // for each match ID: call https://data.deadlock-api.com/v1/matches/{Match ID}/metadata

        // call the match history API and get metadata locally stored for purposes of populating the embed object
        const currentHero = interaction.options.getString('hero');
        const currentAccount = interaction.options.getString('account');
        const currentHeroObject = heroscache.find(choice => choice.id.toString() === currentHero);
        const currentAccountObject = accountscache.find(choice => choice.steamid === currentAccount);
        console.log('current hero: ' +currentHeroObject.name);
        console.log('current account: ' +currentAccountObject.personaname);
        const match_history_url = "https://analytics.deadlock-api.com/v2/players/" + currentAccount + "/match-history/?api_key="+process.env.DEADLOCK_API_KEY+"&min_unix_timestamp="+unixTimestamp;
        
        const singular_match_url_start = "https://analytics.deadlock-api.com/v1/matches/search?api_key="+process.env.DEADLOCK_API_KEY+"&match_info_return_fields=match_id%2Cstart_time%2Cduration_s%2Cmatch_mode%2Cgame_mode&match_player_return_fields=hero_id%2Cteam%2Ckills%2Cdeaths%2Cassists%2Cwon%2Caccount_id%2Clast_hits%2Cdenies%2Cassigned_lane%2Cnet_worth&limit=1"
 
        console.log(match_history_url);
     
        let color = 0x0099FF;

        await Vibrant.from(currentHeroObject.images.minimap_image).getPalette((err, palette) => {
        if (!err) {
            color = palette.Vibrant.getHex();    // Get the hex value of the vibrant color
            console.log(color); 
                }
        });


        var embedder = new EmbedBuilder()
            .setColor(color)
            .setTitle(currentAccountObject.personaname + "'s Recent Deadlock Encounters with " + currentHeroObject.name + ':')
            .setAuthor({
                name: currentAccountObject.personaname + ' & ' + currentHeroObject.name , iconURL: currentAccountObject.avatarfull
            })
            .setTimestamp();

        const req = new XMLHttpRequest();

        

        async function successListener() {

            // console.log(req.responseText);
            const match_hist_metadata = JSON.parse(req.responseText);
            let matches = match_hist_metadata.map (match => singular_match_url_start+"&min_match_id=" +match.match_id.toString() + "&max_match_id="+match.match_id.toString());
            //  &min_match_id=29619493&max_match_id=29619493
            // each matches element is now in a format ready for the query parameters of the deadlock api /search/ endpoint
            
        // get individual metadata for each match  
        // Use Promise.all to fetch data from all URLs concurrently
            const fetchPromises = matches.map(url =>
                fetch(url)
                .then(response => {
                    if (!response.ok) {
                    throw new Error(`Failed to fetch from ${url}`);
                    }
                    return response.json();
                })
                .catch(err => {
                    console.error(`Error fetching from ${url}:`, err);
                    return null; // Return null if fetch fails
                })
            );
    
          const match_details =  await Promise.allSettled(fetchPromises);
          const filtered_match_details = match_details.filter(result => Array.isArray(result.value) && result.value.length > 0)
          .map(result => result.value).flat();
          
          // console.log(filtered_match_details);

          function parse_match_details(match_details, match_hist_metadata){
            
              matches_with_relevant_hero = filtered_match_details.filter(match => match.players_hero_id.includes(Number(currentHero)));
              console.log('Matches with ' + currentHero);

              // used to find index within the players array because the ID's in there are not actually steam ID's
              // console.log(matches_with_relevant_hero);
              current_acct_id_deadlock = match_hist_metadata[0].account_id
              console.log(current_acct_id_deadlock);
              
              // console.log(match_hist_metadata);
              
               
              function teamFinder (match, wantDifferentPlayer, wantsameTeam)
              {
                  console.log(match.match_id + 'wantDifferentPlayer:' + wantDifferentPlayer + 'wantsameTeam: ' + wantsameTeam);
              // Ensure that currentHero and current_acct_id_deadlock are numbers (or already integers)
                const heroIndex = match.players_hero_id.indexOf(Number(currentHero));
                const acctIdIndex = match.players_account_id.indexOf(Number(current_acct_id_deadlock));
               
                console.log(heroIndex  + ' ' + match.players_team[heroIndex]);
                console.log(acctIdIndex + ' ' + match.players_team[acctIdIndex]);
             
                // Check if the two players are different (not the same player)
                const areDifferentPlayer = heroIndex !== acctIdIndex;
                console.log('different player?? ' + areDifferentPlayer);

                // Check if both players are on the same team
                const sameTeam = match.players_team[heroIndex] === match.players_team[acctIdIndex];
                console.log('same team?? ' + sameTeam);

                return (wantDifferentPlayer === areDifferentPlayer) && (wantsameTeam === sameTeam);
              }
              
              matches_with_relevant_hero_played_by_acct = matches_with_relevant_hero.filter(
                  match => {
               return teamFinder(match, false, true);
              });
            

              matches_with_relevant_hero_as_teammate = matches_with_relevant_hero.filter(
                  match => {
                  return teamFinder(match, true, true);
              });
              
              matches_with_relevant_hero_as_enemy = matches_with_relevant_hero.filter(
                  match => {
                  return teamFinder(match, true, false);
              });

              // returns the following stats in an array bc I'm lazy
              // Avg networth per Match containing current hero
              // avg kills per match containing current hero
              // avg deaths per match containing current hero
              // average assists per match containing current hero
              // average # of wins containing current hero
              // average match duration containing current hero
              function calculate_wins_and_networth(matches)
              {
                 if (matches.length === 0){
                    return [0,0,0,0,0,0];
                 }

                 const Counter = matches.reduce((Counter, currentMatch) => 
                 {
                 const heroIndex = currentMatch.players_hero_id.indexOf(Number(currentHero));
                    Counter.networth += currentMatch.players_net_worth[heroIndex], 0
                    Counter.kills += currentMatch.players_kills[heroIndex], 0
                    Counter.deaths += currentMatch.players_deaths[heroIndex], 0
                    Counter.assists += currentMatch.players_assists[heroIndex], 0
                    return Counter;
                 },{'networth': 0, 'kills': 0, 'deaths': 0,'assists':0});

                 const duration = matches.reduce((durationCounter, currentMatch) =>
                 {
                    durationCounter += currentMatch.duration_s / 60, 0
                    return durationCounter;
                 },0);

                 const wins = matches.reduce((winCounter, currentMatch) => 
                 {
                 const heroIndex = currentMatch.players_hero_id.indexOf(Number(currentHero));
                    winCounter += currentMatch.players_won[heroIndex] ? 1:0, 0
                    return winCounter;
                 },0);

                


                 return [
                     (Counter.networth / matches.length).toFixed(2).toString(), 
                     (Counter.kills / matches.length).toFixed(2).toString(),
                     (Counter.deaths / matches.length).toFixed(2).toString(),
                     (Counter.assists / matches.length).toFixed(2).toString(),
                 (duration / matches.length).toFixed(2).toString(), 
                 wins.toString()];


              }

              const [avg_net_worth_plyr, kills_per_match_plyr, deaths_per_match_plyr, assists_per_match_plyr, avg_duration_plyr, wins_plyr] = calculate_wins_and_networth(matches_with_relevant_hero_played_by_acct);
              const [avg_net_worth_mate, kills_per_match_mate, deaths_per_match_mate, assists_per_match_mate, avg_duration_mate, wins_mate] = calculate_wins_and_networth(matches_with_relevant_hero_as_teammate);
              const [avg_net_worth_enmy, kills_per_match_enmy, deaths_per_match_enmy, assists_per_match_enmy, avg_duration_enmy, wins_enmy] = calculate_wins_and_networth(matches_with_relevant_hero_as_enemy);

              console.log([avg_net_worth_plyr, wins_plyr,avg_net_worth_mate, wins_mate,avg_net_worth_enmy, wins_enmy]);



                embedder = embedder.addFields(
                    {name: '# of matches including ' + currentAccountObject.personaname + ' & a ' + currentHeroObject.name, 
                        value: matches_with_relevant_hero.length.toString()}
                );

                embedder = embedder.addFields(
                    {name: '# of matches where ' + currentAccountObject.personaname + ' was ' + currentHeroObject.name  ,
                        value: matches_with_relevant_hero_played_by_acct.length.toString() + ', won ' + wins_plyr,
                            inline: true},
                    {name: 'avg K/D/A:',
                         value: kills_per_match_plyr +' Kills/ '+ deaths_per_match_plyr + ' Deaths/' + assists_per_match_plyr + ' Assists',
                            inline: true},
                    {name: 'avg ' + currentHeroObject.name + ' net worth/duration: ',
                         value: avg_net_worth_plyr + ' souls / ' + avg_duration_plyr + ' mins',
                            inline: true},

                            { name: ' ', value: ' ' },
                );

                embedder = embedder.addFields(
                    {name: '# of matches where ally was ' + currentHeroObject.name,
                        value: matches_with_relevant_hero_as_teammate.length.toString() + ', won ' + wins_mate,
                            inline: true},
                    {name: 'avg K/D/A:',
                         value: kills_per_match_mate +' Kills/ '+ deaths_per_match_mate + ' Deaths/' + assists_per_match_mate + ' Assists',
                            inline: true},
                    {name: 'avg ' + currentHeroObject.name + ' net worth/duration: ',
                         value: avg_net_worth_mate + ' souls / ' + avg_duration_mate + ' mins',
                            inline: true},

                            { name: ' ', value: ' ' },


                );

                embedder = embedder.addFields(
                    {name: '# of matches where enemy was ' + currentHeroObject.name,
                        value: matches_with_relevant_hero_as_enemy.length.toString()+ ', enemy won ' + wins_enmy,
                            inline: true},
                    {name: 'avg K/D/A:',
                         value: kills_per_match_enmy +' Kills/ '+ deaths_per_match_enmy + ' Deaths/' + assists_per_match_enmy + ' Assists',
                            inline: true},
                    {name: 'avg ' + currentHeroObject.name + ' net worth/duration: ',
                         value: avg_net_worth_enmy + ' souls / ' + avg_duration_enmy + ' mins',
                            inline: true},

                            { name: ' ', value: ' ' },


                );
        }

        parse_match_details(match_details, match_hist_metadata);

            // return output to the embedder
            console.log('embedding...');
            embedder = embedder.setThumbnail(currentHeroObject.images.minimap_image);
            embedder = embedder.addFields({ name: 'Based on matches containing ' + currentAccountObject.personaname + ' since ' + thirtyDaysAgo.toString(), value: '('+filtered_match_details.length.toString() + ' matches found)' });
               // output to chat log
            interaction.editReply({ embeds: [embedder] });
        }


        function transferFailed(error) {
            console.error(error);
            console.log('error found');
            console.log(req.responseText);
            embedder = embedder.addFields({ name: 'error', value: "we couldn't connect to the deadlock api, try again some other time" });
            interaction.editReply({ embeds: [embedder] });
        }
        // progress on transfers from the server to the client (downloads)
        function updateProgress(event) {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                // ...
            } else {
                // Unable to compute progress information since the total size is unknown
            }
        }




        req.addEventListener("progress", updateProgress);
        req.addEventListener("load", successListener);
        req.addEventListener("error", transferFailed);
        req.open("GET", match_history_url);
        //req.open("GET", testurl);
        req.send();


    },
};