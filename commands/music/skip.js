// skip to the next song in the queue

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip to the next song in the music queue.')
        .setDMPermission(false),
    async execute(interaction){
        
    }
}