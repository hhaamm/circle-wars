if (typeof window == 'undefined') {
    var WallModule = require("./wall.js");
    Wall = WallModule.Wall;
    wallMaterials = WallModule.wallMaterials;
    StoneMaterial = WallModule.StoneMaterial;
    setIntervalWithContext = require("./util.js").setIntervalWithContext;
    var WeaponModule = require("./weapon.js");
    weaponTypes = WeaponModule.weaponTypes;
    uuid = require("node-uuid");
    Client = require("./client.js");
}

var Game = function(ctx, width, height, opts) {
	this.ctx = ctx;
	this.WIDTH = width;
	this.HEIGHT = height;

    this.players = [];
	this.entities = []; // List of entities that will be drawn and process
	// An entity is an object that implements draw(), process() and setGame methods
	// and implements type (player, bullet) and radius properties

	this.removeEntities = [];

    // It can be null (single player), "client" or "server"
    this.multiplayer = opts.multiplayer;
    this.isServer = opts.multiplayer == "server";
    this.isClient = opts.multiplayer == "client";
    this.isSinglePlayer = !opts.multiplayer;
    this.isMultiplayer = !!opts.multiplayer;

    // Game finished callback
    // Use this from outside to be noticed that the game has finished
    this.onGameOver = function(){};

    // Options handling
    // TODO: unify default values with main menu
    var defaults = {
        maxWalls: 50,
        weaponGeneration: 0.999,
        minWalls: 0
    };
    this.opts = opts || {};
    this.opts = extend({}, defaults, this.opts);

	/* PUBLIC FUNCTIONS */
	this.init = function() {
        var _self = this;
        if (!this.multiplayer) {
            var keyboard1 =         {
                left: 65, // A,
                right: 68, // D
                forward: 87, // W
                backward: 83, // S,
                shoot: 32 // ENTER
            };

            var keyboard2 = {
                left: 37, // left
                right: 39, // right
                forward: 38, // forward
                backward: 40, // down
                shoot: 13 // ENTER
            };
		    this.player1 = new Player(100, 100, 1, "Player 1", keyboard1);
		    this.player2 = new Player(500, 400, 2, "Player 2", keyboard2);

            // only for debug purpuses
            // this.player1.weapon = new MissileLauncher(0,0);
            // this.player2.weapon = new MissileLauncher(0,0);

		    $(document).keydown(function(evt) {
			    _self.player1.onKeyDown(evt);
			    return false;
		    });
		    $(document).keyup(function(evt) {
			    _self.player1.onKeyUp(evt);
			    return false;
		    });

		    $(document).keydown(function(evt) {
			    _self.player2.onKeyDown(evt);
			    return false;
		    });
		    $(document).keyup(function(evt) {
			    _self.player2.onKeyUp(evt);
			    return false;
		    });

		    this.addEntity(this.player1);
		    this.addEntity(this.player2);

            this.players.push(this.player1);
            this.players.push(this.player2);

        }

        this.__generateWalls();

        this.resources = new ResourceLoader();
        this.resources.loadResources(function() {
		    _self.runInterval = setIntervalWithContext(_self.run, 10, _self);
        });
	};

    this.initServer = function() {
        var _self = this;

        this.players = [];

        this.__generateWalls();

        _self.runInterval = setIntervalWithContext(_self.run, 10, _self);
    };

    this.__generateWalls = function() {
		// Add random walls (not in the player's square!)
		// TODO: move this code to a GameConstructorObject and have many game constructors (or map constructors)
        // using composition
        debug(this.opts);
		var walls = Math.floor(Math.random() * (this.opts.maxWalls - this.opts.minWalls - 1)) + this.opts.minWalls;
		var sampleWall = new Wall(0,0, {});
		debug("Walls: "+walls);
		var x, y;
		for (var i = 0; i < walls; i++) {
			x = Math.floor(Math.random() * this.WIDTH  / sampleWall.width) * sampleWall.width;
			y = Math.floor(Math.random() * this.HEIGHT  / sampleWall.height) * sampleWall.height;
			// TODO: check we are not repeating two walls in the same place! Have a matrix for this.. ? It's an easier approach.
			// TODO: we need a method to get "the square properties for a circle entity"
			if (this.multiplayer || // No discrimination when in multiplayer
                (
                    (x != this.player1.x - this.player1.radius / 2 || y != this.player1.y - this.player1.radius / 2)
				        &&
				        (x != this.player2.x - this.player2.radius / 2 | y != this.player2.y - this.player2.radius / 2))) {
				var material = wallMaterials[Math.floor(Math.random()*wallMaterials.length)];
				this.addEntity(new Wall(x, y, material));
			}
		}

        // TODO: si el armagedon le pega directamente a un usuario entonces +500 a la vida
        // TODO: manchas de sangre cuando te pega
        // TODO: make this optional
        for(i = 0; i < this.WIDTH/20; i++) {
            this.addEntity(new Wall(i*20, 0, StoneMaterial));
            this.addEntity(new Wall(i*20, this.HEIGHT - 20, StoneMaterial));
        }
        for( i = 0; i < this.HEIGHT/20; i++) {
            this.addEntity(new Wall(0, i*20, StoneMaterial));
            this.addEntity(new Wall(this.WIDTH - 20, i*20, StoneMaterial));
        }

        // house building
        /*
         for (var i= 0; i < 8; i++) {
         this.addEntity(new Wall(100+i*20, 140, material));
         this.addEntity(new Wall(100+i*20, 300, material));
         }
         for (var j = 0;j <8; j++) {
         this.addEntity(new Wall(100, 140+j*20, material));
         if (j % 2 == 0) {
         this.addEntity(new Wall(240, 140+j*20, material));
         } else {
         this.addEntity(new Wall(240, 140+j*20, GlassMaterial));
         }
         }*/
    };

    this.initClient = function(player) {
        var _self = this;

        this.player1 = player;
        this.addEntity(player);
        this.players.push(player);

        // add ourselves as a player

        // get players

        // get entities

        // get bullets, etc.

        // but we should do all of that in the interval?

        // TODO: init socket here?

        this.client = new Client(this, this.socket);

        this.resources = new ResourceLoader();
        this.resources.loadResources(function() {
		    _self.runInterval = setIntervalWithContext(_self.run, 10, _self);
        });
    };

	this.addEntity = function(entity, sendToServer) {
		entity.setGame(this);
		this.entities.push(entity);

        if (this.isClient && sendToServer) {
            switch (entity.type) {
                case "bullet":
                console.log(entity);
                console.log("Sending bullet to server");
                entity.id = uuid.v1();
                entity.generateRandomNumbers();
                this.client.addBullet(entity);
                break;
            }
        }
	};

	// Remove entity after processing all other entities
	this.removeEntity = function(entity) {
		this.removeEntities.push(entity);
	};

	/* PRIVATE FUNCTIONS */
	this.run = function() {
        if (!this.isServer) {
		    this.clear();
        }
		var _self = this;

        // Entities can use this time
        this.currentTime = new Date().getTime();

        // Performant for loops
        var i;
        for(i = 0; i < this.entities.length; i++) {
            this.entities[i].process();
        }

        if (!this.isServer) {
            for(i = 0; i < this.entities.length; i++) {
                this.entities[i].draw(this.ctx);
            }

		    this.drawUI();
        }

		// remove entities
        for(var j = 0; j < this.removeEntities.length; j++) {
            var entity = this.removeEntities[j];
			var index = _self.entities.indexOf(entity);
			if (index > -1) {
				_self.entities.splice(index, 1);
			}
        }

		this.removeEntities = [];

        // Un juego multiplayer nunca termina
		if (!this.multiplayer &&
            (this.player1.life <= 0 || this.player2.life <= 0)) {
			// Game over
			clearInterval(this.runInterval);

			this.ctx.fillStyle = "white";
			this.ctx.font = "bold 30px Arial";
			this.ctx.fillText("Game Over", 100, 200);

			this.ctx.font = "bold 20px Arial";
			if (this.player1.life > 0) {
				this.ctx.fillText("Player 1 Wins", 100, 300);
			} else {
				this.ctx.fillText("Player 2 Wins", 100, 300);
			}

            this.onGameOver();
		}

        // Random weapon generation
        // TODO: make this exponential with the number of weapons available in the map!
        if (Math.random() > this.opts.weaponGeneration && this.getEntityCount("weapon") < 10 && !this.isClient) {
            debug("Added weapon");
            var weaponTypeIndex = Math.floor(Math.random()*weaponTypes.length);

            var weapon = this.addWeapon(weaponTypeIndex, null, null);

            if (this.isServer) {
                this.socket.emit("new weapon", {
                    position: {
                        x: weapon.x,
                        y: weapon.y
                    },
                    id: weapon.id,
                    weaponTypeIndex: weaponTypeIndex
                });

                debug("new weapon generated " + weapon.name + " " + weapon.id);
                debug("Number of weapons: " + this.getEntityCount("weapon"));
            }
        }
	};

    this.addWeapon = function(weaponTypeIndex, x, y, id) {
        var weaponConstructor = weaponTypes[weaponTypeIndex];
        var weapon;
        if (this.isServer || this.isSinglePlayer) {
            weapon = new weaponConstructor(Math.floor(Math.random()*this.WIDTH), Math.floor(Math.random()*this.HEIGHT));
            weapon.x -= weapon.width / 2;
            weapon.y -= weapon.height / 2;
            weapon.id = uuid.v1();
        } else {
            weapon = new weaponConstructor(x, y);
            weapon.id = id;
        }

        this.addEntity(weapon);

        return weapon;
    };

    this.getEntityCount = function(type) {
        var count = 0;
        for(var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].type == type)
                count++;
        }
        return count;
    };

    this.getEntities = function(type) {
        var entities = [];
        for(var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].type == type)
                entities.push(this.entities[i]);
        }
        return entities;
    };


	this.drawUI = function() {
        if (!this.isServer && this.player1) {
            // TODO: draw player stats ONLY for player 1?
		    this.drawPlayerStats(20, 30, this.player1);
        }

        if (!this.multiplayer) {
		    this.drawPlayerStats(this.WIDTH - 90, 30, this.player2);
        }
	};

	this.drawPlayerStats = function(x, y, player) {
		this.ctx.fillStyle = "white";
		this.ctx.font = "bold 16px Arial";
		this.ctx.fillText(player.name, x, y);
		this.ctx.fillText(player.getWeapon().name + " " + (player.getWeapon().bullets > 0 ? player.getWeapon().bullets : ""), x, y + 20);
		this.ctx.fillText(player.life, x, y + 40);
	};

	this.clear = function() {
		// ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
		ctx.fillStyle="brown";
		ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);
	};

    this.addPlayerIfNotPresent = function(player) {
        if (!this.isMultiplayer) {
            throw "This method should only be used in Multiplayer";
        }

        var present = false;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].id == player.id) {
                present = true;
                break;
            }
        }

        if (!present) {
            this.players.push(player);
            this.addEntity(player);
        }
    };

    this.getPlayer = function(playerId) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].id == playerId) {
                return this.players[i];
            }
        }
        return null;
    };

    this.removePlayer = function(playerId) {
        var player = this.getPlayer(playerId);

        console.log("removePlayer. Index: " + this.players.indexOf(player));
        this.players.splice(this.players.indexOf(player));
        this.entities.splice(this.entities.indexOf(player));
    };

    this.trigger = function(triggerName, data) {
        switch(triggerName) {
            case "weapon taken":
            console.log("Weapon taken");
            this.socket.emit("weapon taken", data);
            break;
        }
    };

    this.getEntityById = function(id) {
        var entity;
        for(var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].id == id) {
                entity = this.entities[i];
                break;
            }
        }
        return entity;
    };
};

function extend(){
    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
}

if (typeof window == 'undefined') {
    module.exports = Game;
}
