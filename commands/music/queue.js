// print a list of songs in the queue

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Print the music queue.')
        .setDMPermission(false),
    async execute(interaction){

    }
}