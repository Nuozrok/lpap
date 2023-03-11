// fast forward in a song
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forward')
        .setDescription('Skip forward in the current song.')
        .setDMPermission(false)
        .addIntegerOption(option=>
            option
                .setName('duration')
                .setDescription('How many seconds to skip forward.')
                .setMinValue(1)
                .setRequired(True)
        ),
    async execute(interaction){
         // log interaction
         console.log(`${interaction.user.username} is using the forward command`);

        let queue = client.player.getQueue(procoess.env.GUILD_ID);
        let time = queue.currentTime;

    }
}