/* COMMON FUNCTIONS */
setIntervalWithContext = function(code,delay,context){
 return setInterval(function(){
  code.call(context);
 },delay);
};
 
setTimeoutWithContext = function(code,delay,context){
 return setTimeout(function(){
  code.call(context);
 },delay);
};

debug = function(message) {
	if (window.console)
		window.console.log(message);
};

/*
 * Creates a player object.
 *
 * @keyboard Can be 1 or 2.
 */
var Player = function(x, y, direction, name, keyboard) {
	this.x = x;
	this.y = y;
	this.direction = direction;
	this.name = name;	
	this.type = "player";
	this.radius = 10;
	this.life = 100;
    this.keyboard = keyboard;
	
	this.setGame = function(game) {
		this.game = game;
	};
	
	this.process = function() {};
	
	// call this function when something hits the player
	this.hit = function(damage) {
		this.life -= damage;
		if (this.life <= 0) {
			this.game.removeEntity(this);
			this.life = 0;
			
			if (console)
				console.log("Game over");
			// Game over!
		};
	};
	
	this.draw = function(ctx) {
		ctx.fillStyle = "#00A308";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
	};
	
	this.shoot = function() {
		this.game.addEntity(new Bullet(this.x, this.y + (this.direction == 1 ? 30 : - 30), direction == 1 ? 1 : -1));		
	};
	
	this.onKeyDown = function(evt) {};
	
	this.onKeyUp = function(evt) {
		// console.log(evt.keyCode);

        switch(evt.keyCode) {
		case this.keyboard.left: 
			if (this.canMove(this.x - 10, this.y))
				this.x -= 10;
			break;
		case this.keyboard.right:
			if (this.canMove(this.x + 10, this.y))
				this.x += 10;
			break;
		case this.keyboard.forward:
			if (this.canMove(this.x, this.y - 10))
				this.y -= 10 + this.direction;
			break;
		case this.keyboard.backward:
			if (this.canMove(this.x, this.y + 10))
				this.y += 10 * this.direction;
			break;
		case this.keyboard.shoot: // space
			this.shoot(); break;				
		}		
	};
	
	/*
	 * Tries to test move to a certain position. Returns false if there's an object blocking the movement.
	 */
	this.canMove = function(x, y) {
		var _self = this;
		var entityCanMove = true;
		$(this.game.entities).each(function(i, entity) {
			if (entity.type == "player") {
				// TODO: a player shouldn't be able to "aplastar" other player
			}
			if (entity.type == "wall") {
				// TODO: improve this hittest.. it simulates that the player is a square
				
				if (_self.hitTest(entity, x, y)) {
					entityCanMove = false;					
				}
			}
		});
		return entityCanMove;
	};
	
	// tests if two entities intersects using a Square
	// TODO: move this to Entity class
	this.hitTest = function(entity, x, y) {
		// TODO: when moving to entity class, delete radius code
		// it's only used for circled entities
	  return !(entity.x > x + this.radius / 2 || 
			   entity.x + entity.width < x - this.radius / 2 || 
			   entity.y > y + this.radius / 2 ||
			   entity.y + entity.height < y - this.radius / 2);	
	};
	
	// TODO: make a function to return the SQUARE to all entities, so you can use that
};

var Wall = function(x, y, material) {
	this.x = x;
	this.y = y;
	this.width = 20;
	this.height = 20;
	this.type = "wall";
	this.radius = 20;
	this.material = material;
	this.life = material.life;
	this.bounceChance = material.bounceChance;

	this.process = function() {};
	this.draw = function(ctx) {
		ctx.fillStyle = this.material.fillStyle;
		ctx.fillRect (this.x,this.y,this.width,this.height);
	};	
	this.setGame = function(game) {
		// TODO: put this code in an Entity class
		this.game = game;
	};
	
	// something hits the wall
	this.hit = function(damage) {
		this.life -= damage;
		if (this.life <= 0) {
			this.game.removeEntity(this);
			this.life = 0;
		};
	};
};

var StoneMaterial = {
	life : 1000,
	bounceChance : 0.9,
	explosionChance : 0.01,
	pierceChance : 0.01,
	fillStyle : "rgb(148, 148, 143)"
};

var WoodMaterial = {
	life : 50,
	bounceChance : 0.07,
	explosionChance : 0.1,
	pierceChance : 0.4,
	fillStyle : "rgb(150,29,28)"	
};

var GlassMaterial = {
	life : 5,
	bounceChance : 0.01,
	explosionChance : 0.9,
	pierceChance : 0.9,
	fillStyle : "rgb(163,255,249)"
};

