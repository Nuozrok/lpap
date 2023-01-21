# lpap
lpap.app in development


## Hardware
- cheap sbc (like raspberry pi?) or intel nuc or mini pc. Low power and cheap.

## Hosting - LPAP.APP
- GitHub pages?
- Google domain? https://domains.google.com/registrar/search?hl=en&searchTerm=lpap.app

## Ideas
- SECURE LOGIN
- Login via discord? https://discordjs.guide/oauth2/#setting-up-a-basic-web-server seems to cover it pretty well but haven't tried this yet
- Discord bot tried this, easiest step so far, https://discord.com/developers/docs/getting-started literally was able to do this on a test server in 30 minutes
^^ using discord's api directly is hurting my eyes so going to start using discord.js to abstract that and use more normal object oriented stuff


- Picture of the day with bot integration  maybe https://discordjs.guide/oauth2/#setting-up-a-basic-web-server, maybe https://discordjs.guide/oauth2/#setting-up-a-basic-web-server , less clear
(post in \#general or new channel?)
- Photo gallery 
- Music playlists
- Discord Chat log
- File sharing?
- Event calendar
- Mtg Library
- Common games matrix (scan steam libraries, origin, blizzard, etc…) with randomizer to pick a game depending on who is selected https://developer.valvesoftware.com/wiki/Steam_Web_API#GetOwnedGames_.28v0001.29 
- Movie night? Submit suggestion (limit 1) rotate who picks each session


running locally https://github.com/discord/discord-example-app#running-app-locally
===============================
clone the repo

npm install
to install the package dependencies


node app.js or npm start
to run it


choco install ngrok
run as administrator in cmd to get that one

ngrok http 3000 to open up a port locally

if you get 401 unauthorized then that means your environment vars are bad / do not match what discord wants them to be

https://github.com/discord/discord-interactions-js
