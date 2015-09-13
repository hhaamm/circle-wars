var util = require("util"),
    http = require("http"),
    io = require("socket.io"),
    Player = require("./public/src/player.js"),
    Game = require("./public/src/game.js"),
    Util = require("./public/src/util.js"),
    Wall = require("./public/src/wall.js").Wall;

var
    fs = require('fs');

var express = require('express');

var socket, game;

var debug = Util.debug;

function init() {
    // Client
    var app = express();

    var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
    var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
    var serverUrl = process.env.OPENSHIFT_NODEJS_IP ? "http://circlewars-hhaamm.rhcloud.com:8000" : "http://localhost:8080";
    app.set('port', port);
    app.set('ip', ip);

    app.use(express.static(process.cwd() + '/public'));

    // set the view engine to ejs
    app.set('view engine', 'ejs');

    app.get('/', function (req, res) {
        res.render('index', { ip: ip, port: port, serverUrl: serverUrl});
    });

    var http2 = http.Server(app);
    socket = io.listen(http2);

    http2.listen(port, ip, function() {
        console.log("✔ Express server listening at %s:%d ", app.get('ip'),app.get('port'));
        initGameServer();
    });
}

function initGameServer() {
    // se debe crear un juego
    game = new Game(null, 800, 600, {multiplayer: "server"});

    socket.on('connection', onSocketConnection);

    //TODO: code smell
    game.socket = socket;

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

    console.log("New connection: " + client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("move player", onMovePlayer);
    client.on("weapon taken", onWeaponTaken);

    var walls = [];
    var wallEntities = game.getEntities("wall");
    for(var i = 0; i < wallEntities.length; i++) {
        walls.push({
            material: wallEntities[i].material,
            x: wallEntities[i].x,
            y: wallEntities[i].y
        });
    }
    var weapons = [];
    var players = [];
    for(i = 0; i < game.players.length; i++) {
        players.push({
            x: game.players.x,
            y: game.players.y,
            name: "New Player",
            id: game.players.id
        });
    }
    this.emit("state", {
        players: players,
        weapons: weapons,
        walls: walls,
        opts: game.opts,
        id: client.id
    });
};

function onWeaponTaken(data) {
    util.log("Weapon taken: " + data.id);
    console.log(data.playerId);
    var entity = game.getEntityById(data.id);
    if (entity) {
        var player = game.getPlayer(data.playerId);
        player.addWeapon(entity);
        game.removeEntity(entity);
        this.broadcast.emit("weapon taken", data);
    }
};

function onClientDisconnect() {
    util.log("Player has disconnected: "+this.id);

    game.removePlayer(this.id);

    this.broadcast.emit("remove player " + this.id, {id: this.id});
};

function onNewPlayer(data) {
    console.log("New player has connected: " + this.id);
    var newPlayer = new Player(data.x, data.y);
    newPlayer.id = this.id;

    var player = new Player(data.x, data.y, 0, "New player", 1);
    player.id = this.id;
    game.addPlayerIfNotPresent(player);

    // Let all the players about the new player
    // this.broadcast.emit("new player", newPlayer);
    this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), name: "New Player"});

    // Let client know about all the players
    var i, existingPlayer;
    for (i = 0; i < game.players.length; i++) {
        existingPlayer = game.players[i];
        this.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), name: "New Player"});
    };

    console.log("Number of players: " + game.players.length);
};

function onMovePlayer(data) {
    util.log("Player " + data.id + " moved");
    this.broadcast.emit("move player", {id: data.id, position: {x: data.position.x, y: data.position.y}});
};
