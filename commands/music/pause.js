// pause playing music
const { InteractionContextType, SlashCommandBuilder, EmbedBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the music player.')
        .setContexts(InteractionContextType.Guild), // dont dm the bot
    async execute(interaction){
        // log interaction
        console.log(`${interaction.user.username} is using the pause command`);

        const voiceChannel = interaction.member?.voice?.channel;
        const botVoiceChannel = interaction.client.player.voices?.get(interaction)?.channel;
        let queue = interaction.client.player.getQueue(process.env.GUILD_ID);

        // make sure user is in a voice channel
        if(!voiceChannel){
            let snark = ['You must be in a voice channel to pause something, you silly little troll, you.',
                        'Hey bud. Join a voice channel first, mkay?',
                        'Yeah, we could use a break. Too bad I\'m not gonna pause unless you first join a voice channel.',
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

        // make sure the player isn't paused
        }else if(queue.paused){
            let snark = ['It\'s all in your head, pal. The player is already paused.',
                        'You want me to pause the music that\'s already paused?',
                        'Oh wow. There\'s no music playing and you just tried to pause it. How embarrassing.',
                        'If you are hearing noises, then maybe you should see a doctor. The player is already paused.'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});
        }else{

            // pause player
            queue.pause();
            
            // reply to interaction
            const embed = new EmbedBuilder()
                .setColor(0x4A9931)
                .setTitle('⏸️ Player paused');
            await interaction.reply({embeds: [embed]});
        }
    }
}