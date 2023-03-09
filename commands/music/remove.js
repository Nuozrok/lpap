// remove a song in the queue

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a song from the music queue.')
        .setDMPermission(false)
        .addIntegerOption(option=>
            option
                .setName('origin')
                .setDescription('The song in this position will be removed.')
                .setMinValue(1)
        ),
    async execute(interaction){
        
    }
}