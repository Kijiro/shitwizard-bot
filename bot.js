var Discord = require("discord.js");
var request = require("request");
var five = require("johnny-five");

var api = 'txsqd8scedz7z3922rc2cnsx26mz5n55';
var bot = new Discord.Client();
const prefix = "!";
var responses = {
  "!hello": ":sunglasses:",
};

var board = new five.Board();

board.on("ready", function() {
  var led = new five.Led(11);

  bot.on("message", msg => {

    // Exit if no prefix
    if(!msg.content.startsWith(prefix)) return;
    // Exit if message is from a bot
    if(msg.author.bot) return;

    // Get ilvl
    if (msg.content.startsWith(prefix + "ilvl")) {
      let args = msg.content.split(" ").slice(1);
      let realm = 'Tichondrius';
      if (args[1]) {
        realm = args[1];
      }

      if (args[0].toLowerCase() == 'khadgar') {
        msg.channel.sendMessage(`:sunglasses:`);
        return;
      }

      request(`https://us.api.battle.net/wow/character/${realm}/${args[0]}?fields=items&locale=en_US&apikey=${api}`, function(error, response, body){
        if (!error && response.statusCode == 200) {
          var character = JSON.parse(body);
          msg.channel.sendMessage(`${args[0]}-${realm} ilvl is ${character.items.averageItemLevelEquipped}`);
        } else {
          msg.channel.sendMessage(`Sorry, I couldn't find ${args[0]}-${realm}`);
        }
      });

    }

    // For simple responses
    if(responses[msg.content]) {
      msg.channel.sendMessage(responses[msg.content]);
    }

    // Logging
    console.log(`${msg.author.username} used ${msg.content}`);
    led.blink(200);
    this.wait(1000, function() {
      led.stop().off();
    });

  });

  bot.on('presenceUpdate', (oldMember, newMember) => {
    // if (newMember.user.username == 'Catrophy' && newMember.user.presence.status == 'online') {
    //   newMember.sendMessage("You're awesome");
    //   console.log('I let Jerome know he\'s aewsome');
    // }

    if (newMember.user.username == 'Vectron' && newMember.user.presence.status == 'online') {
      newMember.sendMessage("\*<shitwizard pats you on the head.\>*\nGood job.");
      console.log('Pat!');
      led.pulse();
      this.wait(60000, function() {
        led.stop().off();
      });
    }
  });

  bot.on('ready', () => {
    console.log('I\'m ready! 😎');
  });

  bot.on('disconnect', () => {
    console.log('Disconnected! 😭');
  });

  bot.on('error', e => { console.error(e); });

  bot.login(process.env.DISCORD_TOKEN);

}); // End johnny-five
