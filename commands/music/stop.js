// stop playing music

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the music player.')
        .setDMPermission(false),
    async execute(interaction){

    }
}