const { REST, Routes } = require('discord.js');
const { dotenv } = require('dotenv/config');
const fs = require('node:fs');
const path = require('node:path');

// Get command files
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

const commands = [];
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`${file}`);
	commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();