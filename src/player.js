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
    this.DIRECTION_UP = 90 * Math.PI / 180;
    this.DIRECTION_DOWN = 270 * Math.PI / 180;
	
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
		this.game.addEntity(new Bullet(this.x, this.y + (this.direction == 1 ? 30 : - 30), direction == 1 ? this.DIRECTION_UP : this.DIRECTION_DOWN));		
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
};
Player.prototype = new Entity();
