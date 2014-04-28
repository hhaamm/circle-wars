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
Bullet.prototype = new Entity();
