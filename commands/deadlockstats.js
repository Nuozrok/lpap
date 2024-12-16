const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { dotenv } = require('dotenv/config');
var fs = require('fs');
// both the autocomplete and the result need to be able to reference heroscache.json
const accountscache= JSON.parse(fs.readFileSync('data/accountscache.json', 'utf8'));
const heroscache= JSON.parse(fs.readFileSync('data/deadlockherodata.json', 'utf8'));

// inside a command, event listener, etc.
module.exports = {
    data: new SlashCommandBuilder()
        .setName('deadlockstats')
        .setDescription('PLACEHOLDERTEXT')
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
        const match_history_url = "https://analytics.deadlock-api.com/v2/players/" + currentAccount + "/match-history/?has_metadata=true";
        
        const singular_match_url_start = "https://analytics.deadlock-api.com/v1/matches/search?match_info_return_fields=match_id%2Cstart_time%2Cduration_s%2Cmatch_mode%2Cgame_mode&match_player_return_fields=hero_id%2Cteam%2Ckills%2Cdeaths%2Cassists%2Cwon%2Caccount_id%2Clast_hits%2Cdenies%2Cassigned_lane%2Cnet_worth&limit=1"
 
        console.log(match_history_url);

        var embedder = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(currentAccountObject.personaname + "'s Recent Deadlock Encounters with this hero:")
            .setAuthor({
                name: currentHeroObject.name + ' (Hero ID ' + currentHero + ')', iconURL: currentHeroObject.images.icon_hero_card
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

              console.log(matches_with_relevant_hero);

              matches_with_relevant_hero.map(
                  match => {
              console.log(match.players_hero_id.indexOf(Number(currentHero)))
              console.log(match.players_account_id.indexOf(Number(currentAccount)));
              return;
              });

              console.log(match_hist_metadata);
              // interesting, the metadata does not contain the actual steam account ID of the user. instead, it contains the same account_id returned from match history
              // rest of the match data seems to match 1:1 with what shows up when I load the match on the deadlock "watch" client
              



              matches_with_relevant_hero_played_by_acct = matches_with_relevant_hero.filter(match => 
              match.players_hero_id.indexOf(Number(currentHero)) === match.players_account_id.indexOf(Number(currentAccount)));


              // TODO: now that we know which matches contained that hero, extract the relative position of that hero within the player details arrays
              // then cross-reference and use that to say: was I playing the selected hero? who won? were they on my team?
              // were they carrying the game?
                embedder = embedder.addFields({name: '# of matches including  a ' + currentHeroObject.name, 
                value: matches_with_relevant_hero.length.toString()});

                embedder = embedder.addFields({name: '# of matches where ' + currentAccountObject.personaname + " was the " + currentHeroObject.name,
                value: matches_with_relevant_hero_played_by_acct.length.toString()});
        }

        parse_match_details(match_details, match_hist_metadata);

            // return output to the embedder
            console.log('embedding...');
            embedder = embedder.setThumbnail(currentHeroObject.images.minimap_image);
            embedder = embedder.addFields({ name: 'Total # of matches analyzed', value: filtered_match_details.length.toString() });
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