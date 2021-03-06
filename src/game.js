var Game = function(ctx, width, height, opts) {
	this.ctx = ctx;
	this.WIDTH = width;
	this.HEIGHT = height;	

    this.players = [];
	this.entities = []; // List of entities that will be drawn and process
	// An entity is an object that implements draw(), process() and setGame methods
	// and implements type (player, bullet) and radius properties
	
	this.removeEntities = [];

    this.resources = new ResourceLoader();

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
    this.opts = $.extend({}, defaults, this.opts);
	
	/* PUBLIC FUNCTIONS */
	this.init = function() {
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
		
		var _self = this;
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
			if ((x != this.player1.x - this.player1.radius / 2 || y != this.player1.y - this.player1.radius / 2)
				&& 
				(x != this.player2.x - this.player2.radius / 2 | y != this.player2.y - this.player2.radius / 2)) {
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

        this.resources.loadResources(function() {
		    _self.runInterval = setIntervalWithContext(_self.run, 10, _self);
        });
	};
	
	this.addEntity = function(entity) {
		entity.setGame(this);
		this.entities.push(entity);
	};
	
	// Remove entity after processing all other entities
	this.removeEntity = function(entity) {
		this.removeEntities.push(entity);
	};
	
	/* PRIVATE FUNCTIONS */
	this.run = function() {	
		this.clear();
		var _self = this;

        // Entities can use this time
        this.currentTime = new Date().getTime();

        // Performant for loops
        var i;
        for(i = 0; i < this.entities.length; i++) {
            this.entities[i].process();
        }
        for(i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(this.ctx);
        }
		
		this.drawUI();
		
		// remove entities
		$(this.removeEntities).each(function(i, entity) {
			var index = _self.entities.indexOf(entity);
			if (index > -1) {
				_self.entities.splice(index, 1);
			}
		});
		
		this.removeEntities = [];
		
		if (this.player1.life <= 0 || this.player2.life <= 0) {
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
        if (Math.random() > this.opts.weaponGeneration) {
            debug("Added weapon");
            var weaponConstructor = weaponTypes[Math.floor(Math.random()*weaponTypes.length)];
            var weapon = new weaponConstructor(Math.floor(Math.random()*this.WIDTH), Math.floor(Math.random()*this.HEIGHT));
            weapon.x -= weapon.width / 2;
            weapon.y -= weapon.height / 2;
            this.addEntity(weapon);
        }
	};
	
	this.drawUI = function() {
		this.drawPlayerStats(20, 30, this.player1);
		this.drawPlayerStats(this.WIDTH - 90, 30, this.player2);
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
};
