// at the top of your file
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// inside a command, event listener, etc.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('pictureofday')
		.setDescription('Provides a picture of the day.'),

	async execute(interaction) {

		// TODO use a google images api to pull a bunch of soup images
		

		// create actual embedder
		const embedder = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Wants this Soup')
			.setAuthor({ name: interaction.user.username,  iconURL: interaction.user.avatarURL() })
			.setDescription('Soup of Day: ')
			.setImage('https://d7hftxdivxxvm.cloudfront.net/?height=1600&quality=50&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FyOaSKJM3HCtpqUMCG38MVA%2Fnormalized.jpg&width=1068')
			.setTimestamp()



		await interaction.reply({ content: 'picture of day', embeds: [embedder] });
	},
};