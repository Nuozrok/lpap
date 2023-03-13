// move a song to a different position in the queue
const { SlashCommandBuilder} = require("discord.js");

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
                .setRequired(true)
        )
        .addIntegerOption(option=>
            option
                .setName('destination')
                .setDescription('The song will be moved to this position in the music queue.')
                .setMinValue(1)
                .setRequired(true)
        ),
    async execute(interaction){
        // log interaction
        console.log(`${interaction.user.username} is using the move command`);
        
        const voiceChannel = interaction.member?.voice?.channel;
        const botVoiceChannel = interaction.client.player.voices?.get(interaction)?.channel;
        let queue = interaction.client.player.getQueue(process.env.GUILD_ID);

        // make sure user is in a voice channel
        if(!voiceChannel){
            let snark = ['You must be in a voice channel to move something, you silly little troll, you.',
                        'Hey bud. Join a voice channel first, mkay?',
                        'Thats a good one. Too bad I\'m not gonna move it unless you first join a voice channel.',
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
            let snark = ['Nothing is in the queue, my guy.',
                        'You want me to move nothing?',
                        'The queue, like your visual cortex, is empty.',
                        'No, Q.'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});
        }else{

            // move song order
            const origin = interaction.options.getInteger('origin');
            const destination = interaction.options.getInteger('destination');

            const embed = new EmbedBuilder()
                .setColor(0x4A9931)
                .setTitle('Moving song')
                .addFields((
                    {
                        name: '\u200b',
                        value: `${origin}`,
                        inline: true
                    },
                    {
                        name: '\u200b',
                        value: `[${queue.songs[origin].name}](${queue.songs[origin].url})`,
                        inline: true
                    },
                    {
                        name: '\u200b',
                        value: `${queue.songs[0].formattedDuration}`,
                        inline: true
                    },
                    {
                        name: '\u200b',
                        value: `Added by <@${queue.songs[0].member.id}>`,
                        inline: true
                    },
                    {
                        name: '\u200b',
                        value: '\u200b',
                        inline: false
                    }
                ))
                .addFields((
                    {
                        name: '\u200b',
                        value: `to`,
                        inline: false
                    },
                    {
                        name: '\u200b',
                        value: `position ${destination}`,
                        inline: false
                    }
                ));

            // remove origin item and store it
            let tmp = queue.songs.splice(origin, 1)[0];
            // insert stored item into position destination
            queue.songs.splice(destination, 0, tmp);
            
            // reply to interaction
            await interaction.reply({embeds: [embed]});   
        }
    }
}