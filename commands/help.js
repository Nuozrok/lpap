// link to github
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Links you to the command list wiki page and issue tracker.'),
	async execute(interaction) {
        // log interaction
        console.log(`${interaction.user.username} is using the help command`);

        // create embed
        const embed = new EmbedBuilder()
        .setColor(0x4A9931)
        .setAuthor({name: 'GitHub', iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', url: 'https://github.com/Nuozrok/lpap'})
        .addFields(
            {
                name: '\u200b',
                value: `[Commands](https://github.com/Nuozrok/lpap/wiki/Commands) \n [Bug / Suggestion](https://github.com/Nuozrok/lpap/issues)`,
                inline: false
            }
        )
        .setThumbnail('https://raw.githubusercontent.com/Nuozrok/lpap/main/logo/boxlogo.png');

        // reply
        await interaction.reply({
            content: '',
            embeds: [embed],
            components: [],
            ephemeral: true
        });
	},
};