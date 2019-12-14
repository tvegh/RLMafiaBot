require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

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
var reactMessage;
var correctGuessers = [];
var correctGuessersString = '';
var mafiaEmoji;

const player_limit = 6;

client.on('message',  msg => {
    // console.log(`message: ${msg}`);
    switch(state) {
        case 0:
            if (msg.content === '!mafia') {
                msg.reply('Starting game of mafia');
                state = 1;
            }
            break;
        case 1:
            //add players to array
            if (msg.content === "!join" && players.length < player_limit) {
                if (players.indexOf(msg.author) === -1) {
                    players.push(msg.author);
                    msg.channel.sendMessage("player added " + msg.author);
                }
            }
            //send DMs to players
            if (msg.content === "!start") {
                msg.channel.send("Starting game, check dm's");
                //pick mafia randomly, and store emoji to match the mafia player
                mafia = Math.floor(Math.random() * players.length);
                console.log(`mafia number is: ${mafia}`);
                switch(mafia) {
                    case 0:
                        mafiaEmoji = "1️⃣";
                        break;
                    case 1:
                        mafiaEmoji = "2️⃣";
                        break;
                    case 2:
                        mafiaEmoji = "3️⃣";
                        break;
                    case 3:
                        mafiaEmoji = "4️⃣";
                        break;
                    case 4:
                        mafiaEmoji = "5️⃣";
                        break;
                    case 5:
                        mafiaEmoji = "6️⃣";
                        break;
                }
                //send the DMs
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
            //post list of players and add reactions tied to those players
            if (msg.content === "!end") {
                msg.channel.sendMessage("Now time to guess who the mafia was:");
                for (var i = 0; i < players.length; i++) {
                    msg.channel.sendMessage((i + 1) + ". " + players[i]);
                }
                msg.channel.send("React to this message with your vote!").then( messageReaction => {
                    messageReaction.react("1️⃣")
                    .then(() => messageReaction.react("2️⃣"))
                    .then(() => messageReaction.react("3️⃣"))
                    .then(() => messageReaction.react("4️⃣"))
                    .then(() => messageReaction.react("5️⃣"))
                    .then(() => messageReaction.react("6️⃣"))
                    .catch(() => console.error('The emojis done fucked up'));   
                })
                //store the message object that has all the reactions
                msg.channel.fetchMessages({ limit: 1 }).then(messages => {
                    reactMessage = messages.first();
                  })
                state = 3;
            }
            break;
        case 3:
            if (msg.content === "!reveal") {
                //check through all the reactions
                let reactionArray = reactMessage.reactions.array();
                for (var i = 0; i < reactionArray.length; i++) {
                    //if the reaction is the mafiaEmoji, then add all the people
                    //who reacted with that emoji into correctGuessers
                    //loop starts at 1 so we dont include the Bot in correctGuessers
                    if (reactionArray[i]._emoji.name === mafiaEmoji) {
                        for (var j = 1; j < reactionArray[i].users.array().length; j++) {
                            correctGuessers.push(`<@!${reactionArray[i].users.array()[j].id}>`);
                        }
                    }
                }
                //join all the correct guessers into a string, join by a comma
                correctGuessersString = correctGuessers.join(', ');
                //reveal the mafia, then congratulate the correct guessers
                msg.channel.sendMessage('The Mafia was: ' + players[mafia]);
                msg.channel.sendMessage(`Congrats to ${correctGuessersString}!`);
                //reset the state to 0, and clear out the players and correctGuessers
                //ready for a new game
                players = [];
                correctGuessers = [];
                state = 0;
            }
            break;
    }
});

client.login(process.env.API_KEY);

//12-13 edit
//cleaned up the code a bit
//added comments
//added functionality to tell everyone who the mafia was
//added functionality to tie mafia to reaction emoji
//shows a 'congrats' message to those who picked the right emoji
//removed !reset. we dont need it. the game just resets after !reveal on its own

//there is an issue where sometimes, correctGuessers will be empty, even when there were reactions.
//something to do with the loop at line 126. maybe its an issue with the loop starting at 1?
//but it needs to start at 1, otherwise the bot will be included in correctGuessers. idk
//it seems like waiting a little bit before using !end makes it work, which is fine
//but who knows. maybe just needs some more testing.
// - TeaBone