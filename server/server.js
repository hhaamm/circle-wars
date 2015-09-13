var util = require("util"),
    io = require("socket.io"),
    Player = require("../src/player.js"),
    Game = require("../src/game.js"),
    Util = require("../src/util.js"),
    Wall = require("../src/wall.js").Wall;

var socket, players, game;

var debug = Util.debug;

function init() {
    players = [];

    // se debe crear un juego
    game = new Game(null, 800, 600, {multiplayer: "server"});

    socket = io.listen(8000);

    socket.on('connection', onSocketConnection);

    game.initServer();
}

init();

/**
 * onSocketConnection is the only function that has the "client" object
 * All the other functions are able to use "this.id".
 */
function onSocketConnection (client) {
    socket.set("transports", ["websocket"]);
    socket.set("log level", 2);

    console.log("New player has connected: "+client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("move player", onMovePlayer);

    this.emit("state", {
        players: game.players,
        // walls: game.entities,
        opts: game.opts,
        id: client.id
    });
};

function onClientDisconnect() {
    util.log("Player has disconnected: "+this.id);

    game.removePlayer(this.id);

    this.broadcast.emit("remove player " + this.id, {id: this.id});
};

function onNewPlayer(data) {
    var newPlayer = new Player(data.x, data.y);
    newPlayer.id = this.id;

    // Let all the players about the new player
    // this.broadcast.emit("new player", newPlayer);
    this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), name: "New Player"});

    // Let client know about all the players
    var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i];
        // this.emit("new player", existingPlayer);
        this.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), name: "New Player"});
    };

    players.push(newPlayer);
};

function onMovePlayer(data) {
    util.log("Player " + data.id + " moved");
    this.broadcast.emit("move player", {id: data.id, position: {x: data.position.x, y: data.position.y}});
};
