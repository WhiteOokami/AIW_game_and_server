const webSocket = require("ws");
const net = require("net");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const http = require("http");
const express = require("express");
const cors = require('cors');

class PlayerData {
	constructor(id, x) {
		this.id = id;
		this.x = x;
		this.status = 0;
		this.key = '';
	}
	posX = 0;
	posY = 0;
	scaleY = 0;
	scaleX = 0;
	name = null;
	lives = 3;
	finished = false;
};


class PlayerInfo{
	constructor(id, name, crowns, wins, loses, password) {
		this.id = id;
		this.name = name;
		this.crowns = crowns;
		this.wins = wins;
		this.loses = loses;
		this.password = password;
	}
};

class payLoad {
	constructor(type, data) {
		this.type = type;
		this.data = data;
	}
};

class record {
	constructor(name, speed) {
		this.name = name;
		this.speed = speed;
	}
};

const lobby = new webSocket.Server({ port: 9091 });
const signInSocket = new webSocket.Server({ port: 3002 });
let abc = null;
const clients = {};
const rooms = {};
let numberOfRooms = 0;
const maxPlayers = 10;
const minPlayers = 2;
let playersWaiting = 0;
let secondsTilStart = 10;
var timer;
let timerStarted = false;
let maps = [200, 200, 200]; // time for each map
let allPlayers = [];
let records = [];
const playersFile = "players.txt";
const recordsfile = "records.txt";
const recordSize = 5;
const pointsLost = -5;


function saveLeaderboardToFile() {
	fs.writeFile(playersFile, "", (error) => { if (error) throw error }); //clear file contents
	for (var i = 0; i < allPlayers.length; i++) {
		let aPlayer = [allPlayers[i].id, allPlayers[i].name, allPlayers[i].crowns, allPlayers[i].wins, allPlayers[i].loses, allPlayers[i].password, "\n"].join(" ");
		fs.appendFile(playersFile, aPlayer, (error) => { if (error) throw error }); // add players to file
		//console.log(aPlayer);
	}
};

function addCrowns(playerId, numOfCrowns, win, lose) {
	for (var i = 0; i < allPlayers.length; i++) {
		if (allPlayers[i].id == playerId) {
			if (numOfCrowns < 0) {
				if (allPlayers[i].crowns > 30) // remove only if larger than 30
					allPlayers[i].crowns += numOfCrowns;
			}
			else {
				allPlayers[i].crowns += numOfCrowns;
            }
			
			allPlayers[i].wins += win;
			allPlayers[i].loses += lose;
		}

	}	
	saveLeaderboardToFile();
};

function saveRecordsToFile() {
	fs.writeFile(recordsfile, "", (error) => { if (error) throw error }); //clear file contents
	for (var i = 0; i < records.length; i++) {
		let aPlayer = [records[i].name, records[i].speed, "\n"].join(" ");
		fs.appendFile(recordsfile, aPlayer, (error) => { if (error) throw error }); // add record to file
		//console.log(aPlayer);
	}
}

function sortLeaderboard() {
	allPlayers.sort((aPlayer, bPlayer) => bPlayer.crowns - aPlayer.crowns);
	saveLeaderboardToFile();
};

function sortRecords() {
	records.sort((aPlayer, bPlayer) => aPlayer.speed - bPlayer.speed);
	if (records.length > recordSize) {
		records = records.slice(0, recordSize);
	}
	saveRecordsToFile();
};


// get players from text file
fs.readFile(playersFile, 'utf8', function (err, data) {
	let dataLines = data.split("\n");
	console.log(dataLines);
	// add element to list from largest crowns to least
	for (var i = 0; i < dataLines.length; i++) {
		let playerInfoData = dataLines[i].split(' ');
		if (playerInfoData[3] == null)
			break;
		let thePlayer = new PlayerInfo(playerInfoData[0], playerInfoData[1], parseInt(playerInfoData[2]), parseInt(playerInfoData[3]), parseInt(playerInfoData[4]), playerInfoData[5]);
		allPlayers[i] = thePlayer;
	}
	console.log(allPlayers);
	sortLeaderboard();
	
});

fs.readFile(recordsfile, 'utf8', function (err, data) {
	let dataLines = data.split("\n");
	console.log(dataLines);
	// add element to list from largest crowns to least
	for (var i = 0; i < dataLines.length; i++) {
		let playerInfoData = dataLines[i].split(' ');
		if (playerInfoData[1] == null)
			break;
		let aRecord = new record(playerInfoData[0], parseInt(playerInfoData[1]));
		records[i] = aRecord;
	}
	
	sortRecords();
	console.log(records);
});



