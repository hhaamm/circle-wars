var Explosion = function(radius, damage, color) {
    this.radius = radius;
    this.damage = damage;
    this.color = color;
};
Explosion.prototype = new Entity();
