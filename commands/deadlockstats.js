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

        // call the opendota api and retrieve a message similar to the one in data/examplepangotestdurations.json folder
        const currentHero = interaction.options.getString('hero');
        const currentAccount = interaction.options.getString('account');
        const currentHeroObject = heroscache.find(choice => choice.id.toString() === currentHero);
        const currentAccountObject = accountscache.find(choice => choice.steamid === currentAccount);
        console.log('current hero: ' +currentHeroObject.name);
        console.log('current account: ' +currentAccountObject.personaname);
        const match_history_url = "https://data.deadlock-api.com/v2/players/" + currentAccount + "/match-history/";
        
        const singular_match_url = "https://analytics.deadlock-api.com/v1/matches/search?match_info_return_fields=match_id%2Cstart_time%2Cduration_s%2Cmatch_mode%2Cgame_mode&match_player_return_fields=hero_id%2Cteam%2Ckills%2Cdeaths%2Cassists%2Cwon%2Caccount_id%2Clast_hits%2Cdenies%2Cassigned_lane%2Cnet_worth&min_match_id=29619493&max_match_id=29619493&limit=1000"

        console.log(match_history_url);

        var embedder = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(currentAccountObject.personaname + "'s Recent Deadlock Encounters with this hero:")
            .setAuthor({
                name: currentHeroObject.name + ' (Hero ID ' + currentHero + ')', iconURL: currentHeroObject.images.icon_hero_card
            })
            .setTimestamp();

        const req = new XMLHttpRequest();

        function successListener() {

            // console.log(req.responseText);

            let herodata = JSON.parse(req.responseText);
            console.log(typeof (herodata));
            console.log(herodata[0]);
            //console.log(herodata.map(match => herodata.match_id));

           

            // return output to the embedder
            console.log('embedding...');
            embedder = embedder.setThumbnail(currentHeroObject.images.minimap_image);
            embedder = embedder.addFields({ name: 'overall stats', value: ' ' });
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