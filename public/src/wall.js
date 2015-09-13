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
    this.randomNumbers = null;

	this.draw = function(ctx) {
		ctx.fillStyle = this.material.fillStyle;
		ctx.fillRect (this.x,this.y,this.width,this.height);
	};

	// something hits the wall
	this.hit = function(damage) {
		this.life -= damage;
		if (this.life <= 0) {
			this.game.removeEntity(this);
			this.life = 0;

            // Explosion animation
            var rnd1 = this.randomNumbers && this.randomNumbers.length ? this.randomNumbers.pop() : Math.random();
            if (this.material.explosionChance > rnd1) {
                // TODO: improve
                var rnd2 = this.randomNumbers && this.randomNumbers.length ? this.randomNumbers.pop() : Math.random();
                this.game.addEntity(new Explosion(this.x + this.width / 2, this.y + this.height / 2, Math.floor( rnd2 * this.material.life)));
            }
		};
	};
};
Wall.prototype = new Entity();

var StoneMaterial = {
	life : 1000,
	bounceChance : 0.9,
	explosionChance : 0.01,
	pierceChance : 0.01,
    breakChance: 0.4,
	fillStyle : "rgb(148, 148, 143)"
};

var WoodMaterial = {
	life : 50,
	bounceChance : 0.07,
	explosionChance : 0.6,
	pierceChance : 0.4,
    breakChance: 0.7,
	fillStyle : "rgb(150,29,28)"
};

var GlassMaterial = {
	life : 5,
	bounceChance : 0.01,
	explosionChance : 0.9,
	pierceChance : 0.9,
    breakChance: 1,
	fillStyle : "rgb(163,255,249)"
};

var TreeMaterial = {
	life : 300,
	bounceChance : 0.1,
	explosionChance : 0.01,
	pierceChance : 0.9,
    breakChance: 0.1,
	fillStyle : "rgb(37, 94, 25)"
};

// list of all posible wall materials available
var wallMaterials = [StoneMaterial,WoodMaterial,GlassMaterial,TreeMaterial];

if (typeof window == 'undefined') {
    module.exports.Wall = Wall;
    module.exports.WoodMaterial = WoodMaterial;
    module.exports.GlassMaterial = GlassMaterial;
    module.exports.TreeMaterial = TreeMaterial;
    module.exports.StoneMaterial = StoneMaterial;
    module.exports.wallMaterials = wallMaterials;
}
