var util = require("util"),
    http = require("http"),
    io = require("socket.io"),
    Player = require("./src/player.js"),
    Game = require("./src/game.js"),
    BulletModule = require("./src/bullet.js"),
    Vector = require("./src/vector.js");

var express = require('express');

var socket, game;

function init() {
    // Client
    var app = express();

    var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
    var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
    var serverUrl = process.env.OPENSHIFT_NODEJS_IP ? "http://circlewars-hhaamm.rhcloud.com:8000" : "http://localhost:8080";
    app.set('port', port);
    app.set('ip', ip);

    app.use(express.static(process.cwd() + '/public'));

    var minify = true || !!process.env.OPENSHIFT_NODEJS_IP; // Only minify on openshift

    if ( !minify ) {
        app.use(express.static(process.cwd() + '/src'));
    }

    // set the view engine to ejs
    app.set('view engine', 'ejs');

    app.get('/', function (req, res) {
        res.render('index', { ip: ip, port: port, serverUrl: serverUrl, minify: minify });
    });

    app.get('/over', function (req, res) {
        res.render('over', {});
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
    game.io = io;

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
    client.on("new bullet", onNewBullet);

    __emitState(client);
}

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
}

function onClientDisconnect() {
    util.log("Player has disconnected: "+this.id);

    game.removePlayer(this.id);

    this.broadcast.emit("remove player", {playerId: this.id});
}

function onNewPlayer(data) {
    var player = new Player(100, 100, 0, "New player", 1, data.color);
    player.id = this.id;
    if (game.addPlayerIfNotPresent(player)) {
        console.log("Added player with id " + player.id);
        console.log("Number of players: " + game.players.length);

        this.broadcast.emit("new player", {id: player.id, direction: player.direction, x: player.getX(), y: player.getY(), name: "New Player", color: data.color});
    } else {
        util.error("ERROR: Trying to add an already existent player with id " + player.id);
    }
}

function onMovePlayer(data) {
    util.log("Player " + data.id + " moved");
    if (!data.id) {
        console.log("WARN: onMovePlayer() trying to move without ID");
        console.log(data);
        return;
    }

    var player = game.getPlayer(data.id);

    if (!player) {
        console.log("WARN: onMovePlayer() no player with id " + data.id);
        return;
    }

    player.x = data.position.x;
    player.y = data.position.y;

    this.broadcast.emit("move player", {playerId: data.id, position: {x: data.position.x, y: data.position.y}, direction: data.direction});
}

function onNewBullet(data) {
    var bulletTypes = BulletModule.bulletTypes;

    util.log("New bullet");
    this.broadcast.emit("new bullet", data);

    console.log(data);

    var v = new Vector(data.direction, data.outsideSuicideZone);
    v.originX = data.position.x;
    v.originY = data.position.y;
    console.log(data);
    var bulletType = bulletTypes[data.bulletTypeIndex];
    var bullet = new bulletType(v.x(), v.y(), data.direction, false);

    bullet.id = data.id;
    bullet.randomNumbers = data.randomNumbers;
    console.log("new bullet");
    game.addEntity(bullet, false);
}

function __emitState(client) {
    var walls = [];
    var wallEntities = game.getEntities("wall");
    console.log("Walls: " + wallEntities.length);
    for(var i = 0; i < wallEntities.length; i++) {
        walls.push({
            material: wallEntities[i].material,
            x: wallEntities[i].x,
            y: wallEntities[i].y,
            randomNumbers: wallEntities[i].randomNumbers,
            id: wallEntities[i].id
        });
    }

    var weaponEntities = game.getEntities("weapon");
    var weapons = [];
    console.log("Weapons: " + weaponEntities.length);
    for(i = 0; i < weaponEntities.length; i++) {
        weapons.push({
            weaponTypeIndex: weaponEntities[i].weaponTypeIndex,
            position: {
                x: weaponEntities[i].x,
                y: weaponEntities[i].y
            },
            id: weaponEntities[i].id
        });
    }

    var players = [];
    for(i = 0; i < game.players.length; i++) {
        if (!game.players[i].id) {
            console.log(game.players[i]);
            throw "Player without ID!";
        }
        players.push({
            x: game.players[i].x,
            y: game.players[i].y,
            name: "New Player",
            id: game.players[i].id,
            direction: game.players[i].direction,
            color: game.players[i].color
        });
    }

    client.emit("state", {
        players: players,
        weapons: weapons,
        walls: walls,
        opts: game.opts,
        id: client.id
    });
}
