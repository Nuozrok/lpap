// print a list of songs in the queue

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Print the music queue.')
        .setDMPermission(false),
    async execute(interaction){
         // log interaction
         console.log(`${interaction.user.username} is using the queue command`);

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

        // make sure there is a queue
        let queue = interaction.client.player.getQueue(process.env.GUILD_ID);
        if(!queue){
            let snark = ['Nothing is in the queue, my guy.',
                        'Here is where I would list all songs in the queue - if I had any.',
                        'The queue, like your visual cortex, is empty.',
                        'No, Q.'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});
        }
        
        // build embed
        let currentPage = 0;
        let songsPerPage = 10;
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
                    .setStyle(ButtonStyle.Secondary),
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
        await interaction
            .reply({ 
                embeds: [embed], 
                components: [queue.songs.length > songsPerPage ? row : null] // do not need buttons if there is one page
            })
            .then(message => {
                buttonCollector = message.createMessageComponentCollector({componentType: ComponentType.Button});
            })
            .catch(console.error);
        
        // button collects interaction
        buttonCollector.on('collect', i=>{
            try{
                switch(i.customId){
                    case 'first':
                        currentPage = 0;
                        row.components[0].setDisabled(true);
                        row.components[1].setDisabled(true);
                        if(row.components[2].disabled){
                            row.components[2].setDisabled(false);
                        }
                        if(row.components[3].disabled){
                            row.components[3].setDisabled(false);
                        }
                        break;
                    case 'back':
                        currentPage--;
                        if(currentPage == 0){
                            row.components[0].setDisabled(true);
                            row.components[1].setDisabled(true);
                        }
                        if(row.components[2].disabled){
                            row.components[2].setDisabled(false);
                        }
                        if(row.components[3].disabled){
                            row.components[3].setDisabled(false);
                        }
                        break;
                    case 'next':
                        currentPage++;
                        if(row.components[0].disabled){
                            row.components[0].setDisabled(false);
                        }
                        if(row.components[1].disabled){
                            row.components[1].setDisabled(false);
                        }
                        if(currentPage == Math.ceil(queue.length/songsPerPage)){
                            row.components[2].setDisabled(true);
                            row.components[3].setDisabled(true);
                        }
                        break;
                    case 'last':
                        currentPage = Math.ceil(queue.length/songsPerPage);
                        if(row.components[0].disabled){
                            row.components[0].setDisabled(false);
                        }
                        if(row.components[1].disabled){
                            row.components[1].setDisabled(false);
                        }
                        row.components[2].setDisabled(true);
                        row.components[3].setDisabled(true);
                        break;
                    default:
                        console.log(`unknown button id: ${i.customId}`);
                }
                i.update({
                    embeds: [generateEmbed(queue, currentPage, songsPerPage)],
                    components: row
                });
            }catch(error){
                console.log(error);
            }
        });
    }
}

/**
 * Creates an embed of queued music, splitting songs onto multiple pages.
 * @param {number} page The page number to generate.
 * @returns {<EmbedBuilder>}
 */
 const generateEmbed = (queue, page, songsPerPage) => {
    const songs = queue.songs.slice(page*songsPerPage+1,songsPerPage+1);
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
        .addFields((
            {
                name: 'Now Playing:',
                value: '\u200b',
                inline: true
            },
            {
                name: '\u200b',
                value: `[${queue.songs[0].name}](${queue.songs[0].url})`,
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
        .addFields(songs.map(s => (
            {
                name: 'Next',
                value: `${songs.indexOf(s)}`,
                inline: true
            },
            {
                name: '\u200b',
                value: `[${s.name}](${s.url})`,
                inline: true
            },
            {
                name: '\u200b',
                value: `${s.formattedDuration}`,
                inline: true
            },
            {
                name: '\u200b',
                value: `Added by <@${s.member.id}>`,
                inline: true
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: false
            }
        )))
        .addFields({ name: 'Queue length', value: queue.formattedDuration, inline: false })
        .addFields({ name: 'Loop mode', value: loopEmoji, inline: false })
        .addFields({ name: 'Player status', value: playerEmoji, inline: false })
        .setFooter( {text: `Page ${page} of ${Math.ceil(queue.length/songsPerPage)}`});
    
}