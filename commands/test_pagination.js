// at the top of your file
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const buttonPages = require("../functions/pagination");

// inside a command, event listener, etc.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('paginationtest')
		.setDescription('Provides a picture of the day.'),

	async execute(interaction) {

		// TODO use a google images api to pull a bunch of soup images
		

		// create actual embedder
		const embedder1 = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Wants this Soup')
			.setAuthor({ name: interaction.user.username,  iconURL: interaction.user.avatarURL() })
			.setDescription('Soup of Day: ')
			.setImage('https://d7hftxdivxxvm.cloudfront.net/?height=1600&quality=50&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FyOaSKJM3HCtpqUMCG38MVA%2Fnormalized.jpg&width=1068')
			.setTimestamp()

		const embedder2 = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Wants this Soup')
			.setAuthor({ name: interaction.user.username,  iconURL: interaction.user.avatarURL() })
			.setDescription('Soup of Tomorrow: ')
			.setImage('https://www.inspiredtaste.net/wp-content/uploads/2018/10/Homemade-Vegetable-Soup-Recipe-2-1200.jpg')
			.setTimestamp()

		const pages = [embedder1, embedder2];

		buttonPages(interaction, pages);
		// await interaction.reply({ content: 'picture of day', embeds: [embedder1, embedder2] });
	},
};