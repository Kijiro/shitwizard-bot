const Discord = require('discord.js');
const bot = new Discord.Client({ fetchAllMembers: true });
const config = require('./config.json');
const fs = require('fs');
const moment = require('moment');
const schedule = require('node-schedule');
const pushover = require('./helpers/pushover');
const display = require('./helpers/display-o-tron');

const log = function(msg) {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${msg}`);
};

/* eslint-disable */
var j = schedule.scheduleJob({hour: 18, minute: 50, dayOfWeek: 3}, function(){
  let guild = bot.guilds.first();
  let raid = guild.roles.find('name', 'Raid');

  if (config.raid === true) {
    bot.guilds.first().defaultChannel.sendMessage(`${raid} Raid starts in 10 min!`);
    console.log('--- Raid Announcement ---');
    pushover.send(`Sending raid announcment`);
  } else {
    bot.guilds.first().defaultChannel.sendMessage(`${raid} No raid this week! Go outside or something.`);
    config.raid = true;
  }
});
/* eslint-enable */

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

// Load in all commands in ./commands
fs.readdir('./commands/', function(err, files){
  if (err) console.error(err);
  log(`Loading a total of ${files.length} commands.`);
  files.forEach(function(f){
    let props = require(`./commands/${f}`);
    log(`Loading Command: ${props.help.name}.`);
    bot.commands.set(props.help.name, props);
    props.conf.aliases.forEach(function(alias){
      bot.aliases.set(alias, props.help.name);
    });
  });
});

bot.on('message', function(msg){
  // Exit if message is from a bot
  if(msg.author.bot) return;

  // Add reaction when people are mad at shitwizard
  if(msg.content.indexOf('damn') != -1 && msg.content.indexOf('shitwizard')) {
    msg.react('😎');
  }

  // Exit if no prefix
  if(!msg.content.startsWith(config.prefix)) return;

  // Log what was used
  log(`${msg.author.username} used '${msg.content}'`);
  display.write([msg.author.username, msg.content], [255, 241, 109]);

  // Get command
  let command = msg.content.split(' ')[0];
  command = command.slice(config.prefix.length);

  // Get arguments
  let args = msg.content.split(' ').slice(1);

  let cmd;

  // Check if bot has command
  if (bot.commands.has(command)) {
    cmd = bot.commands.get(command);
  } else if (bot.aliases.get(command)) {
    cmd = bot.commands.get(bot.aliases.get(command));
  } else {
    pushover.send(`Suggestion: ${msg.author.username} used '${msg.content}'`);
  }

  // Run command
  if (cmd) {
    cmd.run(bot, msg, args);
  }
});

bot.on('presenceUpdate', function(oldMember, newMember) {
  let guild = newMember.guild;
  let wow = guild.roles.find('name', 'Playing WoW');
  let hots = guild.roles.find('name', 'Playing HotS');
  let overwatch = guild.roles.find('name', 'Playing Overwatch');
  let games = guild.roles.find('name', 'Playing Games');
  if (!wow || !hots || !overwatch || !games) {
    return;
  }

  // Set role for WoW
  if (newMember.user.presence.game && newMember.user.presence.game.name === 'World of Warcraft') {
    newMember.addRole(wow);
  } else if (!newMember.user.presence.game && newMember.roles.has(wow.id)) {
    newMember.removeRole(wow);
  }
  // Set role for HotS
  if (newMember.user.presence.game && newMember.user.presence.game.name === 'Heroes of the Storm') {
    newMember.addRole(hots);
  } else if (!newMember.user.presence.game && newMember.roles.has(hots.id)) {
    newMember.removeRole(hots);
  }
  // Set role for Overwatch
  if (newMember.user.presence.game && newMember.user.presence.game.name === 'Overwatch') {
    newMember.addRole(overwatch);
  } else if (!newMember.user.presence.game && newMember.roles.has(overwatch.id)) {
    newMember.removeRole(overwatch);
  }
  // Set role for other games
  if (newMember.user.presence.game) {
    newMember.addRole(games);
  } else if (!newMember.user.presence.game && newMember.roles.has(games.id)) {
    newMember.removeRole(games);
  }
});

bot.on('ready', function() {
  log(`Shitwizard is ready! 😎 \n`);
  pushover.send(`Shitwizard is ready! 😎`);
  display.write('Online!', [171, 229, 57]);
});

bot.on('disconnect', function() {
  log('Disconnected! 😭');
  pushover.send(`Shitwizard disconnected! 😭`);
  display.write('Disconnected!', [236, 35, 21]);
});

bot.on('reconnecting', function() {
  log('Reconnecting...');
  pushover.send(`Shitwizard reconnecting...`);
  display.write('Reconnecting...', [235, 86, 226]);
});

bot.on('error', function(e) {
  console.error(e);
  pushover.send(`Shitwizard error: ${e}`);
});

bot.login(process.env.DISCORD_TOKEN);
