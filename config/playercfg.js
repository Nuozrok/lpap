// music player

const { EmbedBuilder} = require("discord.js");

const { DisTube } = require('distube');
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { SpotifyPlugin } = require('@distube/spotify');

// can play:
// youtube links
// spotify links
// soundcloud links
// more (900+ sites https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

module.exports.makePlayer = function (client){
    // Create a new DisTube music player
    const distube = new DisTube(client, {
        plugins: [new SoundCloudPlugin(), new SpotifyPlugin({emitEventsAfterFetching: true}), new YtDlpPlugin()], // expand video support
        searchSongs: 5, // number of options to list after search query
        searchCooldown: 30, // search canceled if query left unrefined for 30 seconds
        leaveOnEmpty: true, // leave when voice channel is empty
        emptyCooldown: 10, // leave after 10 seconds
        leaveOnFinish: false, // stay in voice channel if queue ends
        leaveOnStop: false, // stay in voice channel if issued stop command
        joinNewVoiceChannel: false, //stay in current voice channel if called to a new one
        nsfw: true, // smut?
    });

    // DisTube Event Listeners
    distube
        .on('playSong', (queue, song) => {
            const embed = new EmbedBuilder()
                .setColor(0x5499A6)
                .setTitle('Now Playing')
                .addFields((
                    {
                        name: '\u200b',
                        value: `[${song.name}](${song.url}) \n ${song.formattedDuration}, \t Added by <@${song.member.id}>`,
                        inline: false
                    }
                ))
                .setThumbnail(song.thumbnail);
            queue.textChannel?.send({ embeds: [embed] });
        })
        .on('addSong', (queue, song) => {
            const embed = new EmbedBuilder()
                .setColor(0x4A9931)
                .setTitle('Queued')
                .addFields((
                    {
                        name: '\u200b',
                        value: `[${song.name}](${song.url}) \n ${song.formattedDuration}, \t Added by <@${song.member.id}>`,
                        inline: false
                    }
                ))
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `In position ${queue.songs.indexOf(song)}`});
            queue.textChannel?.send({ embeds: [embed] });
        })
        .on('addList', (queue, playlist) => {
            const embed = new EmbedBuilder()
                .setColor(0x4A9931)
                .setTitle('Queued')
                .setDescription(`Added ${playlist.name} (${playlist.songs.length} songs) to the queue.`);

            queue.textChannel?.send({ embeds: [embed] });
        })
        .on('error', (textChannel, e) => {

            const embed = new EmbedBuilder()
                .setColor(0xE4344C)
                .setTitle('Error')
                .setDescription(`${e.message.slice(0, 2000)}`);

            textChannel.send({ embeds: [embed] });
            console.error(e);
        })
        .on('finish', queue => queue.textChannel?.send('Queue finished!'))
        //.on('finishSong', queue =>{});
        .on('disconnect', queue => {
            queue.textChannel?.send('👋 Disconnecting!');
        })
        .on('empty', queue => {
            queue.textChannel?.send('👀 Where did everybody go?');
        });
        //.on('searchResult', (message, result) => {})
        //.on('searchCancel', message => {});
        //.on('searchInvalidAnswer', message => {});
        //.on('searchNoResult', message => {});
        //.on('searchDone', () => {});
        //.on('deleteQueue', () => {});
        //.on('initQueue', () => {});
        //.on('noRelated', () => {});
    return distube;
}