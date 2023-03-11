// stop playing music and clear the queue
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music player and clears the queue.')
        .setDMPermission(false),
    async execute(interaction){
         // log interaction
         console.log(`${interaction.user.username} is using the stop command`);

    }
}