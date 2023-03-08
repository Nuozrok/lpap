// play audio

const { SlashCommandBuilder} = require("discord.js");
const { getVoiceConnection, getVoiceConnections } = require("@discordjs/voice");
const { DisTube } = require('distube');
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { SpotifyPlugin } = require('@distube/spotify');

// can play:
// youtube links
// spotify links
// soundcloud links
// more (900+ sites https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

// Create a new DisTube
const distube = new DisTube(client, {
    plugins: [new SoundCloudPlugin(), new SpotifyPlugin(), new YtDlpPlugin()], // expand video support
	searchSongs: 5, // number of options to list after search query
	searchCooldown: 30, // search canceled if query left unrefined for 30 seconds
	leaveOnEmpty: true, // leave when voice channel is empty
    emptyCooldown: 10, // leave after 10 seconds
	leaveOnFinish: false, // stay in voice channel if queue ends
	leaveOnStop: false, // stay in voice channel if issued stop command
    nsfw: true, // smut?
});

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
        distube.play(voiceChannel, interaction.options.getString('query'), {
            message,
            textChannel: message.channel,
            member: message.member,
        });

    }
};

// Queue status template
const status = queue =>
	`Volume: \`${queue.volume}%\` | Filter: \`${
		queue.filters.join(', ') || 'Off'
	}\` | Loop: \`${
		queue.repeatMode
			? queue.repeatMode === 2
				? 'All Queue'
				: 'This Song'
			: 'Off'
	}\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``;

// Distube Event Listeners
distube
	.on('playSong', (queue, song) =>
		queue.textChannel?.send(
			`Playing \`${song.name}\` - \`${
				song.formattedDuration
			}\`\nRequested by: ${song.user}\n${status(queue)}`,
		),
	)
	.on('addSong', (queue, song) =>
		queue.textChannel?.send(
			`Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`,
		),
	)
	.on('addList', (queue, playlist) =>
		queue.textChannel?.send(
			`Added \`${playlist.name}\` playlist (${
				playlist.songs.length
			} songs) to queue\n${status(queue)}`,
		),
	)
	.on('error', (textChannel, e) => {
		console.error(e);
		textChannel.send(
			`An error encountered: ${e.message.slice(0, 2000)}`,
		);
	})
	.on('finish', queue => queue.textChannel?.send('Finish queue!'))
	.on('finishSong', queue =>
		queue.textChannel?.send('Finish song!'),
	)
	.on('disconnect', queue =>
		queue.textChannel?.send('Disconnected!'),
	)
	.on('empty', queue =>
		queue.textChannel?.send(
			'The voice channel is empty! Leaving the voice channel...',
		),
	)
	// DisTubeOptions.searchSongs > 1
	.on('searchResult', (message, result) => {
		let i = 0;
		message.channel.send(
			`**Choose an option from below**\n${result
				.map(
					song =>
						`**${++i}**. ${song.name} - \`${
							song.formattedDuration
						}\``,
				)
				.join(
					'\n',
				)}\n*Enter anything else or wait 30 seconds to cancel*`,
		);
	})
	.on('searchCancel', message =>
		message.channel.send('Searching canceled'),
	)
	.on('searchInvalidAnswer', message =>
		message.channel.send('Invalid number of result.'),
	)
	.on('searchNoResult', message =>
		message.channel.send('No result found!'),
	)
	.on('searchDone', () => {});
    //.on('deleteQueue', () => {});
    //.on('initQueue', () => {});
    //.on('noRelated', () => {});