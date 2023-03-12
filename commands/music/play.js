// play audio
const { SlashCommandBuilder, StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Queue audio to be played from a link or search query. ')
        .setDMPermission(false)
        .addStringOption(option=>
            option
                .setName('query')
                .setDescription('Search query')
                .setRequired(true)),
        /*.addAttachmentOption(option => option
            .setName('file')
            .setDescription('Audio file')
            .setRequired(false)),*/
    async execute(interaction){
        // log interaction
        console.log(`${interaction.user.username} is using the play command`);

        const voiceChannel = interaction.member?.voice?.channelId;
        const botVoiceChannel = interaction.client.player.voices?.get(interaction)?.channelId;
        
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
        }else{
            
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

            let query = interaction.options.getString('query');
            // if the query does not resolve to a URL, try searching
            if(!isURL(query)){
                let results = await interaction.client.player.search(query);

                // prompt user to refine search query
                let i = 0;
                const embed = new EmbedBuilder()
                    .setColor(0xABABAB)
                    .setTitle('Refine search')
                    .setDescription('Select one of the options below. Search is cancelled after 30 seconds')
                    .addFields(results.map(s => (
                        {
                            name: '\u200b',
                            value: `${++i}`,
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
                            value: `views: ${s.views}`,
                            inline: true
                        },
                        {
                            name: '\u200b',
                            value: '\u200b',
                            inline: false
                        }
                    )));
                // build buttons
                let j=0;
                const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select')
                        .setPlaceholder('Nothing selected')
                        .addOptions(results.map(s => (
                            {
                                label: `${++j}`,
                                description: `${s.name}`,
                                value: s.url,
                            }   
                        ))),
                    new ButtonBuilder()
                        .setCustomId('search')
                        .setLabel('Search')
                        .setEmoji('🔎')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('cancel')
                        .setLabel('Cancel')
                        .setEmoji('🚫')
                        .setStyle(ButtonStyle.Danger),
                );
                let menuCollector;
                let buttonCollector;
                // wait for user to select result
                await interaction
                .reply({ 
                    embeds: [embed], 
                    components: [row],
                    ephemeral: true
                })
                .then(message => {
                    menuCollector = message.createMessageComponentCollector({componentType: ComponentType.StringSelect, time: 30000});
                    buttonCollector = message.createMessageComponentCollector({componentType: ComponentType.Button, time: 30000});
                })
                .catch(console.error);
                // menu collects interaction
                menuCollector.on('collect', i=>{
                    // enable search button
                    row2.components[1].setDisabled(false);
                    
                    // update query to a url
                    query = i.values[0];
                });

                // button collects interaction
                buttonCollector.on('collect', async i=>{
                    menuCollector.stop();
                    buttonCollector.stop();
                    try{
                        // if cancelled
                        if(i.customId === 'cancel'){
                            await i.update({
                                content: 'Search cancelled!',
                                embeds: [], 
                                components: [],
                                ephemeral: true
                            });
                        }else if (i.customId === 'search'){
                            // delete reply - bot will automatically say a song has been added
                            await i.deleteReply();

                            // connect if not already connected
                            if(!botVoiceChannel){
                                interaction.client.player.voices.join(voiceChannel);
                            }

                            // play audio
                            await interaction.client.player.play(voiceChannel, query, {
                                textChannel: interaction.channel, 
                                member: interaction.member
                            });
                        }
                    }catch(error){
                        console.log(error);
                    }
            
                });

                // menu interaction ends
                menuCollector.on('end', (collected, reason)=>{
                    // if no selection
                    if(reason === 'time'){
                        // update reply
                        interaction.editReply({
                            content: `Request timed out.`,
                            embeds: [],
                            components: []
                        }).then(console.log('command timed out')).catch(console.error);
                    }
                });

                // button interaction ends
                buttonCollector.on('end', (collected, reason)=>{
                    // if no selection
                    if(reason === 'time'){
                        // update reply
                        interaction.editReply({
                            content: `Request timed out.`,
                            embeds: [],
                            components: []
                        }).then(console.log('command timed out')).catch(console.error);
                    }
                });
                
            // else original query was a URL
            }else{
                // connect if not already connected
                if(!botVoiceChannel){
                    interaction.client.player.voices.join(voiceChannel);
                }

                // play audio
                await interaction.client.player.play(voiceChannel, query, {
                    textChannel: interaction.channel, 
                    member: interaction.member
                });
            }
        }
    }
};

/**
 * Check if the string is an URL
 * @param {string} string input to validate as url
 * @returns {boolean} 
 * Only identifies http https as valid protocols
 * Shouldn't be an issue, right?
 */
 function isURL(string) {
    let url;
    try {
        url = new URL(string);
    } catch (e) {
        console.log(`\'${string}\' is not a URL`);
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }