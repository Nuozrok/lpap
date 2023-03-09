// move a song to a different position in the queue

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move the position of one song in the music queue.')
        .setDMPermission(false)
        .addIntegerOption(option=>
            option
                .setName('origin')
                .setDescription('The song in this position will be moved.')
                .setMinValue(1)
        )
        .addIntegerOption(option=>
            option
                .setName('destination')
                .setDescription('The song will be moved to this position in the music queue.')
                .setMinValue(1)
        ),
    async execute(interaction){
        
    }
}