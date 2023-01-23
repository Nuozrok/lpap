// scrapes discord history and trains a recurrent neural net on text or images
    // make sure to add the training sets to the .gitignore so as not to leak discord messages

const { SlashCommandBuilder, InteractionResponse, Collection, ChannelType } = require("discord.js");

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
                )
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
                .addChannelOption(option=>
                    option
                        .setName('channel')
                        .setDescription('Simulate posts only from this text channel')
                        // only allow text channel options
                        .addChannelTypes(ChannelType.GuildText)
                )
                .addIntegerOption(option=>
                    option
                        .setName('history')
                        .setDescription('This many of the most recent posts will be used in the training set. Type 0 for full history.')
                        // please do not break the bot, thanks
                        .setMaxValue(9999)
                )
        ),
    async execute(interaction){
        await interaction.reply('TEST!');
        const target = interaction.options.getUser('target');
        
        if(interaction.options.getSubcommand()=='post'){
            // TODO
            // check if there is a model
        }else if (InteractionResponse.options.getSubcommand() == 'train'){
            // create chat log
            const history = interaction.options.getNumber('history') ?? 100; // default 100 messages
            if(!interaction.options.getChannel('channel') == null){
                const channel = interaction.options.getChannel('channel'); // use specific channel
                await interaction.reply(channel);
            }else{
                // get all channels
                const channels = interaction.guild.channels.fetch();
                // get text channels
                channels = channels.map((c) => c.type === "GUILD_TEXT");
                for(c in channels){
                    await interaction.reply(channels);
                }
            }
            
        }

        
    }
};