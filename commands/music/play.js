// play audio

const { SlashCommandBuilder} = require("discord.js");
const { getVoiceConnection, getVoiceConnections } = require("@discordjs/voice");
const path = require('node:path');

const indexPath = path.join(__dirname, '../../index.js');
const { client } = require(indexPath);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays audio from a YouTube link, Spotify link, or from a file. ' 
                        + 'If none of these are provided, the bot will play a YoutTube result for the command input. '
                        + 'Audio will be added to a queue if something is already playing.')
        .setDMPermission(false)
        .addStringOption(option=>
            option
                .setName('query')
                .setDescription('Search query')
                .setRequired(false))
        .addAttachmentOption(option => option
            .setName('file')
            .setDescription('Audio file')
            .setRequired(false)),
    async execute(interaction){
        // log interaction
        console.log(`${interaction.user.username} is using the play command`);

        // make sure user is in a voice channel
        if(!interaction.member.voice.channel){
            let snark = ['You must be in a voice channel to play something, you silly little troll, you.',
                        'Hey bud. Join a voice channel first, mkay?',
                        'Thats a good one. Too bad I\'m not gonna play it unless you first join a voice channel.',
                        'Your plea falls on deaf ears, my friend. Mayhaps if you joined a voice channel, someone could listen.'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});
        }

        // make sure user is in the same voice channel as the bot if the bot is already playing
        if(getVoiceConnections && !getVoiceConnection(interaction.member.voice.channel)){
            let snark = ['I can\'t be in two places at once. Either come join me in another channel, or make me leave.',
                        'We have to be in the same voice channel. Which is it gonna be?',
                        'I can\'t hear you over the music I\'m alread blasting in this other, better voice channel.',
                        'Thank you, Mario, but your bot is in another channel!'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});
        }
        
        // This is harder to implement if we choose to use Distube because of how queueing is handled
        /*
        // is a file attached?
        if(interaction.options.getAttachment('file')){
            const attachment = interaction.options.getAttachment('file')

            // make sure it is a media file (audio and not an image or something)
            const type = attachment.contentType();
            if(!type.includes('audio/')){
                let snark = ['My brother in Christ, I play music. What file are you even sending me?',
                        'I don\'t know much, but I know this sure as hell isn\'t an audio file.',
                        'I\'m not sure how you want me to make noises from this.',
                        'I haven\'t heard of this one. Maybe because it isn\'t something that can be heard.'];
                let randomSnark = snark[Math.floor(Math.random() * snark.length)];
                await interaction.reply({content: randomSnark, ephemeral : true});
            }else{
                const resource = attachment;
            }
        }else{
            // search for audio

        }
        */

        // play audio
        await client.player.play(interaction.member.voice.channel, interaction.options.getString('query'), {
            textChannel: interaction.channel, 
            member: interaction.member
        });

    }
};