// music player

const { EmbedBuilder} = require("discord.js");

const { DisTube, isVoiceChannelEmpty } = require('distube');
const { YouTubePlugin } = require('@distube/youtube')
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
        // YouTubePlugin() must be the first element or bot will break
        plugins: [new YouTubePlugin(), new SoundCloudPlugin(), new SpotifyPlugin()], // expand video support
        joinNewVoiceChannel: false, //stay in current voice channel if called to a new one
        emitAddSongWhenCreatingQueue: true,
        emitAddListWhenCreatingQueue: true,
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
                .setDescription(`Added *${playlist.name}* (${playlist.songs.length} songs) to the queue.`);

            queue.textChannel?.send({ embeds: [embed] });
        })
        .on('error', (e, queue, song) => {
            const embed = new EmbedBuilder()
                .setColor(0xE4344C)
                .setTitle('Error')
                .setDescription(`${e.message}`);
            queue.textChannel?.send({ embeds: [embed] });
            console.log(queue.textChannel);
            console.error(e);
        })
        .on('ffmpegDebug',  e => {
            console.error(e);
        })
        .on('finish', queue => queue.textChannel?.send('Queue finished!'));
        // .on('disconnect', queue => {
        //     queue.textChannel?.send('👋 Disconnecting!');
        // });

        // discordjs event listener
        client.on('voiceStateUpdate', oldState => {
        if(!oldState?.channel) return;
        const voice = client.player.voices.get(oldState);
        if (voice && isVoiceChannelEmpty(oldState)){
            voice.leave();
        }
    });

    return distube;
}