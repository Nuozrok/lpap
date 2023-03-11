// skip to the next song in the queue
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip to the next song in the music queue.')
        .setDMPermission(false),
    async execute(interaction){
         // log interaction
         console.log(`${interaction.user.username} is using the skip command`);

    }
}