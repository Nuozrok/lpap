// move a song to a different position in the queue
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move the position of one song in the music queue.')
        .setDMPermission(false)
        .addIntegerOption(option=>
            option
                .setName('origin')
                .setDescription('The song in this position will be moved.')
                .setMinValue(1)
                .setRequired(True)
        )
        .addIntegerOption(option=>
            option
                .setName('destination')
                .setDescription('The song will be moved to this position in the music queue.')
                .setMinValue(1)
                .setRequired(True)
        ),
    async execute(interaction){
         // log interaction
         console.log(`${interaction.user.username} is using the move command`);
         
    }
}