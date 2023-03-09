// music player
const { DisTube } = require('distube');
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { SpotifyPlugin } = require('@distube/spotify');

// can play:
// youtube links
// spotify links
// soundcloud links
// more (900+ sites https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

// Create a new DisTube music player
const distube = new DisTube(client, {
    plugins: [new SoundCloudPlugin(), new SpotifyPlugin(), new YtDlpPlugin()], // expand video support
	searchSongs: 5, // number of options to list after search query
	searchCooldown: 30, // search canceled if query left unrefined for 30 seconds
	leaveOnEmpty: true, // leave when voice channel is empty
    emptyCooldown: 10, // leave after 10 seconds
	leaveOnFinish: false, // stay in voice channel if queue ends
	leaveOnStop: false, // stay in voice channel if issued stop command
    joinNewVoiceChannel: false, //stay in current voice channel if called to a new one
    nsfw: true, // smut?
});

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

// DisTube Event Listeners
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

    module.exports = { distube };