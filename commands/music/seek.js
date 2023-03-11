// skip to a particular time in the song
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Move to a particular time in the current song.')
        .setDMPermission(false)
        .addIntegerOption(option=>
            option
                .setName('[h]')
                .setDescription('The hour mark to skip to.'
                    +'May exceed 24 hours, the bot will automatically convert (please have mercy).')
                .setMinValue(1)
                .setRequired(false)
        )
        .addIntegerOption(option=>
            option
                .setName('[m]')
                .setDescription('The minute mark to skip to.'
                    +'May exceed 60 minutes, the bot will automatically convert.')
                .setMinValue(1)
                .setRequired(false)
        )
        .addIntegerOption(option=>
            option
                .setName('[s]')
                .setDescription('The second mark to skip to.' 
                    +'May exceed 60 seconds, the bot will automatically convert.')
                .setMinValue(1)
                .setRequired(true)
        ),
    async execute(interaction){
         // log interaction
         console.log(`${interaction.user.username} is using the seek command`);

        // make sure to convert hours+minutes (if selected) to seconds before passing to distube

    }
}