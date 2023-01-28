const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// inside a command, event listener, etc.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('dotawhentoend')
		.setDescription('Checks winrate of hero in long duration matches vs short duration matches.')
		.addStringOption(option =>
			option.setName('hero')
				.setDescription('Select the hero')
				.setRequired(true)
				.addChoices(
					{ name: 'Pangolier', value: '120' },
					{ name: 'Anti Mage', value: '1' },
					{name: 'Marci', value:'136'}
				)),
	async execute(interaction) {

		// this might take a few seconds, tell discord to hold its horses
		await interaction.deferReply();

		// call the opendota api and retrieve a message similar to the one in data/examplepangotestdurations.json folder

		var url = "https://api.opendota.com/api/heroes/" + interaction.options.getString('hero') + "/durations";

		var xhr = new XMLHttpRequest();
		var herodata = {};
		xhr.open("GET", url);

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				console.log(xhr.status);
				console.log(xhr.responseText);
				console.log(typeof(xhr.responseText));
				herodata = JSON.parse(xhr.responseText);
			}
		};

		xhr.send();
				
		// process the response

		// create actual embedder
		const embedder = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Duration vs Winrate check')
			.setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
			.setDescription('based on pro matches duration data for your given hero from opendotaapi')
			.addFields({ name: 'Hero ID:', value: interaction.options.getString('hero') })
			//.addFields({name: 'matches > 5700 seconds:', value: xhr.responseText, inline:true})
			.setImage('https://www.clipartmax.com/middle/m2K9A0d3d3K9i8A0_simple-red-x-mark-free-clip-art-clipart-red-x-mark-transparent/#.Y9IRBXdDRBc.link')
			.setTimestamp()



		await interaction.editReply({ content: 'not a soup', embeds: [embedder] });
	},
};