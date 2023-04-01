// print a list of commands as they appear on the wiki page https://raw.githubusercontent.com/wiki/Nuozrok/lpap/Commands.md
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Replies with a list of commands. Taken from the LPAP Bot Github wiki.'),
	async execute(interaction) {
        // log interaction
        console.log(`${interaction.user.username} is using the queue command`);

        // grab wiki page
        const wiki = 'https://raw.githubusercontent.com/wiki/Nuozrok/lpap/Commands.md';
        md = await fetchMarkdown(wiki);

        if(!md){
            interaction.reply(`Error retrieving wiki page. Try visiting https://github.com/Nuozrok/lpap/wiki/Commands instead.}`);
        }else{

            // create map of commands
            console.log(generateHelp(md));

            // create embed

            // reply
            await interaction.reply({
                content: 'temp',
                embeds: [],
                components: []
            });
        }
	},
};

/**
 * Retrieve raw text from a markdown file
 * @param {String} url The markdown file to retrieve
 */
const fetchMarkdown = async (url) => {
    try{
        md = await fetch(url);
        return md.text();        
    }catch(e){
        console.log('Error retrieving wiki page from Github');
        console.log(e);
    }
}

/**
 * Creates a map of commands, arguments and description.
 * Commands are taken from the Github wiki page.
 * @param {number} md The markdown text to convert to a map.
 * @param {String} category The category of commands to display.
 * @returns {<Map>}
 */
 const generateHelp = (md, category) => {
    const commands = new Map();

    const c = md.split('\n').filter(line => line.startsWith('## ')).slice(1);
    const a = md.split('## ').slice(3);
    const d = '';

    console.log(c.length);
    console.log(a.length);
    console.log(a);
    return commands;
 }

/**
 * Creates an embed of commands, splitting onto multiple pages.
 * Commands are taken from the Github Wiki Page.
 * @param {number} page The page number to generate.
 * @returns {<EmbedBuilder>}
 */
 const generateEmbed = (queue, page, songsPerPage) => {
    
    return new EmbedBuilder()
        .setColor(0xABABAB)
        .setTitle('Music Queue')
        .addFields(
            {
                name: 'Now Playing:',
                value: `[${queue.songs[0].name}](${queue.songs[0].url}) \n ${queue.songs[0].formattedDuration}, \t Added by <@${queue.songs[0].member.id}>`,
                inline: false
            },
            {
                name: '\u200b',
                value: '**Next**',
                inline: false
            }
        )
        .addFields(songs.map(s => (
            {
                name: '\u200b',
                value: `${songs.indexOf(s)+songsPerPage*(page-1)+1} \t [${s.name}](${s.url}) \n ${s.formattedDuration}, \t Added by <@${s.member.id}>`,
                inline: false
            }
        )))
        .setThumbnail(queue.songs[0].thumbnail)
        .addFields({ name: 'Queue length', value: queue.formattedDuration, inline: false })
        .addFields({ name: 'Loop mode', value: loopEmoji, inline: false })
        .addFields({ name: 'Player status', value: playerEmoji, inline: false })
        .setFooter( {text: `Page ${page} of ${Math.ceil(queue.songs.length/songsPerPage)}`});
    
}