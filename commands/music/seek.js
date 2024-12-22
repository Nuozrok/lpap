// skip to a particular time in the song
const { InteractionContextType, SlashCommandBuilder, EmbedBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Move to a particular time in the current song.')
        .setContexts(InteractionContextType.Guild) // dont dm the bot
        .addIntegerOption(option=>
            option
                .setName('s')
                .setDescription('The second mark to skip to.')
                .setMinValue(1)
                .setRequired(true)
        )
        .addIntegerOption(option=>
            option
                .setName('m')
                .setDescription('The minute mark to skip to.')
                .setMinValue(1)
                .setRequired(false)
        )
        .addIntegerOption(option=>
            option
                .setName('h')
                .setDescription('The hour mark to skip to.')
                .setMinValue(1)
                .setRequired(false)
        ),
    async execute(interaction){
        // log interaction
        console.log(`${interaction.user.username} is using the seek command`);

        const voiceChannel = interaction.member?.voice?.channel;
        const botVoiceChannel = interaction.client.player.voices?.get(interaction)?.channel;
        let queue = interaction.client.player.getQueue(process.env.GUILD_ID);

        // make sure user is in a voice channel
        if(!voiceChannel){
            let snark = ['You must be in a voice channel to skip to a different time, you silly little troll, you.',
                        'Hey bud. Join a voice channel first, mkay?',
                        'Thats a good one. Too bad I\'m not gonna skip there unless you first join a voice channel.',
                        'Your plea falls on deaf ears, my friend. Mayhaps if you joined a voice channel, someone could listen.'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});

        // make sure user is in the same voice channel as the bot if the bot is already playing
        }else if(botVoiceChannel && ! (voiceChannel === botVoiceChannel) ){
            let snark = ['I can\'t be in two places at once. Either come join me in another channel, or make me leave.',
                        'We have to be in the same voice channel. Which is it gonna be?',
                        'I can\'t hear you over the music I\'m alread blasting in this other, better voice channel.',
                        'Thank you, Mario, but your bot is in another channel!'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});

        // make sure there is a queue
        }else if(!queue){
            let snark = ['Nothing is playing, my guy.',
                        'What am I supposed to do with this? There\'s no song playing.',
                        'Oh wow. There\'s no song playing and you just tried to do that. How embarrassing.',
                        'There\'s no song playing right now. You must be bugged. Someone should probably patch you.'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});
        }else{

            // make sure to convert hours+minutes (if selected) to seconds before passing to distube
            const hours=interaction.options.getInteger('h') ?? 0;
            const minutes=interaction.options.getInteger('m') ?? 0;
            const seconds=interaction.options.getInteger('s');
            const time = 60*60*hours + 60*minutes + seconds;

            queue.seek(time);

            // reply to interaction
            const embed = new EmbedBuilder()
                .setColor(0x4A9931)
                .setTitle('Skipping to')
                .setDescription(`${hours}:${minutes}:${seconds}`);
            await interaction.reply({embeds: [embed]});
        }
    }
}