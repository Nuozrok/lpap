// leave the voice channel

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Remove all songs from the music queue and force the bot to leave the current channel.')
        .setDMPermission(false),
    async execute(interaction){
        // check if bot is connected to a channel
        // snark
            // bro Im not even connected ...
            // ...
    }
}