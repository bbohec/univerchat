const Botkit = require("botkit");
const loki = require("lokijs");
import {univerchat} from './univerchat.js';

const db = new loki('./database.json',{
	autoload: true,
	autoloadCallback : databaseInitialize,
	autosave: true, 
	autosaveInterval: 1000
});

function databaseInitialize() {
	var users = db.getCollection("users");
	if (!users) {
		console.log("USER DATABASE NOT FOUND.... Recreate");
		users = db.addCollection("users" , {
	    	unique: ['username']
		});
	} else {
		console.log("USER DB LOADED");
	}
	main(users);
}

	
function main(users) {

//==========================DISCORD==================================
	const Discord = require("discord.js");
	const discordclient = new Discord.Client();
	discordclient.on('ready', () => {
	  console.log(`>>>>[DISCORD] Logged in as ${discordclient.user.tag}!`);
	});
	discordclient.on('message', message => {
		//console.log("Facebook Event")
		univerchat("Discord",message,users,bots);
	});
	discordclient.login('MzkwMDU2NDUxODg5OTU0ODE4.DREj6w.lxbxO3oRtmyRyS16R_ZJ540ikyI');

//==========================CISCO SPARK==========================
	const ciscosparkclient = Botkit.sparkbot({
	    public_address: 'https://624c20a5.ngrok.io',
	    ciscospark_access_token: 'Yzg3NGVkNGItYWJjNC00ZTZjLWJhNDUtYTk5NWRmMDlhMTg4YzllODhlOGUtNDAw',
	    secret: 'UniverChatRocks',
	    name: 'UniverChat'
	})
	ciscosparkclient.setupWebserver(7001, (err,webserver) => {
		ciscosparkclient.createWebhookEndpoints(webserver,ciscosparkclient.spawn({}),function(){
			console.log('>>>>[CISCO SPARK] Logged in!');
		})
	})
	ciscosparkclient.on('direct_message', (bot, message) => {
		//console.log("Cisco Spark Event")
		univerchat("CiscoSpark",message,users,bots);	
	})

//============================FACEBOOK================================
	const facebookclient = Botkit.facebookbot({
	        access_token: 'EAAYq8K4vYskBAIoCBDuXvU55aYvugYfBum3DReGqRSxCK9ztZAgK91Uh9YimLvCvMKDM0pXiKYM6F4BqrbZCafBrANgmByJWFzpyIP2JHZC9axkmWMlySyFyUbzkw0oZCkLZA3T7keNaL60vtVMaQ3hFihXpZABfXQ9IKMTZA6UPwZDZD',
	        verify_token: 'UniverChatRocks',
	})
	facebookclient.setupWebserver(7002, (err,webserver) => {
		facebookclient.createWebhookEndpoints(webserver,facebookclient.spawn({}),function(){
			console.log('>>>>[FACEBOOK] Logged in!');
		})
	})
	facebookclient.on('message_received', (bot, message) => {
		//console.log("Facebook Event")
		univerchat("Facebook",message,users,bots);
	})

//============================SLACK============================
	const slackclient = Botkit.slackbot({})
	let slackbot = slackclient.spawn({
		token: 'xoxb-286105022036-TT54DfWxoNOh3GDVWTQHsw6L'
	}).startRTM(function(){
		console.log('>>>>[SLACK] Logged in!')
	});
	/*slackclient.setupWebserver(7003, (err,webserver) => {
		slackclient.createWebhookEndpoints(webserver,slackbot,function(){
			console.log('[SLACK] Logged in!');
		})
	})*/
	slackclient.on('direct_message', (bot, message) => {
		//console.log("Slack Event")
		univerchat("Slack",message,users,bots);
	})



	/*
	const Steam = require('steam');
	const steamClient = new Steam.SteamClient();
	const steamFriends = new Steam.SteamFriends(steamClient);
	steamClient.connect();
	steamClient.on('connected', function() {
		const steamUser = new Steam.SteamUser(steamClient);
		steamUser.logOn({
			account_name: 'username',
			password: 'password'
		});
	});
	steamClient.on('logOnResponse', function(logonResp) {
	  if (logonResp.eresult == Steam.EResult.OK) {
	    console.log('Logged in!');
	    steamFriends.setPersonaState(Steam.EPersonaState.Online); // to display your bot's status as "Online"
	    steamFriends.setPersonaName('Haruhi'); // to change its nickname
	    steamFriends.joinChat('103582791431621417'); // the group's SteamID as a string
	  }
	});
	*/





	let bots = {
		discordbot : discordclient,
		ciscosparkbot : ciscosparkclient.spawn({}),
		facebookbot : facebookclient.spawn({}),
		slackbot: slackbot
	}
}

