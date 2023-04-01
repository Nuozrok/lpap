// print a list of songs in the queue

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Print the music queue.')
        .setDMPermission(false),
    async execute(interaction){
         // log interaction
         console.log(`${interaction.user.username} is using the queue command`);

        const voiceChannel = interaction.member?.voice?.channel;
        const botVoiceChannel = interaction.client.player.voices?.get(interaction)?.channel;
        let queue = interaction.client.player.getQueue(process.env.GUILD_ID);

        // make sure user is in a voice channel
        if(!voiceChannel){
            let snark = ['You must be in a voice channel to play something, you silly little troll, you.',
                        'Hey bud. Join a voice channel first, mkay?',
                        'Thats a good one. Too bad I\'m not gonna play it unless you first join a voice channel.',
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
                        'Here is where I would list all songs in the queue - if I had any.',
                        'The queue, like your visual cortex, is empty.',
                        'No, Q.'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});
        }else{
            
            // build embed
            let currentPage = 1;
            const songsPerPage = 10;
            let embed = generateEmbed(queue, currentPage, songsPerPage);

            // build buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('first')
                        .setLabel('First')
                        .setEmoji('⏮️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('back')
                        .setLabel('Back')
                        .setEmoji('⏪')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setEmoji('⏩')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('last')
                        .setLabel('Last')
                        .setEmoji('⏭️')
                        .setStyle(ButtonStyle.Secondary),
                );        

            // reply to interaction
            component = queue.songs.length > songsPerPage ? [row] : [];  // do not need buttons if there is one page
            await interaction
                .reply({ 
                    embeds: [embed], 
                    components: component
                })
                .then(message => {
                    buttonCollector = message.createMessageComponentCollector({componentType: ComponentType.Button});
                })
                .catch(console.error);
            
            // button collects interaction
            buttonCollector.on('collect', async i=>{
                try{
                    switch(i.customId){
                        case 'first':
                            currentPage = 1;
                            row.components[0].setDisabled(true);
                            row.components[1].setDisabled(true);
                            row.components[2].setDisabled(false);
                            row.components[3].setDisabled(false);
                            break;
                        case 'back':
                            currentPage--;
                            if(currentPage == 1 ){
                                row.components[0].setDisabled(true);
                                row.components[1].setDisabled(true);
                            }
                            row.components[2].setDisabled(false);
                            row.components[3].setDisabled(false);
                            
                            break;
                        case 'next':
                            currentPage++;
                            row.components[0].setDisabled(false);
                            row.components[1].setDisabled(false);
                            if(currentPage == Math.ceil(queue.songs.length/songsPerPage)){
                                row.components[2].setDisabled(true);
                                row.components[3].setDisabled(true);
                            }
                            break;
                        case 'last':
                            currentPage = Math.ceil(queue.songs.length/songsPerPage);
                            row.components[0].setDisabled(false);
                            row.components[1].setDisabled(false);
                            row.components[2].setDisabled(true);
                            row.components[3].setDisabled(true);
                            break;
                        default:
                            console.log(`unknown button id: ${i.customId}`);
                    }
                    embed = generateEmbed(queue, currentPage, songsPerPage);
                    await i.update({
                        embeds: [embed],
                        components: [row]
                    });
                }catch(error){
                    console.log(error);
                }
            });
        }
    }
}

/**
 * Creates an embed of queued music, splitting songs onto multiple pages.
 * @param {number} queue The music queue object.
 * @param {number} page The page number to generate.
 * @param {number} songsPerPage The number of songs to print on each page.
 * @returns {<EmbedBuilder>}
 */
 const generateEmbed = (queue, page, songsPerPage) => {
    const songs = queue.songs.slice((page-1)*songsPerPage+1,page*songsPerPage+1);
    let loopEmoji = '';
    switch(queue.repeatMode){
        case 0:
            loopEmoji = '❌';
            break;
        case 1:
            loopEmoji = '🔂';
            break;
        case 2:
            loopEmoji = '🔁';
            break;
    }
    let playerEmoji = '';
    if(queue.paused){
        playerEmoji = '⏸️'
    }else{
        playerEmoji = '▶️';
    }
    return new EmbedBuilder()
        .setColor(0xABABAB)
        .setTitle('Music Queue')
        .addFields(
            {
                name: 'Now Playing:',
                value: `[${queue.songs[0].name}](${queue.songs[0].url}) \n ${queue.songs[0].formattedDuration}, \t Added by <@${queue.songs[0].member.id}>`,
                inline: false
            },
            {
                name: '\u200b',
                value: '**Next**',
                inline: false
            }
        )
        .addFields(songs.map(s => (
            {
                name: '\u200b',
                value: `${songs.indexOf(s)+songsPerPage*(page-1)+1} \t [${s.name}](${s.url}) \n ${s.formattedDuration}, \t Added by <@${s.member.id}>`,
                inline: false
            }
        )))
        .setThumbnail(queue.songs[0].thumbnail)
        .addFields({ name: 'Queue length', value: queue.formattedDuration, inline: false })
        .addFields({ name: 'Loop mode', value: loopEmoji, inline: false })
        .addFields({ name: 'Player status', value: playerEmoji, inline: false })
        .setFooter( {text: `Page ${page} of ${Math.ceil(queue.songs.length/songsPerPage)}`});
    
}