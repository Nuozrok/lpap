// leave the voice channel
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Remove all songs from the music queue and force the bot to leave the current channel.')
        .setDMPermission(false),
    async execute(interaction){
         // log interaction
         console.log(`${interaction.user.username} is using the leave command`);

        // check if bot is connected to a channel
        // snark
            // bro Im not even connected ...
            // ...
    }
}