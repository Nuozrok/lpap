// shuffle the queue
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the position of every song in the music queue.')
        .setDMPermission(false),
    async execute(interaction){
        // log interaction
        console.log(`${interaction.user.username} is using the shuffle command`);

        const voiceChannel = interaction.member?.voice?.channelId;
        const botVoiceChannel = interaction.client.player.voices?.get(interaction)?.channelId;
        let queue = interaction.client.player.getQueue(process.env.GUILD_ID);

        // make sure user is in a voice channel
        if(!voiceChannel){
            let snark = ['You must be in a voice channel to shuffle, you silly little troll, you.',
                        'Hey bud. Join a voice channel first, mkay?',
                        'Yeah we could use a mix-up. Too bad I\'m not gonna shuffle unless you first join a voice channel.',
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
            let snark = ['Nothing is queued, my guy.',
                        'What am I supposed to do with this? There\'s no queue.',
                        'Oh wow. There\'s no queue and you just tried to do that. How embarrassing.',
                        'There\'s nothing queued right now. You must be bugged. Someone should probably patch you.'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});
        }else{

            await queue.shuffle();

            // reply to interaction
            const embed = new EmbedBuilder()
                .setColor(0x4A9931)
                .setTitle('🔀 Shuffling songs');
            await interaction.reply({embeds: [embed]});
        }
    }
}