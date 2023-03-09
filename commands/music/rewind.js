// skip backward in the playing song

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rewind')
        .setDescription('Skip backward in the current song.')
        .setDMPermission(false)
        .addIntegerOption(option=>
            option
                .setName('duration')
                .setDescription('How many seconds to skip backward.')
                .setMinValue(1)
        ),
    async execute(interaction){
        
    }
}