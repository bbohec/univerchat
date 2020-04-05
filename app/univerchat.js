var unirest = require('unirest');

import {getrawmessage} from './brain.js'
import {getsourceuser} from './brain.js'
import {setaction} from './brain.js'
import {unknownaction} from './brain.js'
import {unsupportedyetaction} from './brain.js'
import {helpaction} from './brain.js'
import {registeraction} from './brain.js'
import {chataction} from './brain.js'
import {lastchataction} from './brain.js'
import {getusers} from './brain.js'




export function univerchat (chattype,message,users,bots) {
	console.log ("univerchat" + " Start");
	let sound = new Object();
	//let sound['sourceUser'] = new Object();
	sound.originalmessage = message
	//console.log (sound.originalmessage);
	switch (chattype) {
		case "CiscoSpark":
			sound.sourceUser = {
				username : "("+chattype+")"+sound.originalmessage.user,
				id : sound.originalmessage.data.personId
			}
			sound.action = setaction(sound.originalmessage.text,sound.sourceUser)
			univerchatthink(sound,users,bots)
		break;
		case "Discord":
			sound.sourceUser = {
				username : "("+chattype+")"+sound.originalmessage.author.username,
				id : sound.originalmessage.author.id
			}
			sound.action = setaction(sound.originalmessage.content,sound.sourceUser)
			univerchatthink(sound,users,bots)
		break;
		case "Facebook":
			unirest.get('https://graph.facebook.com/'+sound.originalmessage.sender.id+'?access_token=EAAYq8K4vYskBAIoCBDuXvU55aYvugYfBum3DReGqRSxCK9ztZAgK91Uh9YimLvCvMKDM0pXiKYM6F4BqrbZCafBrANgmByJWFzpyIP2JHZC9axkmWMlySyFyUbzkw0oZCkLZA3T7keNaL60vtVMaQ3hFihXpZABfXQ9IKMTZA6UPwZDZD')
			.end((res)=>{
				let body = JSON.parse(res.body);
				sound.sourceUser = {
					username : "("+chattype+")"+body.first_name+body.last_name,
					id : sound.originalmessage.sender.id
				}
				sound.action = setaction(sound.originalmessage.message.text,sound.sourceUser)
				univerchatthink(sound,users,bots)
			})
		break;
		case "Slack":
			
			unirest.get('https://slack.com/api/users.info?'+
				'token='+'xoxb-286105022036-TT54DfWxoNOh3GDVWTQHsw6L'+
				'&user='+sound.originalmessage.user)
			.end((res)=>{
				sound.sourceUser = {
					username : "("+chattype+")"+res.body.user.name,
					id : sound.originalmessage.user
				}
				sound.action = setaction(sound.originalmessage.text,sound.sourceUser)
				univerchatthink(sound,users,bots)
			})
		break;
	}
}


export function univerchatthink (sound,users,bots) {
	console.log ("univerchatthink" + " Start!");
	//console.log(sound);
	let action = new Object;
	switch (sound.action.type) {
		case "chat":
			action = chataction(sound,users);
			univerchatmouth(action,bots) ;
		break;
		case "unknown": 
			action = unknownaction(sound);
			univerchatmouth(action,bots) ;
		break;
		case "help": 
			action = helpaction(sound);
			univerchatmouth(action,bots) ;
		break;
		case "register": 
			action = registeraction(sound,users);
			univerchatmouth(action,bots) ;
		break;
		case "lastchat": 
			action = lastchataction(sound,users);
			univerchatmouth(action,bots) ;
		break;
		case "getusers":
			action = getusers(sound,users);
			univerchatmouth(action,bots) ;
		break;
		case "unwanted":
		break;
		default :
			action = unsupportedyetaction(sound);
			univerchatmouth(action,bots) ;
	}
	
}

function univerchatmouth (action,bots) {
	console.log ("univerchatmouth" + " Start");
	//BOT SPEAK
	//console.log(action);

	if (action.hasOwnProperty('type') ) {
		if (action.type == "bot" || action.type == "chat") {
			switch (action.to.username.split(')')[0].replace('(','')) {
				case "CiscoSpark":
					let payloadCiscoSpark = {
						text: action.message,
						toPersonId: action.to.id
					}
					bots.ciscosparkbot.say(payloadCiscoSpark);
					
				break;
				case "Discord":
					let payloadDiscord = {
						text: action.message,
						toPersonId: action.to.id
					}
					//console.log(payloadDiscord)
					bots.discordbot.fetchUser(payloadDiscord.toPersonId)
					.then (user => user.send(payloadDiscord.text))
					.catch(console.error);
				break;
				case "Facebook":
					let payloadFacebook = {
						text: action.message,
						channel: action.to.id
					}
					//console.log(payloadFacebook)
					bots.facebookbot.say(payloadFacebook);
				break;
				case "Slack":
					let payloadSlack = {
						text: action.message,
						channel: action.to.id
					}
					//console.log(payloadSlack)
					bots.slackbot.say(payloadSlack);
				break;
			}
			console.log ("=========");
		}
	}
}


/*
function getMethods( obj ) {
  var ret = [];
  for ( var prop in obj ) {
    //  typeof is inconsitent, duck type for accuracy
    //  This could also be written to follow the internal IsCallable algorithm
    //  http://es5.github.com/#x9.11
    if ( obj[ prop ] && obj[ prop ].constructor && 
          obj[ prop ].call && obj[ prop ].apply ) {
      ret.push( prop );
    }
  }
  return ret;
}
*/