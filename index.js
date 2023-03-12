const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { dotenv } = require('dotenv/config');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

const commandsPath = path.join(__dirname, 'commands');
const getCommandFiles = (dir) => {
    let files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        if (item.isDirectory()) {
            files = [...files, ...getCommandFiles(`${dir}/${item.name}`)];
        } else {
            files.push(`${dir}/${item.name}`);
        }
    }
    return files;
};
const commandFiles = getCommandFiles(commandsPath).filter(file => file.endsWith('.js'));

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

const configPath = path.join(__dirname, 'config');

const playercfg = require(path.join(configPath, 'playercfg.js'));

// create music player
client.player = playercfg.makePlayer(client);

// read through all the files and add them to a discord.js collection object
client.commands = new Collection();
for (const file of commandFiles) {
	const command = require(file);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
};

// read through all the files in the event folder and set up discord.js listeners to execute them when required
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(process.env.DISCORD_TOKEN);