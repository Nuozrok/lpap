// scrapes discord history and trains a recurrent neural net on text or images
    // make sure to add the training sets to the .gitignore so as not to leak discord messages

const { SlashCommandBuilder, Collection, ChannelType, ActionRowBuilder, ChannelSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

// options - user and channel, text or image or both

// general steps - check if there is a training set, otherwise generate it
    // have the bot post a loading animation and occasionally update with mean phrases like
    // looking for @Bluetwo26 cringe posts
    // theres a lot of it...
    // this may take a while
// scrape discord logs and generate a textfile, something like <USER_ID>.log
// may need to classify posts between text, commands, images, image links, etc...
    // classifying @Bluetwo26's cringe
// use the Keras API to develop a simple GPT model (yes, that GPT) with tensorflow
// train the model using the chat logs
// generate a post
    // have the bot change its name and picture to impersonate the target (it should still have a BOT tag on it)

// npm install @tensorflow/tfjs
const tf = require('@tensorflow/tfjs');
const { filter } = require('lodash');
const fs = require('node:fs');
const path = require('node:path');
const { text } = require('body-parser');
const { decodeStream } = require('iconv-lite');

// command
module.exports = {
    data: new SlashCommandBuilder()
        .setName('cringe')
        .setDescription('Simulates a post using a recurrent neural net trained on a specific server member')
        .setDMPermission(false)
        .addSubcommand(subcommand=>
            subcommand
                .setName('post')
                .setDescription('Create a post')
                .addUserOption(option=>
                    option
                        .setName('target')
                        .setDescription('The member to simulate')
                        .setRequired(true)
                )
                /*
                .addStringOption(option=>
                    option 
                        .setName('content')
                        .setDescription('The content of the post')
                        .setRequired(true)
                        .addChoices(
                            {name:  'text', value:  'post_text'},
                            {name:  'image', value: 'post_image'},
                            //{name:  'gif', value: 'post_gif'},
                            //{name:  'video', value: 'post_video'}, // probably just pick a random video posted before instead of generating a link
                            {name:  'both', value:  'post_hybrid'},
                        )
                )*/ // Use SelectMenuBuilder() instead
        )
        .addSubcommand(subcommand=>
            subcommand
                .setName('train')
                .setDescription('Trains the neural network on the post history of a specific server member')
                .addUserOption(option=>
                    option
                        .setName('target')
                        .setDescription('The member to simulate')
                        .setRequired(true)
                )
                .addIntegerOption(option=>
                    option
                        .setName('history')
                        .setDescription('This many of the most recent posts will be used in the training set. Default 100')
                        .setMinValue(100) // needs experimenting
                        .setMaxValue(9999) // please do not break the bot, thanks
                )
        ),
    async execute(interaction){
        // log interaction
        console.log(`${interaction.user.username} is using the cringe train command`)

        let target = interaction.options.getUser('target');
        console.log(`target: ${target.username} (id: ${target.id})`);
       
        if(interaction.options.getSubcommand() === 'post'){
            // TODO
        }else if (interaction.options.getSubcommand() === 'train'){
            // retrieve options and log
            let history = interaction.options.getInteger('history') ?? 100; // default 100 messages
            console.log(`history: ${history}`);
            let channels;

            // get list of channels to retrieve messages from
            let row1 = new ActionRowBuilder()
                .addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId('channel-select')
                        .setPlaceholder('No channel selected')
                        .setMinValues(1)
                        .setMaxValues(25) // Discord API sets limit to 25. If we ever have more than 25 channels we should delete the server forever
                        .addChannelTypes(ChannelType.GuildText),
                );
            let row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('train')
                        .setLabel('Train!')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true), // enable once a channel has been selected
                    new ButtonBuilder()
                        .setCustomId('abort')
                        .setLabel('Abort!')
                        .setStyle(ButtonStyle.Danger),
                );

            let menuCollector;
            let buttonCollector;
            // wait for user to select channel(s)
            await interaction
                .reply({
                    content: `Will retrieve ${history} most recent messages from ${target.username}. Please select text channel(s) to search.`, 
                    components: [row1,row2],
                    ephemeral: false
                 })
                 // collect responses from menu and buttons (30 seconds to respond)
                .then(message => {
                    menuCollector=message.createMessageComponentCollector({componentType: ComponentType.ChannelSelect, time: 30000});
                    buttonCollector=message.createMessageComponentCollector({componentType: ComponentType.Button, time: 30000});
                })
                .catch(console.error);

            // menu collects interaction
            menuCollector.on('collect', i=>{
                // validate user interacting with message
                if (i.user.id !== interaction.user.id) {
                    i.reply({ content: `This choice isn't for you!`, ephemeral: true });
                } else {
                    menuCollector.stop();

                    // enable train button
                    row2.components[0].setDisabled(false);

                    // retrieve selection
                    channels = interaction.guild.channels.cache.filter(c => i.values.includes(c.id));
                    i.update({
                        content: `Will retrieve ${history} most recent messages from ${target.username} in ${channels.map(c => `<#${c.id}>`).join(', ')}.`,
                        components: [row2]
                    }).then(console.log('updating selection')).catch(console.error);
                }
            });

            // button collects interaction
            buttonCollector.on('collect', async i=>{
                // validate user interacting with message
                if (i.user.id !== interaction.user.id) {
                    i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
                } else {
                    try{
                        // if aborted
                        if(i.customId === 'abort'){
                            // update reply
                            buttonCollector.stop();
                            i.update({
                                content: `Training aborted by user.`,
                                components: []
                            }).then(console.log('user aborted command')).catch(console.error);
                        }else if (i.customId === 'train'){
                            // disable buttons
                            buttonCollector.stop();
                            row2 = new ActionRowBuilder().addComponents(row2.components[0]); // removes abort button
                            row2.components[0].setDisabled(true);
                            i.update({
                                components: [row2]
                            }).then(console.log(`training in channel(s) ${channels.map(c=>c.name).join(', ')}`)).catch(console.error);

                            // get collection of messages
                            let condition = m => (m.author.id === target.id && m.content); // match author and not blank message
                            let buffer = await generateChatlog(history,channels,condition);
                            
                            // remove any stray blank lines from the final text to write to file
                            let chatlog = buffer.join('\n').split('\n').filter(Boolean).join('\n');

                            // write chatlog to file
                            let loc = path.join(__dirname, `../tf/${target.id}.log`);
                            fs.writeFile(loc, chatlog, (err) => {
                                if (err)
                                    console.log(err);
                                else {
                                    console.log(`Sucessfully wrote chatlog to ${loc}`);
                                }
                            });
                            interaction.fetchReply()
                                .then(reply => reply.reply('Training set generated.'))
                                .catch(console.error);
                            // CONTINUE NEW CODE HERE
                        }
                    }catch(error){
                        console.log(error); // this will never happen
                    }
                }
            });

            // menu interaction ends
            menuCollector.on('end', (collected, reason)=>{
                // if no selection
                if(reason === 'time'){
                    // update reply
                    interaction.editReply({
                        content: `Request timed out.`,
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
                        components: []
                    }).then(console.log('command timed out')).catch(console.error);
                }
            });
        }        
    }
};

