// remove a song in the queue
const { InteractionContextType, SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a song from the music queue.')
        .setContexts(InteractionContextType.Guild) // dont dm the bot
        .addIntegerOption(option=>
            option
                .setName('origin')
                .setDescription('The song in this position will be removed.')
                .setMinValue(1)
                .setRequired(true)
        ),
    async execute(interaction){
        // log interaction
        console.log(`${interaction.user.username} is using the remove command`);
        
        const voiceChannel = interaction.member?.voice?.channel;
        const botVoiceChannel = interaction.client.player.voices?.get(interaction)?.channel;
        let queue = interaction.client.player.getQueue(process.env.GUILD_ID);
        
        // make sure user is in a voice channel
        if(!voiceChannel){
            let snark = ['You must be in a voice channel to remove something, you silly little troll, you.',
                        'Hey bud. Join a voice channel first, mkay?',
                        'Yeah, I\'m not a fan of that one either. Too bad I\'m not gonna remove it unless you first join a voice channel.',
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
                        'You want me to remove nothing?',
                        'The queue, like your visual cortex, is empty.',
                        'No, Q.'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});
        }else{
            const origin = interaction.options.getInteger('origin');
            const embed = new EmbedBuilder()
                .setColor(0x4A9931)
                .setTitle('Removed Song')
                .addFields(
                    {
                        name: '\u200b',
                        value: `**${origin}** \t [${queue.songs[origin].name}](${queue.songs[origin].url}) \n ${queue.songs[0].formattedDuration}, Added by <@${queue.songs[0].member.id}>`,
                        inline: false
                    }
                );

            queue.songs.splice(origin, 1);
            
            // reply to interaction
            await interaction.reply({embeds: [embed]});
        }
    }
}