// at the top of your file
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// inside a command, event listener, etc.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('pictureofday')
		.setDescription('Provides a picture of the day.'),

	async execute(interaction) {
		const embedder = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Soup of Day')
			.setAuthor({ name: 'BOT',  iconURL: 'https://i.imgur.com/AfFp7pu.png' })
			.setDescription('Soup of Day')
			.setImage('https://i.imgur.com/AfFp7pu.png')
			.setTimestamp()
		await interaction.reply({ content: 'picture of day', embeds: [embedder] }); },
};