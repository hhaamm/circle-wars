var Weapon = function() {
    this.type = "weapon";
    this.playerKeyUp = function() {};
    this.playerKeyDown = function() {};    

    this.draw = function(ctx) {
        ctx.drawImage(this.game.resources.images[this.image],this.x,this.y);
    };
};
Weapon.prototype = new Entity();

/* Basic weapon, is not delivered by the weapon dealer */
var Pistol = function() {    
    this.shoot = function(player) {
		player.game.addEntity(new Bullet(player.x, player.y + (player.direction == 1 ? 30 : - 30), player.direction == 1 ? player.DIRECTION_UP : player.DIRECTION_DOWN));		
    };
};
Pistol.prototype = new Weapon();

var Shotgun = function(x, y) {
    this.image = "shotgun";
    this.width = 100;
    this.height = 24;
    this.x = x;
    this.y = y;

    this.shoot = function(player) {
        for(var i = 0; i < 5; i++) {
		    player.game.addEntity(new Bullet(player.x, player.y + (player.direction == 1 ? 30 : - 30), player.direction == 1 ? player.DIRECTION_UP : player.DIRECTION_DOWN));
        }
    };
};
Shotgun.prototype = new Weapon();

var MachineGun = function() {
    
};
MachineGun.prototype = new Weapon();
