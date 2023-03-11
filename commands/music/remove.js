// remove a song in the queue
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a song from the music queue.')
        .setDMPermission(false)
        .addIntegerOption(option=>
            option
                .setName('origin')
                .setDescription('The song in this position will be removed.')
                .setMinValue(1)
                .setRequired(True)
        ),
    async execute(interaction){
         // log interaction
         console.log(`${interaction.user.username} is using the remove command`);
        
    }
}