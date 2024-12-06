// JavaScript source code
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { writeFile } = require('node:fs/promises');

// inside a command, event listener, etc.
module.exports = {
    data: new SlashCommandBuilder()
        .setName('deadlockrefreshcache')
        .setDescription('Run this whenever the bot refreshes or whenever an update happens'),
    async execute(interaction) {

        // this might take a few seconds, tell discord to hold its horses
        await interaction.deferReply();

        // call the opendota api and retrieve the latest hero_names.json object
        const url = "https://assets.deadlock-api.com/v2/heroes";
        const testurl = "https://api.urbandictionary.com/v0/define?term=dota"

        console.log(url);
        const req = new XMLHttpRequest();

        function successListener() {

            console.log(req.responseText);

            let herodata = JSON.parse(req.responseText);
            console.log(typeof (herodata));
            console.log(herodata);
            try {
                writeFile('data/deadlockherodata.json', JSON.stringify(herodata));
            } catch (err) {
                interaction.editReply('error writing to file, bug michael');
            }
            interaction.editReply('Cache Refreshed!');

        }


        function transferFailed(error) {
            console.error(error);
            console.log('error found');
            console.log(req.responseText);
            interaction.editReply('we couldn\'t connect to the opendota api, try agian some other time');
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