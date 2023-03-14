const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request, Agent } = require('undici')
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
                    { name: 'Marci', value: '136' }
                )),
    async execute(interaction) {

        // this might take a few seconds, tell discord to hold its horses
        await interaction.deferReply();

        // call the opendota api and retrieve a message similar to the one in data/examplepangotestdurations.json folder

        const url = "https://api.opendota.com/api/heroes/" + interaction.options.getString('hero') + "/durations";
        const frontendurl = "https://opendota.com/heroes/" + interaction.options.getString('hero') + "/durations";
        console.log(url);

        var embedder = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Duration vs Winrate check')
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
            .setDescription('based on pro matches duration data for your given hero from opendota api')
            .addFields({ name: 'Hero ID:', value: interaction.options.getString('hero')})
            .addFields({ name: 'Opendota Link:', value: frontendurl})
            .setTimestamp()

        //const agent = new Agent({ autoSelectFamily: true });
        // const dotaResult = await request(url, { method: 'GET', dispatcher: agent })
        const dotaResult = await request(url)
            .then(async () => {
                console.log(dotaResult.body);

                let herodata = dotaResult.body.json();
                console.log(herodata);
                let duration_bin_minutes_array = [];
                let games_played_array = [];
                let games_won_array = [];
                /* herodata contains a bunch of json objects showing # of games played, time range, and win number
         * example response in herodata:
         * [{
        "duration_bin": 3300,
        "games_played": 230,
        "wins": 95
        }, {
        "duration_bin": 1800,
        "games_played": 2820,
        "wins": 1394
        }, ]
        
         */
                // duration_bin is in seconds for some reason, convert to minutes
                for (i in herodata) {
                    herodata[i].duration_bin_minutes = herodata[i].duration_bin / 60;
                    duration_bin_minutes_array += herodata[i].duration_bin_minutes;
                    games_played_array += herodata[i].games_played;
                    games_won_array += herodata[i].games_won;
                }

                // average game length = sum for all bins(games played per selected bin * selected bin's length) / total num of games played
                const weightedAverage = (nums, weights) => {
                    sum = 0;
                    weightSum = 0;
                    for (i in nums) {
                        sum += nums[i];
                        weightSum += weights[i];
                    }

                    return sum / weightSum;
                };
                //
                averageGameLength = weightedAverage(duration_bin_minutes_array * games_played_array, games_played_array);

                longGames = herodata.filter(function (item) { return item.duration_bin_minutes < averageGameLength })
                shortGames = herodata.filter(function (item) { return item.duration_bin >= averageGameLength })

                embedder = embedder.addFields({ name: 'average game length:', value: averageGameLength });
                console.log('embedding...');
                await interaction.editReply({ embeds: [embedder] });
            })
            .catch(async (error) => {
                console.error(error);
                console.log('error found');
                embedder = embedder.addFields({ name: 'error', value: "we couldn't connect to the opendota api, slow down and try again"});
                await interaction.editReply({ embeds: [embedder] });
            })


    },
};