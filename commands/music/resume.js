// resume playing music
const { SlashCommandBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the music player.')
        .setDMPermission(false),
    async execute(interaction){
         // log interaction
         console.log(`${interaction.user.username} is using the resume command`);

    }
}