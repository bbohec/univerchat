var magicseparator = '=='

export function setaction (message, user) {
	console.log ("setaction" + " Start");
	let action = new Object();
	if (user.username == "(Discord)UniverChat"){
			action.type = 'unwanted';
			return action;
	}
	//message = message.replace('»','>>')
	if (message.indexOf(magicseparator) !== -1) {
		action.type = 'chat';
		action.destinationuser = message.split(magicseparator)[0] || 'PREVIOUS_USER';
		action.message = message.split(magicseparator)[1];
	} else {
		switch (true) {
			case /register/.test(message):
			case /enregistrement/.test(message):
			case /enregistrer/.test(message):
				action.type = 'register';
			break;
			case /help/.test(message):
			case /aide/.test(message):
				action.type = 'help';
			break;
			case /getusers/.test(message):
				action.type = 'getusers';
			break;
			case /status/.test(message):
				action.type = 'status';
			break;
			case /last/.test(message):
				action.type = 'lastchat';
			break;
			default :
				action.type = 'unknown';
			break;
		}
	}
	//console.log (action);
	return action;
}



export function unknownaction (sound) {
	console.log ("unknownaction" + " Start");
	let action = new Object;
	action.type = "bot";
	action.to = sound.sourceUser;
	action.message = "Unknown action. Ask for help if needed."
	action.originalmessage = sound.originalmessage;
	return action;
}

export function unsupportedyetaction (sound) {
	console.log ("unsupportedyetaction" + " Start");
	let action = new Object;
	action.type = "bot";
	action.to = sound.sourceUser;
	action.message = "The action '"+sound.action.type+"' is not supported yet. Please wait :)"
	action.originalmessage = sound.originalmessage;
	return action;
}

export function helpaction (sound) {
	console.log ("helpaction" + " Start");
	let action = new Object;
	action.type = "bot";
	action.to = sound.sourceUser;
	action.message = "UniverChat is a chatbot that allows you to speak with users that are using other chats."+
	"\n\nPossible actions:"+
	"\n - Help - Get the following help"+
	"\n - Register - Register you to this service. You can connect people."+
	"\n - Connect 'USERNAME' - Ask the user to allow you to contact him. User and you must be registered before."+
	"\n - Contacts [filter]- Get contacts. You can filter your contact if needed"+
	"\n - 'USERNAME'"+magicseparator+"'TEXT' - Start chating by sending TEXT to USERNAME. User have to be connected before."+
	"\n - Last - Shows the last user you have sent chat."+
	"\n - "+magicseparator+"'TEXT' - Continue chating with the user you have last sent."

	action.originalmessage = sound.originalmessage;
	return action;
}

export function getusers (sound,users) {
	console.log ("registeraction" + " Start");
	let action = new Object;
	action.type = "bot";
	let UserNames = users.chain().simplesort("username").data().map((user)=>{
		return user.username;
	})
	action.to = sound.sourceUser;
	action.message = "USERS:\n"+ UserNames.join("\n")
	action.originalmessage = sound.originalmessage;
	return action;
}

export function registeraction (sound,users) {
	console.log ("registeraction" + " Start");
	let action = new Object;
	action.type = "bot";
	let getDBUser = users.find({ username:  sound.sourceUser.username});
	if (getDBUser.length == 0) {
		let user = sound.sourceUser;
		user.type = user.username.split(')')[0].replace('(','');
		users.insert(user);
		action.to = users.find({ username:  sound.sourceUser.username})[0];
		//console.log(action.to);
		action.message = "You are registered with the Username: "+action.to.username;
	} else {
		action.to = getDBUser[0];
		action.message = "You are already registered with the Username: "+action.to.username;

	}
	return action;
}

export function chataction (sound,users) {
	console.log ("chataction" + " Start");
	let action = new Object;
	let getDBSrcUser = users.find({ username:  sound.sourceUser.username});
	console.log("Sour User Found : "+ getDBSrcUser.length + " - " +sound.sourceUser.username);
	if (getDBSrcUser.length == 0) {
		action.type = "bot";
		action.to = sound.sourceUser;
		action.message = "You are not registered.";
		//console.log (action)
		//throw 'Break'
		return action;
	}

	if (sound.action.destinationuser == 'PREVIOUS_USER') {
		//console.log(getDBSrcUser[0]);
		if (!getDBSrcUser[0].previousUser) {
			action.type = "bot";
			action.to = sound.sourceUser;
			action.message = "You don't have previsous user...";
			return action;
		} else {
			sound.action.destinationuser = getDBSrcUser[0].previousUser;
		}
	}
	
	let regexes = new Array;
	sound.action.destinationuser.split(' ').map((reg)=>{
		let regexe = new Object;
		regexe['$regex']=[reg,'i'];
		regexes.push({username: regexe});
	});
	let userfilter = {'$and':regexes};
	console.log	(JSON.stringify(userfilter));
	let getDBDstUser = users.find({'$or':[
		userfilter,
		{username:sound.action.destinationuser}
	]});
	//let getDBDstUser = 

	console.log("Dest User Found : "+ getDBDstUser.length + " - " +sound.action.destinationuser);
	switch (getDBDstUser.length) {
		case 0 :
			action.type = "bot";
			action.to = getDBSrcUser[0];
			action.message = "The User '"+sound.action.destinationuser+"' is not registered.";
		break;
		case 1 :
			action.type = "chat";
			action.to = getDBDstUser[0];
			action.from = getDBSrcUser[0];
			action.message = action.from.username+magicseparator+sound.action.message;

			//Store Previous User
			getDBSrcUser[0].previousUser = getDBDstUser[0].username;
			users.update(getDBSrcUser[0]);
		break;
		default:
			action.type = "bot";
			action.to = getDBSrcUser[0];
			action.message = "Multiple Users found with '"+sound.action.destinationuser+"'. Please be more accurate.";
		break;
	}
	return action;
}

export function lastchataction (sound,users) {
	console.log ("lastchataction" + " Start");
	let action = new Object;
	action.type = "bot";
	action.to = sound.sourceUser;
	let getDBSrcUser = users.find({ username:  sound.sourceUser.username});
	console.log("Sour User Found : "+ getDBSrcUser.length + " - " +sound.sourceUser.username);
	if (getDBSrcUser.length == 0) {
		action.message = "You are not registered.";
		return action;
	}
	if (!getDBSrcUser[0].previousUser) {
		action.message = "You don't have previsous user...";
	} else {
		action.message = 'The last chat was sent to user : '+ getDBSrcUser[0].previousUser.username;
	}
	return action;
}