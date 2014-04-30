/*
 * Creates a new Bullet
 *
 * @direction    Should be an angle in radians (≈ 57.295°)
 */
var Bullet = function(x, y, direction) {
	this.x = x;
	this.y = y;
	this.direction = direction;
	this.type = "bullet";
	this.radius = 5;
	this.bounceChance = 1;
    this.speed = 4;
    this.damage = 10;
	
	this.process = function() {
        this.x += - Math.cos(this.direction) * this.speed;
		this.y += Math.sin(this.direction) * this.speed;

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
                    _self.fragCallback();
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
                        // changes direction randomly
                        // TODO: find some way to do this more efficient
                        //       if direction is against the wall, then it will be computed again
                        _self.direction = Math.random() * Math.PI * 2;
                        // reduces damage, minimun is 1
                        _self.damage = Math.ceil(_self.damage * Math.random()); 
					} else {
						_self.game.removeEntity(_self);
                        _self.fragCallback();
					}
				}
			}

            if (entity.type == "weapon") {
				if (_self.hitTest(entity)) {
                    _self.game.removeEntity(_self);
                    _self.game.removeEntity(entity);
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
		return this.damage;
	};

    this.fragCallback = function() {};
};
Bullet.prototype = new Entity();

var FragmentationBullet = function(x,y,direction, frags) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.frags = frags;
    this.divide = 5;

    this.fragCallback = function() {
        debug("Fragcallback");
        if (this.frags > 0) {
            for (var i = 0; i < this.divide; i++) {
                debug("adding new frag bullets");
                this.game.addEntity(new FragmentationBullet(this.x, this.y, Math.random() * Math.PI * 2, this.frags - 1));
            }
        }
    };
};
FragmentationBullet.prototype = new Bullet(0,0,0);