// http get leaderboard request
const app = express();

//http get records request
const app2 = express();

app.use(cors());
app.get('/', (req, res) => {
	sortLeaderboard();
	res.json({
		data: allPlayers,
	});
});

app2.use(cors());
app2.get('/', (req, res) => {
	sortRecords();
	res.json({
		data: records,
	});
});

app2.use(cors());
app2.get('/', (req, res) => {
	sortRecords();
	res.json({
		data: records,
	});
});

app2.use(cors());
app2.get('/', (req, res) => {
	sortRecords();
	res.json({
		data: records,
	});
});

app.listen(3000, () => {
	console.log('leaderboard is listening on port 3000');
});

app2.listen(3001, () => {
	console.log('records is listening on port 3001');
});

//create new room
function createNewRoom(portNum, clienta, map) {

	let count = 0;
	let finished = 0;
	let players = Object.assign({}, clienta);
	let wss = new webSocket.Server({ port: portNum });
	let numOfPlayers = 0;
	let countdown = null;
	let countDownTime = 5;
	let watch = null;
	let time = 0;


	for (i in clienta)
		numOfPlayers += 1;

	wss.broadcast = function broadcast(msg) {
		wss.clients.forEach(function each(client) {
			client.send(msg);
		});
	};

	
	function timeGame() {
		time += 1;
		wss.broadcast(JSON.stringify(new payLoad("time", time)));
	}
	

	//countdown at beginning to ensure that everyone starts simutaneoulsy
	function startCountDown() {
		wss.broadcast(JSON.stringify(new payLoad("start", countDownTime)));
		if (countDownTime == 0) {
			//start watch countdown
			watch = new setInterval(timeGame, 1000);
			clearInterval(countdown);
		}
		countDownTime-=1;
    }
	

	//on connect to room
	wss.on('connection', ws => {
		//console.log("client connected");
		count += 1;
		//start game & time once all players join
		if (count == numOfPlayers) {
			if (countdown == null)
				countdown = new setInterval(startCountDown, 1000);
        }
		

		//create player
		let player = null;

		ws.send(JSON.stringify(new payLoad("initRoom", [players, maps[map - 1], pointsLost])));
		//send player data

		ws.on('close', () => {
			console.log("client disconnected");
			count -= 1;
			
			//remove crowns if lost
			if (!players[player.id].finished)
					addCrowns(player.id, pointsLost, 0, 1);

			delete players[player.id];
			wss.broadcast(JSON.stringify(new payLoad("remove", player)));
			

			if (count == 0) {
				console.log("no more players");
				wss.close();
				clearInterval(watch);
            }
		})

		ws.on('message', data => {
			myData = JSON.parse(data);

			//update position of player
			if (myData.type == "updatePlayerState" || myData.type == "updateEnemy" || myData.type == "updateItem" || myData.type == "emoji") {
				//console.log(player.id + "is now at (" + myData.data[0] + ", " + myData.data[1] + ")");
				
				if (myData.data[1] == "win") {
					
					finished += 1;

					// add record
					records.push(new record(players[player.id].name, time));
					sortRecords();
					let crownsWon = 0;
					// add crowns
					
					switch (finished) {
						case 1:
							crownsWon = 20;
							break;
						case 2:
							crownsWon = 16;
							break;
						case 3:
							crownsWon = 13;
							break;
						default:
							crownsWon = 10;
							break;
					}
					addCrowns(player.id, crownsWon, 1,0);

					console.log(player.id + " finsihed in " + finished + " place");
					wss.broadcast(JSON.stringify(new payLoad("finish", [player, finished, crownsWon])));
					players[player.id].finished = true;
                }
				else
					wss.broadcast(data);
				//players[player.id].posX = myData.data[0];
				//players[player.id].posY = myData.data[1];

				//wss.broadcast(JSON.stringify(new payLoad("updatePlayerState", players)));
			}
			else if (myData.type == "playerInfo") {
				player = players[myData.data];
			}
			else if (myData.type == "position") {
				players[player.id].posX = myData.data[0];
				players[player.id].posY = myData.data[1];
				players[player.id].scaleY = myData.data[2];
				players[player.id].scaleX = myData.data[3];
				wss.broadcast(JSON.stringify(new payLoad("positions", players)));
            }
		})	
		console.log(count + " clients");
	})

}

lobby.broadcast = function broadcast(msg) {
	lobby.clients.forEach(function each(client) {
		client.send(msg);
	});
};