var TreeMaterial = {
	life : 300,
	bounceChance : 0.1,
	explosionChance : 0.01,
	pierceChance : 0.9,
	fillStyle : "rgb(37, 94, 25)"
};

// list of all posible wall materials available
var wallMaterials = [StoneMaterial,WoodMaterial,GlassMaterial,TreeMaterial];

var Game = function(ctx, width, height) {
	this.ctx = ctx;
	this.WIDTH = width;
	this.HEIGHT = height;	
	
	this.entities = []; // List of entities that will be drawn and process
	// An entity is an object that implements draw(), process() and setGame methods
	// and implements type (player, bullet) and radius properties
	
	this.removeEntities = [];
	
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
						
		this.runInterval = setIntervalWithContext(this.run, 10, this);
		
		return this.runInterval;
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
	};
	
	this.drawUI = function() {
		this.drawPlayerStats(20, 30, this.player1);
		this.drawPlayerStats(this.WIDTH - 90, 30, this.player2);
	};
	
	this.drawPlayerStats = function(x, y, player) {
		this.ctx.fillStyle = "white";
		this.ctx.font = "bold 16px Arial";
		this.ctx.fillText(player.name, x, y);
		
		this.ctx.fillText(player.life, x, y + 20);
	};
	
	this.clear = function() {
		// ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
		ctx.fillStyle="brown";
		ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);
	};
}

var Bullet = function(x, y, direction) {
	this.x = x;
	this.y = y;
	this.direction = direction;
	this.type = "bullet";
	this.radius = 5;
	this.bounceChance = 0.9;
	
	this.process = function() {		
		this.y += 4 * this.direction;
		
		var _self = this;
		
		// check if we are hitting a player
		$(this.game.entities).each(function(i, entity) {		
			if (entity.type == "player") {
				var distanceX = _self.x - entity.x;
				var distanceY = _self.y - entity.y;
				var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
				
				if (distance < _self.radius + entity.radius) {					
					entity.hit(_self.getDamage());
					// Removing itself... we don't want to hit the player 2 times!
					_self.game.removeEntity(_self);
				}
			}
			
			if (entity.type == "wall") {
				/* COMPLEX HITTEST
				// getting closest point to the center of the square
				// square center point
				var pX = entity.x - (entity.width / 2);
				var pY = entity.y - (entity.height / 2);
				
				// vector from circle (bullet)
				var vX = pX - this.x;
				var vY = pY - this.y;
				var magV = Math.sqrt(vX*vX + vY*vY);
				
				// closest point to the square
				var aX = this.x + vX / magV * this.radius;
				var aY = this.y + vY / magV * this.radius;
				
				// test if the point is inside the square
				// "hitTest"
				if (aX >= entity.x &&
					aX <= entity.x + entity.width &&
					aY >= entity.y &&
					aY <= entity.y + entity.height) {
						console.log("We hit the wall");
				}
				*/
				
				// simple hittest.. considering bullet as a square
				if (_self.hitTest(entity)) {
					debug("Wall hit");
					entity.hit(_self.getDamage());
					
					
					if (entity.bounceChance * _self.bounceChance > Math.random()) {
						debug("Bounce");
						_self.direction *= -1;
					} else {
						_self.game.removeEntity(_self);
					}
				}
			}
		});
		
		if (this.x < 0 || this.x > this.game.WIDTH || this.y < 0 || this.y > this.game.HEIGHT) {
			// Removing the bullet to avoid memory issues if the bullet is outside the borders
			_self.game.removeEntity(_self);
		}
	};
	
	this.draw = function(ctx) {
		ctx.fillStyle = "#00ff00";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
	};
	
	this.setGame = function(game) {
		this.game = game;
	};
	
	this.getDamage = function() {
		return 10;
	};
	
	// tests if two entities intersects using a Square
	// TODO: move this to Entity class
	this.hitTest = function(entity) {
		// TODO: when moving to entity class, delete radius code
		// it's only used for circled entities
	  return !(entity.x > this.x + this.radius / 2 || 
			   entity.x + entity.width < this.x - this.radius / 2 || 
			   entity.y > this.y + this.radius / 2 ||
			   entity.y + entity.height < this.y - this.radius / 2);	
	};
};

$(document).ready(function() {	
	var ctx = $('#canvas')[0].getContext("2d");		 
	var game = new Game(ctx, $('#canvas').attr("width"), $('#canvas').attr("height"));
	
	game.init();
});
