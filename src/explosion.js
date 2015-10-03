var Explosion = function(x, y, damage, maxRadius, increase, id) {
    this.maxRadius = maxRadius ? maxRadius : 30;
    this.damage = damage;
    this.increase = increase ? increase : 1;
    this.radius = 0;
    this.x = x;
    this.y = y;
    this.id = id;
    this.touchedPlayers = [];

    debug("Exlosion!");

    this.process = function() {
        this.radius += this.increase;

        // TODO: if we are touching a player, it should be suffer damage!
        var _self = this;
        if (this.game.isServer || this.game.isSinglePlayer) {
            for(var i = 0; i < this.game.players.length; i++) {
                var player = this.game.players[i];
                if (_self.hitTest(player) && _self.touchedPlayers.indexOf(player) == -1) {
                    console.log(player);
                    player.hit(_self.damage);
                    _self.touchedPlayers.push(player);

                    if (_self.game.isServer) {
                        _self.game.triggerServer("entity hit", {
                            id: player.id,
                            life: player.life
                        });
                    }
                }
            }
        }

        console.log("log: radius " + this.radius);
        console.log("increase: " + this.increase);
        console.log("maxradius: " + this.maxRadius);
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

if (typeof window == 'undefined') {
    module.exports = Explosion;
}
