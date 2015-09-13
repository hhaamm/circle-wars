// Class for handling math stuff
var Vector = function(direction, module) {
    this.direction = direction;
    this.module = module;
    this.originX = 0;
    this.originY = 0;

    this.sum = function(number) {
        this.module += number;
    };

    this.x = function() {
        return Math.round(Math.cos(this.direction) * this.module) + this.originX;
    };

    this.y = function() {
        return Math.round(- Math.sin(this.direction) * this.module) + this.originY;
    };
};


if (typeof window == 'undefined') {
    module.exports = Vector;
}
