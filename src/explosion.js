var Explosion = function(x, y, damage) {
    this.maxRadius = 30;
    this.damage = damage;
    this.increase = 1;
    this.radius = 0;
    this.x = x;
    this.y = y;
    this.touchedPlayers = [];

    debug("Exlosion!");
    
    this.process = function() {
        this.radius += this.increase;

        // TODO: if we are touching a player, it should be suffer damage!
        var _self = this;
        $(this.game.players).each(function(i,player) {
            if (_self.hitTest(player) && _self.touchedPlayers.indexOf(player) == -1) {
                console.log(player);                
                player.hit(_self.damage);
                _self.touchedPlayers.push(player);
            }
        });
        
        if (this.radius >= this.maxRadius) {
            debug("Explosion end!");
            this.game.removeEntity(this);
        };
    };

    this.draw = function(ctx) {
        ctx.fillStyle = "#00ff00";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        ctx.closePath();
		ctx.fill();
    };

    // Hittest between two circle entities
    // TODO: move to entity class
    this.hitTest = function(entity) {
        // TODO: hit test should check for both "entity type" property (circle or square)
        
		var distanceX = this.x - entity.x;
		var distanceY = this.y - entity.y;
		var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
		return distance < this.radius + entity.radius;
    };
};
Explosion.prototype = new Entity();
