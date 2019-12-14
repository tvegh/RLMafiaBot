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
var playersVoted = [];
var duplicateVoters = [];

const player_limit = 8;

//stores duplicate values into duplicateVoters
function getDuplicates(array) {
    var valuesSoFar = Object.create(null);
    for (var i = 0; i < array.length; ++i) {
        //skips the bot's reactions
        if (value == `<@!${client.user.id}>`) {
            continue
        }
        var value = array[i];
        if (value in valuesSoFar) {
            duplicateVoters.push(value);
        }
        valuesSoFar[value] = true;
    }
}

//filter function for returning only unique values in an array
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

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
                // console.log(`mafia number is: ${mafia}`);
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
                    .then(() => {if(players.length>1){messageReaction.react("2️⃣")}})
                    .then(() => {if(players.length>2){messageReaction.react("3️⃣")}})
                    .then(() => {if(players.length>3){messageReaction.react("4️⃣")}})
                    .then(() => {if(players.length>4){messageReaction.react("5️⃣")}})
                    .then(() => {if(players.length>5){messageReaction.react("6️⃣")}})
                    .then(() => {if(players.length>6){messageReaction.react("7️⃣")}})
                    .then(() => {if(players.length>7){messageReaction.react("8️⃣")}})
                    .catch(() => console.error('The emojis done fucked up'));   
                })
                //store the message object that has all the reactions
                //set timeout because we need to wait for the message to officially post before
                //storing it in a variable
                setTimeout(() => {reactMessage = client.user.lastMessage;},4000);
                // msg.channel.fetchMessages({ limit: 1 }).then(messages => {
                //     client.user.lastMessage
                //     reactMessage = messages.first();
                //   })
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
                    if (reactionArray[i]._emoji.name === mafiaEmoji) {
                        for (var j = 0; j < reactionArray[i].users.array().length; j++) {
                            playersVoted.push(`<@!${reactionArray[i].users.array()[j].id}>`);
                            for (var k = 0; k < players.length; k++) {
                                if (reactionArray[i].users.array()[j].id === players[k].id) {
                                    correctGuessers.push(`<@!${reactionArray[i].users.array()[j].id}>`);
                                }
                            }
                        }
                    } else {
                        for (var j = 0; j < reactionArray[i].users.array().length; j++) {
                            playersVoted.push(`<@!${reactionArray[i].users.array()[j].id}>`);
                        }
                    }
                }
                for (var i = 0; i < playersVoted.length; i++) {
                    if (correctGuessers.includes(playersVoted[i])) {
                        correctGuessers = correctGuessers.filter(function(value, index, arr) {
                            return value != playersVoted[i];
                        })
                    }
                }
                //reveal the mafia, then congratulate the correct guessers
                msg.channel.sendMessage('The Mafia was: ' + players[mafia]);
                if (correctGuessers.length > 0) {
                    //join all the correct guessers into a string, join by a comma
                    correctGuessersString = correctGuessers.join(', ');
                    msg.channel.sendMessage(`Congrats to ${correctGuessersString}!`);
                } else {
                    msg.channel.send('Wow! No one guessed correctly! Fucking idiots!');
                }
                //store any duplicate voters in playersVoted
                getDuplicates(playersVoted);
                //filter out any duplicates in duplicateVoters, so theres only
                //one instance of each person who voted more than once
                var uniqueDuplicates = duplicateVoters.filter(onlyUnique);
                //if there are duplicate voters, tell them to fuck off for cheating
                if (uniqueDuplicates.length > 0) {
                    var duplicateVotersString = uniqueDuplicates.join(', ');
                    msg.channel.send(`Fuck off ${duplicateVotersString}. You voted more than once.`)
                }
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

//12-14 edit
//cleaned up the code a bit
//added comments
//added functionality to tell everyone who the mafia was
//added functionality to tie mafia to reaction emoji
//shows a 'congrats' message to those who picked the right emoji
//removed !reset. we dont need it. the game just resets after !reveal on its own
//added the functionality for when no one guesses correctly
//added the ability to see if someone voted more than once and to tell them to fuck off
// - TeaBone