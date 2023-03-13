// leave the voice channel
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Remove all songs from the music queue and force the bot to leave the current channel.')
        .setDMPermission(false),
    async execute(interaction){
        // log interaction
        console.log(`${interaction.user.username} is using the leave command`);

        const botVoiceChannel = interaction.client.player.voices?.get(interaction)?.channel;
        const voiceChannel = interaction.member?.voice?.channel;

        // make sure bot is connected to a voice channel
        if(!botVoiceChannel){
            let snark = ['...that\'s hurtful.',
                        'I\'m already gone. 😢',
                        'Yeah, I get it. Sorry. You don\'t have to keep saying it.',
                        'Now you\'re just being mean.'];
            let randomSnark = snark[Math.floor(Math.random() * snark.length)];
            await interaction.reply({content: randomSnark, ephemeral : true});
        
        // make sure user is in a voice channel
        }else if(!voiceChannel){
            let snark = ['You must be in a voice channel to make me leave, you silly little troll, you.',
                        'Hey bud. Join a voice channel first, mkay?',
                        'I\'m not goin anywhere unless you say it to my face. Join a voice channel first.',
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
            await interaction.reply({content: `${interaction.guild.emojis.cache.random()}`});
            interaction.client.player.voices.leave(interaction.member);
        }
    }
}