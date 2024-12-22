const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { dotenv } = require('dotenv/config');
var fs = require('fs');
// both the autocomplete and the result need to be able to reference heroscache.json
const hayesdata= fs.readFileSync('data/hayesdata.txt', 'utf8');


// inside a command, event listener, etc.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('hayes')
		.setDescription('Lose the Game'),

	async execute(interaction) {

		
		// JavaScript source code
		// Sample JSON structure

		// Function to split text into sentences
		function splitIntoSentences(text) {
		  // Simple regex to split by punctuation and whitespace, ensuring we don't split at abbreviations like "U.S."
				return text.split(/\n+/).map(sentence => sentence.trim());
		}

		// Function to retrieve 5 random consecutive sentences
		function getRandomConsecutiveSentences(wikitext) {
		  const sentences = splitIntoSentences(wikitext);
		  const maxIndex = sentences.length - 5; // Ensure there are at least 5 sentences left from the random index

		  if (maxIndex < 0) {
			console.log("Not enough sentences in the text.");
			return [];
		  }

		  // Get a random starting index for the 5 consecutive sentences
		  const startIndex = Math.floor(Math.random() * (maxIndex + 1));

		  // Slice the 5 consecutive sentences
		  return sentences.slice(startIndex, startIndex + 1);
		}

		// Get 5 random consecutive sentences
		const randomSentences = getRandomConsecutiveSentences(hayesdata);

		// Output the result
		console.log(randomSentences.join(' '));


		// create actual embedder
		const embedder = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('loses to this Hayes')
			.setAuthor({ name: interaction.user.username,  iconURL: interaction.user.avatarURL() })
			.setDescription(randomSentences.join(' '))
			.setImage('https://assets.deadlock-api.com/images/hud/hero_portraits/haze_hud.png')
			.setTimestamp()
			


		await interaction.reply({ content: 'Hayes Hayes Hayes', embeds: [embedder] });
	},
};