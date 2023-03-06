// connects to the voice channel the user is in and plays music
// disconnect after 30 min of inactivity
// disconnect if no one is in the voice channel

const { SlashCommandBuilder} = require("discord.js");
const { getVoiceConnection, getVoiceConnections, joinVoiceChannel, NoSubscriberBehavior } = require("@discordjs/voice");

// can play:
// youtube links
// spotify links
// uploaded files

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays audio from a YouTube link, Spotify link, or from a file. ' 
                        + 'If none of these are provided, the bot will play a YoutTube result for the command input. '
                        + 'Audio will be added to a queue if something is already playing.')
        .setDMPermission(false)
        .addStringOption(option=>
            option
                .setName('link')
                .setDescription('URL or file to play audio from')
                .setRequired(true)),
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
                        'Thank you, Mario, but our bot is in another channel!'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});
        }
        
        // connct to channel if there is not already a connection
        if(!getVoiceConnections()){
            const connection = joinVoiceChannel({
                channelId: interaction.member.voice.channel.channelId,
                guildId: interaction.member.voice.channel.guild.id,
                adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator
            });
        }else{
            const connection = getVoiceConnection(interaction.member.voice.channel.guild.id);
        }

        // search for audio


        resource = ;

        // play audio
        player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            }
        })
        player.play(resource);
        connection.subscribe(player);

        // send message

        // update message when song ends
        
    }
};