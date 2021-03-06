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
        this.x += Math.cos(this.direction) * this.speed;
		this.y += - Math.sin(this.direction) * this.speed;

		var _self = this;
		
		// check if we are hitting a player
		$(this.game.entities).each(function(i, entity) {		
			if (entity.type == "player") {
				var distanceX = _self.x - entity.x;
				var distanceY = _self.y - entity.y;
				var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
				
				if (distance < _self.radius + entity.radius) {
					_self.onEntityHit(entity);
                    // Removing itself... we don't want to hit the player 2 times!
		            _self.game.removeEntity(_self);
                    _self.fragCallback();
				}
			}
			
			if (entity.type == "wall") {				
				// simple hittest.. considering bullet as a square
				if (_self.hitTest(entity)) {
					debug("Wall hit");
                    _self.onEntityHit(entity);
					
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
                    _self.onEntityHit(entity);
                    this.game.removeEntity(this);
                }
            }
		});

        if (this.aceleration) {
            this.speed += this.aceleration;
        }
		
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

    /*
     * Callback function when the bullet "touches" an entity. 
     * You can override this if you want to customize the effect of touching an entity 
     * (i.e. making an explosion)
     */
    this.onEntityHit = function(entity) {
        if (entity.type == "weapon") {
            this.game.removeEntity(entity);
            return;
        }
        
		entity.hit(this.getDamage());
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

/*
 * Creates a new missile
 */
var Missile = function(x, y, direction) {
	this.x = x;
	this.y = y;
	this.direction = direction;
	this.type = "bullet";
	this.radius = 10;
	this.bounceChance = 0.2;
    this.speed = 2;
    this.damage = 50;
    this.aceleration = 0.1;

    this.onEntityHit = function(entity) {
        if (entity.type == "weapon") {
            this.game.removeEntity(entity);            
        }

        // TODO: improve this
        // we need this because explosion actually doesn't hit the walls.. but it should!
        // Imagine glass explosion! Crash, crash, crash!
        if (entity.type == "wall") {
            entity.hit(this.getDamage());
        }       
        
        this.game.addEntity(new Explosion(this.x,this.y,this.getDamage(),60,5));
    };
};
Missile.prototype = new Bullet(0,0,0);
