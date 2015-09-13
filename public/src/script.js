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
        var socket = io.connect("http://localhost:8000", {transports: ["websocket"]});

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
        var game = new Game(ctx, $('#canvas').attr("width"), $('#canvas').attr("height"), opts);

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

        game.addEntity(player1);
        game.players.push(player1);

        game.initClient(player1);
        // game.initClient(player1);
        // game.initServer();

        game.onGameOver = function() {
            $("#gameEndMenu").show();
            delete game;
        };

        socket.on("state", function(data) {
            console.log("State");
            console.log(data.opts);
            console.log(data.players);
            console.log("Your session id is " + data.id);

            player1.id = data.id;

            for(var i = 0; i < data.players.length; i++) {
                game.addPlayerIfNotPresent(data.players[i]);
            }

            console.log("Send new player");
            socket.emit("new player", {x: player1.getX(), y: player1.getY(), name: "Player"});
        });
        socket.on("connect", function() {
            console.log("Connected");

        });
        socket.on("disconnect", log);
        socket.on("new player", function(player) {
            console.log("New player arrived");
            console.log(player);
            var newPlayer = new Player(player.x, player.y, player.name, null);
            game.addEntity(newPlayer);
            game.players.push(newPlayer);
        });
        socket.on("move player", function(data) {
            var player = game.getPlayer(data.playerId);
            player.x = data.position.x;
            player.y = data.position.y;
        });
        socket.on("remove player", function(playerId) {
            console.log("removing player " + playerId);
            game.removePlayer(playerId);
        });

        function log(data) {
            console.log(data);
        }
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
