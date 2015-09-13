(function() {
    var startGame = function() {
        var opts = {};
        opts["minWalls"] = parseInt($("#createGameForm [name='minWalls']").val());
        opts["maxWalls"] = parseInt($("#createGameForm [name='maxWalls']").val());
        opts["weaponGeneration"] = parseFloat($("#createGameForm [name='weaponGeneration']").val());

        console.log(opts);

        var ctx = $('#canvas')[0].getContext("2d");
        var game = new Game(ctx, $('#canvas').attr("width"), $('#canvas').attr("height"), opts);

        game.init();

        game.onGameOver = function() {
            $("#gameEndMenu").show();
            delete game;
        };
    };

    var startMultiplayerGame = function() {
        //TODO: move all this code to CLIENT.js ?

        // serverUrl is defined in index.ejs
        var socket = io.connect(serverUrl, {transports: ["websocket"]});

        var opts = {};
        // opts["minWalls"] = parseInt($("#createGameForm [name='minWalls']").val());
        // opts["maxWalls"] = parseInt($("#createGameForm [name='maxWalls']").val());
        // opts["weaponGeneration"] = parseFloat($("#createGameForm [name='weaponGeneration']").val());

        // Hardcoded garbage
        opts["minWalls"] = 10;
        opts["maxWalls"] = 200;
        opts["weaponGeneration"] = 0.9999;
        opts["multiplayer"] = "client";

        var ctx = $('#canvas')[0].getContext("2d");
        $($('#canvas')[0]).attr("width", "800px");
        $($('#canvas')[0]).attr("height", "600px");
        var game = new Game(ctx, 800, 600, opts);
        game.socket = socket;

        // game.init();
        var keyboard = {
            left: 37, // left
            right: 39, // right
            forward: 38, // forward
            backward: 40, // down
            shoot: 13 // ENTER
        };
		var player1 = new Player(100, 100, 1, "Player 1", keyboard);
		$(document).keydown(function(evt) {
			player1.onKeyDown(evt);
            socket.emit("move player", {id: player1.id, position: {x: player1.getX(), y: player1.getY()}});
			return false;
		});
		$(document).keyup(function(evt) {
			player1.onKeyUp(evt);
			return false;
		});

        //TODO: move all this code to client.js

        game.initClient(player1);

        game.onGameOver = function() {
            //TODO: let the server know we died
            window.location.href = '/over';
        };

        socket.on("state", function(data) {
            if (!data.id) {
                throw "No id provided from server";
            }

            console.log("State");
            console.log(data.opts);
            console.log(data.players);
            console.log("Your session id is " + data.id);

            console.log("players: " + game.players.length);

            player1.id = data.id;



            for(var i = 0; i < data.players.length; i++) {
                var player = new Player(
                    data.players[i].x,
                    data.players[i].y,
                    0,
                    data.players[i].name,
                    1
                );
                player.id = data.players[i].id;

                if (!data.players[i].id) {
                    throw "Error: player without ID";
                }

                if (player1.id != player.id) {
                    console.log("adding player " + player.id);
                    console.log(player.id);
                    game.addPlayerIfNotPresent(player);
                }
            }

            console.log("players" + game.players.length);

            console.log("weapons");
            console.log(data.weapons);
            for(i = 0; i < data.weapons.length; i++) {
                var weapon = data.weapons[i];
                console.log(weapon.weaponTypeIndex);
                game.addWeapon(weapon.weaponTypeIndex, weapon.position.x, weapon.position.y, weapon.id);
            }

            console.log(data.walls);
            for(i = 0; i < data.walls.length; i++) {
                game.addEntity(new Wall(data.walls[i].x, data.walls[i].y, data.walls[i].material));
            }

            console.log("Send new player: " + player1.id);
            socket.emit("new player", {x: player1.getX(), y: player1.getY(), name: "Player"});
        });
        socket.on("connect", function() {
            console.log("Connected");

        });
        socket.on("disconnect", function(data) {
            console.log(data);
        });
        socket.on("new player", function(player) {
            console.log("New player arrived");
            console.log(player);
            var newPlayer = new Player(player.x, player.y, player.direction, player.name);
            newPlayer.id = player.id;

            if (!player.id) {
                console.log("WARNING: Receiving player without ID from server");
                return;
            }

            if (player.id == game.player1.id ) {
                console.log("WARNING: Receiving player with same id as player1 from server");
                return;
            }

            console.log(newPlayer);
            game.addEntity(newPlayer);
            game.players.push(newPlayer);
        });
        socket.on("move player", function(data) {
            var player = game.getPlayer(data.playerId);
            if (!player) {
                console.log("WARNING: no player with ID " + data.playerId);
                return;
            }
            player.x = data.position.x;
            player.y = data.position.y;
        });
        socket.on("remove player", function(playerId) {
            console.log("removing player " + playerId);
            game.removePlayer(playerId);
        });
        socket.on("new weapon", function(weapon) {
            console.log("New weapon arrived from the server: " + weapon.x + " " + weapon.y);
            game.addWeapon(weapon.weaponTypeIndex, weapon.position.x, weapon.position.y, weapon.id);
        });
        socket.on("weapon taken", function(data) {
            console.log("Weapon taken: " + data.id);
            var weapon = game.getEntityById(data.id);
            game.removeEntity(weapon);
            console.log(weapon);
            var player = game.getPlayer(data.playerId);
            player.addWeapon(weapon);
        });
        socket.on("new bullet", function(data) {
            var v = new Vector(data.direction, data.outsideSuicideZone);
            v.originX = data.position.x;
            v.originY = data.position.y;
            console.log(data);
            var bulletType = bulletTypes[data.bulletTypeIndex];
            var bullet = new bulletType(v.x(), v.y(), data.direction, false);

            bullet.id = data.id;
            bullet.randomNumbers = data.randomNumbers;
            console.log(bullet);
            console.log("new bullet");
            game.addEntity(bullet, false);
        });

        socket.on("bullet bounce", function(data) {

        });
    };

    var setButtonCallbacks = function() {
        $("#newGameBtn").click(function() {
            setStage("CreateGame");
            return false;
        });

        $("#newMultiplayerGameBtn").click(function() {
            setStage("Game");

            startMultiplayerGame();

            return false;
        });


        $("#startGameBtn").click(function() {
            setStage("Game");

            startGame();

            return false;
        });

        // --- Buttons of game end menu ---
        $("#newGame2Btn").click(function() {
            $("#gameEndMenu").hide();
            console.log("restart");
            setStage("CreateGame");
            return false;
        });

        $("#restartGameBtn").click(function() {
            $("#gameEndMenu").hide();
            console.log("restart");
            setStage("Game");
            startGame();
            return false;
        });

        $("#exitBtn").click(function() {
            $("#gameEndMenu").hide();
            setStage("Init");
            return false;
        });
        // ---
    };

    var setStage = function(stage) {
        $(".stage").hide();
        $("#stage"+stage).show();
    };

    $(document).ready(function() {
        setButtonCallbacks();

        setStage("Init");
    });
})();
