# lpap
lpap.app in development

## Hosting - LPAP.APP
- Discord bot 
    - Currently hoted on an AWS EC2 t2.micro (Ubuntu) instance
        - Free for one year. Would like to host on a Raspberry Pi 4 when they become available at MSRP again
- Website (login required)  
    - GitHub pages?
    - Google domain? https://domains.google.com/registrar/search?hl=en&searchTerm=lpap.app

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