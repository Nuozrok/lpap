// skip backward in the playing song
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rewind')
        .setDescription('Skip backward in the current song.')
        .setDMPermission(false)
        .addIntegerOption(option=>
            option
                .setName('duration')
                .setDescription('How many seconds to skip backward.')
                .setMinValue(1)
                .setRequired(True)
        ),
    async execute(interaction){
         // log interaction
         console.log(`${interaction.user.username} is using the rewind command`);

    }
}