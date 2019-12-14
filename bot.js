const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// 0, waiting for game to start
// 1, game started, waiting for players
// 2, game in progress, waiting for it to end
// 3, game has ended, voting, waiting for voting to end
// 4, game over, display results
// 0, back to waiting
var state = 0;
var players = [];
var mafia;
var guesses;

const player_limit = 6;
const one = "";
//aight we need to figure out 1,2,3... unicode bc vs code seems to be shitting itself, testing with :joy:
/*const two = ;
const three = ;
const four = ;
const five = ;
const six = ;*/

client.on('message',  msg => {
    console.log(`message ${msg}`);
    if (msg.content === '!reset') {
        players = [];
        state = 0;
        msg.reply('State set to ' + state);
        
    }
    switch(state) {
        case 0:
            if (msg.content === '!mafia') {
                msg.reply('Starting game of mafia');
                state = 1;
            }
            break;
        case 1:
            if (msg.content === "!join" && players.length < player_limit) {
                if (players.indexOf(msg.author) === -1) {
                    players.push(msg.author);
                    msg.channel.sendMessage("player added " + msg.author);
                }
            }
            if (msg.content === "!start") {
                msg.channel.send("Starting game, check dm's");
    
                mafia = Math.floor(Math.random() * players.length);
    
                for (var i = 0; i < players.length; i++) {
                    var player = players[i];
                    if (i === mafia) {
                        player.sendMessage("You're a fat hoe");
                    } else {
                        player.sendMessage("Stay safe out there!");
                    }
                }
                state = 2
            }
            break;
        case 2:
            if (msg.content === "!end") {
        
                msg.channel.sendMessage("Now time to guess who the mafia was:");
                for (var i = 0; i < players.length; i++) {
                    msg.channel.sendMessage((i + 1) + ". " + players[i]);
                }
                msg.channel.sendMessage("step1");
                msg.channel.send("React to this message with your vote!").then( messageReaction => {
                    messageReaction.react("1️⃣")
                    .then(() => messageReaction.react("2️⃣"))
                    .then(() => messageReaction.react("3️⃣"))
                    .then(() => messageReaction.react("4️⃣"))
                    .then(() => messageReaction.react("5️⃣"))
                    .then(() => messageReaction.react("6️⃣"))
                    .catch(() => console.error('The emojis done fucked up'));   
                })
                //guesses = getMessage(msg);
                console.log("g " + guesses);
                state = 3;
            }
            break;
        case 3:
            if (msg.content === "!reveal") {
                msg.channel.sendMessage("revealing");
                msg.channel.sendMessage('The Mafia was: ' + players[mafia])
                console.log("reactions: " + guesses);
            }
            break;
        case 4:

            break;
    }
});

// 12/7 Edits - playing around with Collectors to check reactions - Adi 

/*async function getMessage(msg) {
    return await msg.channel.sendMessage("React who you think the mafia was");
}*/

client.login(process.env.API_KEY);
//git test
//another git test

// start

/* game states
    not started
    start game, waiting for people to join
    enough join, someone says start, send out messages, in progress
    someone ends the game, handle winners, end
    -> not started
*/

/* old code that was just a bunch of if/else if. replaced with switch because it looks better
if (state === 0) {
        if (msg.content === '!mafia') {
            msg.reply('Starting game of mafia');
            state = 1;
        }
    } else if (state === 1) {
        if (msg.content === "!join" && players.length < player_limit) {
            if (players.indexOf(msg.author) === -1) {
                players.push(msg.author);
                msg.channel.sendMessage("player added " + msg.author);
            }
        }
        if (msg.content === "!start") {
            msg.channel.send("Starting game, check dm's");

            mafia = Math.floor(Math.random() * players.length);

            for (var i = 0; i < players.length; i++) {
                var player = players[i];
                if (i === mafia) {
                    player.sendMessage("You're a fat hoe");
                } else {
                    player.sendMessage("Stay safe out there!");
                }
            }
            state = 2
        }
    } else if (state === 2) {
        if (msg.content === "!end") {
            
            msg.channel.sendMessage("Now time to guess who the mafia was:");
            for (var i = 0; i < players.length; i++) {
                msg.channel.sendMessage((i + 1) + ". " + players[i]);
            }
            msg.channel.sendMessage("step1");
            msg.channel.send("React to this message with your vote!").then( messageReaction => {
                
                messageReaction.react("1️⃣")
                .then(() => messageReaction.react("2️⃣"))
                .then(() => messageReaction.react("3️⃣"))
                .then(() => messageReaction.react("4️⃣"))
                .then(() => messageReaction.react("5️⃣"))
                .then(() => messageReaction.react("6️⃣"))
                .catch(() => console.error('The emojis done fucked up'));
            
        
            
            })
            //guesses = getMessage(msg);
            console.log("g " + guesses);
            state = 3;
        }
    } else if (state === 3) {
        if (msg.content === "!reveal") {
            msg.channel.sendMessage("revealing");
            console.log("reactions: " + guesses);
        }
    }
    */