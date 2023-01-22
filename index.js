const { Client, Events, GatewayIntentBits } = require('discord.js');
const { dotenv } = require('dotenv/config');


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
	console.log(`Ready! logged in as ${c.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);