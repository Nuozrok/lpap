// JavaScript source code
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { writeFile } = require('node:fs/promises');

// inside a command, event listener, etc.
module.exports = {
    data: new SlashCommandBuilder()
        .setName('deadlockpatchnotes')
        .setDescription('Run this to see deadlock patch notes'),
    async execute(interaction) {

        // this might take a few seconds, tell discord to hold its horses
        await interaction.deferReply();

        // call the opendota api and retrieve the latest hero_names.json object
        const url = "https://data.deadlock-api.com/v1/patch-notes";
        // const testurl = "https://api.urbandictionary.com/v0/define?term=dota"

        console.log(url);
        const req = new XMLHttpRequest();

        function successListener() {

            console.log(req.responseText);

            let patchnotes = JSON.parse(req.responseText);
            console.log(typeof (patchnotes));
            console.log(patchnotes);
            try {
                writeFile('data/deadlock_patch_notes.json', JSON.stringify(patchnotes));
            } catch (err) {
                interaction.editReply('error writing to file, bug michael');
            }
            interaction.editReply('Deadlock Patch Notes Obtained!');

        }


        function transferFailed(error) {
            console.error(error);
            console.log('error found');
            console.log(req.responseText);
            interaction.editReply('we couldn\'t connect to the deadlock api, try agian some other time');
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