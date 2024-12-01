const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs');
// both the autocomplete and the result need to be able to reference heroscache.json
const herocache = JSON.parse(fs.readFileSync('data/heroscache.json', 'utf8'));
const herocache_array = Object.keys(herocache);

// inside a command, event listener, etc.
module.exports = {
    data: new SlashCommandBuilder()
        .setName('deadlockstats')
        .setDescription('PLACEHOLDERTEXT')
        .addStringOption(option =>
            option.setName('hero')
                .setDescription('Select the hero')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        /* the opendota api has an annoying format where you can either choose the objects to be indexed by heroid, or by name
         * I chose to grab the objects indexed by id (see dotarefreshcache.js)
         * 
         * the name is useless for display purposes (who wants an autocomplete where the search shows 
         * "npc_dota_hero_antimage")??
         * 
         * we really want to calculate and the hero id the whole time as that is what the opendota api wants
         * 
        */

        const focusedValue = interaction.options.getFocused();

        // const testchoices = ['Popular Topics: Threads', 'Sharding: Getting started', 'Library: Voice Connections', 'Interactions: Replying to slash commands', 'Popular Topics: Embed preview'];
        const sample_hero_array = herocache_array.slice(0, 5);

        // calculate the autocomplete results
        let filtered = herocache_array.filter(function (choice) {
            return herocache[choice].localized_name.toUpperCase().startsWith(focusedValue.toUpperCase());
        });

        // skip autocompleting on blank values and just return first 5 ones to show up
        if (!focusedValue) {
            filtered = sample_hero_array;
        }

        await interaction.respond(
            filtered.map(choice => ({ name: herocache[choice].localized_name, value: choice.toString() })),
        );
    },
    async execute(interaction) {

        // this might take a few seconds, tell discord to hold its horses
        await interaction.deferReply();

        try {
            if (isNaN(interaction.options.getString('hero'))) {
                interaction.editReply('you did not put in a valid hero id');
            }
        }
        catch (exception) {
            interaction.editReply('did you even enter a value at all?');
        }

        // call the opendota api and retrieve a message similar to the one in data/examplepangotestdurations.json folder

        const url = "https://api.opendota.com/api/heroes/" + interaction.options.getString('hero') + "/durations";
        const testurl = "https://api.urbandictionary.com/v0/define?term=dota"
        const frontendurl = "https://opendota.com/heroes/" + interaction.options.getString('hero') + "/durations";
        const staticurl = 'https://cdn.cloudflare.steamstatic.com/';
        const currenthero = interaction.options.getString('hero');

        console.log(url);

        var embedder = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Duration vs Winrate check')
            .setAuthor({
                name: herocache[currenthero].localized_name + ' (Hero ID ' + currenthero + ')', iconURL: staticurl + herocache[currenthero].icon
            })
            .addFields({ name: 'Opendota Link: ' + frontendurl, value: ' ' })
            .setTimestamp();

        const req = new XMLHttpRequest();

        function successListener() {

            console.log(req.responseText);

            let herodata = JSON.parse(req.responseText);
            console.log(typeof (herodata));
            console.log(herodata);

            /* herodata contains a bunch of json objects showing # of games played, time range, and win number 
             */
            // duration_bin is in seconds for some reason, convert to minutes

            function splitToArrays(jsonobjects) {
                let duration_bin_minutes_array = [];
                let games_played_array = [];
                let games_won_array = [];
                for (i in jsonobjects) {
                    jsonobjects[i].duration_bin_minutes = jsonobjects[i].duration_bin / 60;
                    duration_bin_minutes_array.push(jsonobjects[i].duration_bin_minutes);
                    games_played_array.push(jsonobjects[i].games_played);
                    games_won_array.push(jsonobjects[i].wins);

                }
                return [duration_bin_minutes_array, games_played_array, games_won_array];
            }

            // average game length = sum for all bins(games played per selected bin * selected bin's length) / total num of games played
            function sumAndWeightedAverage(minutes, games) {
                sum = 0;
                weightSum = 0;
                for (i in games) {
                    sum += minutes[i] * games[i];
                    weightSum += games[i];
                    console.log(sum, weightSum);
                }

                return [weightSum, sum / weightSum];
            };
            function winSumWinRate(games, wins) {
                gamesum = 0;
                winsum = 0;
                for (i in games) {
                    gamesum += games[i];
                    winsum += wins[i];
                    console.log(gamesum, winsum);
                }
                return [winsum, (winsum / gamesum) * 100];
            }

            // total stats
            const [tot_durations_minutes, tot_games_played, tot_games_won] = splitToArrays(herodata);
            const [tot_game_sum, averageGameLength] = sumAndWeightedAverage(tot_durations_minutes, tot_games_played);
            const [tot_wins_count, tot_win_rate] = winSumWinRate(tot_games_played, tot_games_won);
            /*console.log(tot_durations_minutes, tot_games_played);
            console.log('average game length is ' + averageGameLength);
            console.log('total win rate is ' + total_win_rate);
            */

            // parse into long and short games based on performance against average game length
            longGames = herodata.filter(function (item) { return item.duration_bin_minutes > averageGameLength });
            shortGames = herodata.filter(function (item) { return item.duration_bin_minutes <= averageGameLength });

            // long game stats
            const [long_durations_minutes, long_games_played, long_games_won] = splitToArrays(longGames);
            const [long_game_sum, longGameLength] = sumAndWeightedAverage(long_durations_minutes, long_games_played);
            const [long_wins_count, long_win_rate] = winSumWinRate(long_games_played, long_games_won);
            /*console.log(long_durations_minutes, long_games_played, long_games_won);
            console.log('winrate of long games is' + long_win_rate);
            */

            // short game stats
            const [short_durations_minutes, short_games_played, short_games_won] = splitToArrays(shortGames);
            const [short_game_sum, shortGameLength] = sumAndWeightedAverage(short_durations_minutes, short_games_played);
            const [short_wins_count, short_win_rate] = winSumWinRate(short_games_played, short_games_won);
            /*
            console.log(short_durations_minutes, short_games_played);
            console.log('winrate of short games is' + short_win_rate);
            */

            let interpretation = 'no verdict, technical error';
            if (long_win_rate > short_win_rate) {
                interpretation = 'Since Long Games are more likely to win than Short Games, you want to stall on this hero';
            }
            else if (long_win_rate < short_win_rate) {
                interpretation = 'Since Short Games are more likely to win than Long Games, you want to rush on this hero';
            }
            else {
                interpretation = 'Since winrates are equal, this hero is ok in both Long and Short Games';
            }

            // return output to the embedder
            console.log('embedding...');
            embedder = embedder.setThumbnail(staticurl + herocache[currenthero].img);
            embedder = embedder.addFields({ name: 'overall stats', value: ' ' });
            embedder = embedder.addFields({ name: 'avg length:', value: averageGameLength.toFixed(2) + ' minutes', inline: true });
            embedder = embedder.addFields({ name: '# wins / # of games:', value: tot_wins_count + ' / '+ tot_game_sum, inline: true });
            embedder = embedder.addFields({ name: 'win%:', value: tot_win_rate.toFixed(2) + '%', inline: true });

            embedder = embedder.addFields({ name: 'long game stats (games where length > average length)', value: ' ' });
            embedder = embedder.addFields({ name: 'avg length:', value: longGameLength.toFixed(2) + ' minutes', inline: true });
            embedder = embedder.addFields({ name: '# of wins / # of games:', value: long_wins_count + ' / '+ long_game_sum, inline: true });
            embedder = embedder.addFields({ name: 'win%:', value: long_win_rate.toFixed(2) + '%', inline: true });

            embedder = embedder.addFields({ name: 'short game stats (games where length <= average length)', value: ' ' });
            embedder = embedder.addFields({ name: 'avg length:', value: shortGameLength.toFixed(2) + ' minutes', inline: true });
            embedder = embedder.addFields({ name: '# of wins / # of games:', value: short_wins_count + ' / ' + short_game_sum, inline: true });
            embedder = embedder.addFields({ name: 'win%:', value: short_win_rate.toFixed(2) + '%', inline: true });


            embedder = embedder.addFields({ name: 'Verdict:', value: interpretation });
            embedder = embedder.setFooter({ text: 'disclaimer: lengths calculated using opendota\'s histogram bin durations. so a game that lasted < 5 minutes gets rounded up into the 5 minute bin' });
            // output to chat log
            interaction.editReply({ embeds: [embedder] });
        }


        function transferFailed(error) {
            console.error(error);
            console.log('error found');
            console.log(req.responseText);
            embedder = embedder.addFields({ name: 'error', value: "we couldn't connect to the opendota api, try again some other time" });
            interaction.editReply({ embeds: [embedder] });
        }
        // progress on transfers from the server to the client (downloads)
        function updateProgress(event) {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                // ...
            } else {
                // Unable to compute progress information since the total size is unknown
            }
        }




        req.addEventListener("progress", updateProgress);
        req.addEventListener("load", successListener);
        req.addEventListener("error", transferFailed);
        req.open("GET", url);
        //req.open("GET", testurl);
        req.send();


    },
};