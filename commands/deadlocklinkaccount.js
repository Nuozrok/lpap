const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { dotenv } = require('dotenv/config');
var fs = require('fs');
// both the autocomplete and the result need to be able to reference heroscache.json
const accountscache= JSON.parse(fs.readFileSync('data/accountscache.json', 'utf8'));
const { writeFile } = require('node:fs/promises');


// inside a command, event listener, etc.
module.exports = {
    data: new SlashCommandBuilder()
        .setName('deadlockaddaccount')
        .setDescription('Tell the bot to care about a deadlock person')
        .addStringOption(option =>
            option.setName('account')
                .setDescription('Enter the Steam URL of the person you want to run deadlock stats on.')
                .setRequired(true)
                
        ),
    
    async execute(interaction) {

        // this might take a few seconds, tell discord to hold its horses
        await interaction.deferReply();

        try {
            if (isNaN(interaction.options.getString('account').match(/profiles\/(\d+)/)[1])) {
                interaction.editReply('you did not put in a valid steam account id did you');
            }
        }
        catch (exception) {
            interaction.editReply('did you even enter a value at all?');
        }

        const steamProfileUrl = interaction.options.getString('account');
        const currentAccount = steamProfileUrl.match(/profiles\/(\d+)/)[1]; // Extracts Steam ID from profile URL
        const url = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/'+ '?key=' + process.env.STEAM_API_KEY+'&steamids='+ currentAccount ;
        console.log(url);
        
        
        const req = new XMLHttpRequest();

        function successListener() {

            console.log(req.responseText);

            let currentaccountdata = JSON.parse(req.responseText);
            // console.log(typeof (currentaccountdata));
            console.log(currentaccountdata);

            /* currentaccountdata contains the steam profile info of the selected player 
            */
            currentperson = currentaccountdata.response.players[0]
            
            UserAlreadyInConfig = accountscache.players.find( user => user.steamid === currentAccount);
            let verdict_message = '';

            if (UserAlreadyInConfig ){
                verdict_message = 'Well LPAP bot already knows about this user so no need to add anything.';
            }
            else {
                verdict_message = 'added to file';

                accountscache.players.push(currentperson);
                writeFile('data/accountscache.json', JSON.stringify(accountscache.players),'utf8');
                
            }

            const personastatemappings = {
                0: 'Offline',
                1: 'Online',
                2: 'Busy',
                3: 'Away',
                4: 'Snooze',
                5: 'Looking to Trade',
                6: 'Looking to Play',
                7: 'In a Game'
            }


            var embedder = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('LPAP bot knows the following about this user:')
                .setAuthor({
                    name: currentperson.personaname, iconURL: currentperson.avatar
                })
                .addFields({ name: 'Their Steam Profile: ' + currentperson.profileurl, value: ' ' })
                .addFields({name: 'this user is currently: ' + personastatemappings[currentperson.personastate], value: verdict_message})
                .setTimestamp();




            // output to chat log
            interaction.editReply({ embeds: [embedder] });
        }


        function transferFailed(error) {
            console.error(error);
            console.log('error found');
            console.log(req.responseText);
            embedder = embedder.addFields({ name: 'error', value: "we couldn't connect to the steam api, try again some other time" });
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
        req.open("GET", url);
        //req.open("GET", testurl);
        req.send();


    },
};