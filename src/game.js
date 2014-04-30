var Game = function(ctx, width, height) {
	this.ctx = ctx;
	this.WIDTH = width;
	this.HEIGHT = height;	

    this.players = [];
	this.entities = []; // List of entities that will be drawn and process
	// An entity is an object that implements draw(), process() and setGame methods
	// and implements type (player, bullet) and radius properties
	
	this.removeEntities = [];

    this.resources = new ResourceLoader();
	
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
		var walls = Math.floor(Math.random() * 50);
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

        var _self = this;

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
		$(this.entities).each(function() {			
			this.process();
		});
		$(this.entities).each(function() {			
			this.draw(_self.ctx);
		});
		
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
			// Game over screen
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
			
			// TODO: Add restart game button
		}

        // Random weapon generation
        // TODO: make this exponential with the number of weapons available in the map!
        if (Math.random() > 0.999) {
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