// retrieves messages from several channels (must be a collection) and sorts by date, then removes messages until the chatlog is the specified length
// messages retrieved will satisfy the boolean *condition* 
// returns array of strings
// yes, this is very inefficient. sue me
async function generateChatlog(length, channels, condition){
    let collection = new Collection();

    // for each channel, fetch messages (in parallel)
    // promise evaluates to array of collections
    let buffer = await(Promise.all(channels.map(async channel =>
        await fetchManyMessages(length, channel, condition))
    ));
    buffer.forEach(c => collection = collection.concat(c));

    // sort by date
    collection = collection.sort((a, b) => b.createdAt - a.createdAt);
    console.log('messages sorted');

    // return array with correct length
    return collection.map(m => m.content).slice(0,length);
}

// get around discord api limiting message fetch to 100
// continues to fetch until *fetchNumber* messages are found with the function to test with, *condition* (should return boolean)
// returns collection of message objects
async function fetchManyMessages(fetchNumber, channel, condition){
    // make sure you are looking for messages in a text channel
    if (( channel.type) !== ChannelType.GuildText) {
        throw new Error(`Expected text channel, got ${channel.type}.`);
    }

    console.log(`fetching ${fetchNumber} messages in ${channel.name}...`);

    let collection = new Collection();
    let lastId = null;
    let options = {};
    let remaining = fetchNumber;

    while (remaining > 0) {
        // if more than 100 remain, limit=100; else, limit=remaining
        options.limit = remaining > 100 ? 100 : remaining;
        
        // keep track of the last retrieved messages, and fetch before
        if (lastId) {
        options.before = lastId;
        }

        // fetch messages
        let messages = await channel.messages.fetch(options);
        
        // if the last element is empty (all retrieved or channel ran out of messages), then done
        if (!messages.last()) {
            break;
        }

        // update last retrieved message
        lastId = messages.last().id;

        // add messages to collection
        collection = collection.concat(messages);

        // filter messages
        collection = collection.filter(condition);

        // update countdown
        remaining = fetchNumber - collection.size;
    }
    console.log(`fetching in ${channel.name} completed!`);
    return collection;
}