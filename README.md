# lpap
lpap.app in development

## notes for michael so he doesn't forget how to test the bot:
- clone the repo
- npm install
- go to discord devleoper portal and get a copy of the bot token
- create a .env file containing the following
  - DISCORD_TOKEN=your-token-goes-here
  - APP_ID=your-app-id-goes-here
  - GUILD_ID=guild-id-goes-here_ which you get by right clicking on channel icon -> copy server id
  - STEAM_API_KEY= which you get by going to https://steamcommunity.com/dev/apikey
  - DEADLOCK_API_KEY= which you get by asking michael
- node index.js
- if registering new slash methods, then node deploy-commands.js


## Hosting - LPAP.APP
- Discord bot 
    - Currently hosted on a raspberry pi 4B
- Website (login required)  
    - GitHub pages?
    - we own the domain lpap.app until Jan 4 2025
  
## Planned Features
- Website / server
    - SECURE LOGIN
    - Login via discord? 
        - https://discordjs.guide/oauth2/#setting-up-a-basic-web-server
    - Picture of the day with bot integration  
        - post in \#general or new channel?
    - Photo gallery  
    - Discord Chat log
    - File sharing
    - Event calendar
    - Digital copy of MTG Library
        - start with https://www.delverlab.com/
        - export to CSV
        - integrate with https://scryfall.com/docs/api
- Discord bot
    - Events functionality which will supercede sesh bot
        - Integrate with website event calendar
    - Common games matrix (scan steam libraries, origin, blizzard, etc…) with randomizer to pick a game depending on who is selected https://developer.valvesoftware.com/wiki/Steam_Web_API#GetOwnedGames_.28v0001.29 
    - Movie night? Submit suggestion (limit 1) rotate who picks each session
        - Integrate with events