function myTimer() {
	secondsTilStart -= 1;
	lobby.broadcast(JSON.stringify(new payLoad("status", ["starting", secondsTilStart])));

	//start game
	if (secondsTilStart <= 0) {
		var portN = 0;
		var srv = net.createServer(function (sock) {
			sock.end('Hello world\n');
		});

		srv.listen(0, function () {
			let map = Math.floor(Math.random() * maps.length) + 1;
			//let map = 3;
			console.log('Listening on port ' + srv.address().port);
			portN = srv.address().port;
			srv.close();
			createNewRoom(portN, clients, map);
			lobby.broadcast(JSON.stringify(new payLoad("status", ["start", portN, map])));
		});
		secondsTilStart = 10;
		clearInterval(timer);
		timerStarted = false;
		//portN -= 1;
    }
}

//on connect to lobby
lobby.on('connection', ws => {
	playersWaiting += 1;
	secondsTilStart = 10;
	console.log(playersWaiting);
	let myName = null;
	let player = new PlayerData(uuidv4(), 0);
	let alreadyExisted = false;
	//send # of users to everyone
	lobby.broadcast(JSON.stringify(new payLoad("lobbyInfo", playersWaiting)));

	ws.on('close', () => {
		
		playersWaiting -= 1;
		lobby.broadcast(JSON.stringify(new payLoad("lobbyInfo", playersWaiting)));

		if (!alreadyExisted) {
			console.log(myName + " disconnected");
			delete clients[player.id];
		} else {
			console.log(myName + " already existed");
        }
			

		// not enough players
		if (playersWaiting < minPlayers && timerStarted) {
			console.log("start room stopped");
			lobby.broadcast(JSON.stringify(new payLoad("status", ["stop"])));
			clearInterval(timer);
			timerStarted = false;	
        }
	})

	ws.addEventListener('message', ({ data }) => {
		myData = JSON.parse(data);
		if (myData.type == "player_name") {	
			myName = myData.data[0];
			console.log(myName + " joined");

			//create player data
			player.name = myName;

			if (myData.data[1] == "wechat") {

				var findIt = allPlayers.find(obj => {
					return obj.id === myData.data[2]
				})

				if (findIt == null) {
					allPlayers.push(new PlayerInfo(myData.data[2], myData.data[0], 0, 0, 0, null)) // create new player
					saveLeaderboardToFile();
                }
					
				
				player.id = myData.data[2];
			}
			if (clients[player.id] != null) {
				ws.close();
				alreadyExisted = true;
			}
			else {

				console.log(player.id);
				clients[player.id] = player;
				ws.send(JSON.stringify(new payLoad("playerInfo", player.id)));

				//enough players = start game
				if (playersWaiting >= minPlayers) {
					if (!timerStarted) {
						timer = new setInterval(myTimer, 1000);
						timerStarted = true;
					}

					lobby.broadcast(JSON.stringify(new payLoad("status", ["starting", secondsTilStart])));
					console.log('starting room');

					// max players =  start immediately
					if (playersWaiting > maxPlayers - 1)
						lobby.broadcast(JSON.stringify(new payLoad("status", ["start"])));
				}
            }

		}
	});
	
});


signInSocket.on('connection', ws => {
	
	ws.on('close', () => {
		
	})

	ws.addEventListener('message', ({ data }) => {
		myData = JSON.parse(data);
		if (myData.type == "signIn") {
			let rightPass = null;
			let username = myData.data[0];
			let password = myData.data[1];
			console.log(username + " is signing in, pass = " + password);
			//sign in

			for (var i = 0; i < allPlayers.length; i++) {
				if (allPlayers[i].name == username) {
					rightPass = allPlayers[i].password;
					if (rightPass == password) {
						//success
						console.log(username + " successfully signed in");
						ws.send(JSON.stringify(new payLoad("success", allPlayers[i])));

					} else {
						console.log("wrong password");
						ws.send(JSON.stringify(new payLoad("failed", null)));
					}
					break;
				}
			}

			if (rightPass == null) {
				//create new user
				let thePlayerId = uuidv4();
				let aplayer = new PlayerInfo(thePlayerId, username, 0, 0, 0, password)
				allPlayers.push(aplayer); // create new player
				saveLeaderboardToFile();

				ws.send(JSON.stringify(new payLoad("success", aplayer)));

			}

		}
	});

});

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
	console.log(allPlayers);

	if (options.cleanup) console.log('clean');
	if (exitCode || exitCode === 0) console.log(exitCode);
	if (options.exit) process.exit();
}


//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));