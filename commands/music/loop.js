// toggle looping the queue
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggles looping mode of the songs in the music queue.')
        .setDMPermission(false)
        .addIntegerOption(option =>
			option
                .setName('mode')
				.setDescription('The type of looping the player will toggle to.')
                .addChoices(
					{ name: 'Disabled ❌', value: 0 },
					{ name: 'Single Track 🔂', value: 1 },
					{ name: 'Queue 🔁', value: 2 },
				)
                .setRequired(true)
        ),
    async execute(interaction){
        // log interaction
        console.log(`${interaction.user.username} is using the loop command`);
        
        const voiceChannel = interaction.member?.voice?.channel;
        const botVoiceChannel = interaction.client.player.voices?.get(interaction)?.channel;
        let queue = interaction.client.player.getQueue(process.env.GUILD_ID);

        // make sure user is in a voice channel
        if(!voiceChannel){
            let snark = ['You must be in a voice channel to loop the queue, you silly little troll, you.',
                        'Hey bud. Join a voice channel first, mkay?',
                        'Thats a good one. Too bad I\'m not gonna loop the queue unless you first join a voice channel.',
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
                        'If nothing is in the queue, aren\'t I already looping nothing?',
                        'The queue, like your visual cortex, is empty.',
                        'No, Q.'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});
        }else{

            queue.setRepeatMode(interaction.options.getInteger('mode'));

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

            // reply to interaction
            const embed = new EmbedBuilder()
                .setColor(0x4A9931)
                .setTitle('Toggling loop mode')
                .setDescription(`to ${loopEmoji}`);
            await interaction.reply({embeds: [embed]});
        }
    }
}