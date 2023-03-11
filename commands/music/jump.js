// jump to a specific position in the queue
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jump')
        .setDescription('Jump to a specific position in the music queue.')
        .setDMPermission(false)
        .addIntegerOption(option=>
            option
                .setName('duration')
                .setDescription('How many seconds to skip forward.')
                .setRequired(True)
        ),
    async execute(interaction){
         // log interaction
         console.log(`${interaction.user.username} is using the jump command`);
        
    }
}