// toggle looping the queue

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggles looping songs in the music queue.')
        .setDMPermission(false),
    async execute(interaction){
        
    }
}