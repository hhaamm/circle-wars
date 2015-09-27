var Entity = function() {
	this.process = function() {};

    this.setGame = function(game) {
		this.game = game;
	};

	// tests if two entities intersects using a Square
	// TODO: move this to Entity class
	this.hitTest = function(entity, x, y) {
        if (x == undefined)
            x = this.x;
        if (y == undefined)
            y = this.y;

		// TODO: when moving to entity class, delete radius code
		// it's only used for circled entities
	  return !(entity.x > x + this.radius / 2 ||
			   entity.x + entity.width < x - this.radius / 2 ||
			   entity.y > y + this.radius / 2 ||
			   entity.y + entity.height < y - this.radius / 2);
	};

	// TODO: make a function to return the SQUARE to all entities, so you can use that
};

if (typeof window == 'undefined') {
    module.exports = Entity;
}
