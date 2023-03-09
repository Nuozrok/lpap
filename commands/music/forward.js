// fast forward in a song

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
        ),
    async execute(interaction){
        
    }
}