var Weapon = function() {
    this.bullets = 5;
    this.type = "weapon";
    this.playerKeyUp = function() {};
    this.playerKeyDown = function() {};
    this.lastShootTime = 0;
    this.loadTime = 150;

    this.draw = function(ctx) {
        ctx.drawImage(this.game.resources.images[this.image],this.x,this.y);
    };

    this.canShoot = function(player) {
        return player.game.currentTime > this.lastShootTime + this.loadTime;
    };
};
Weapon.prototype = new Entity();

/* Basic weapon, is not delivered by the weapon dealer */
var Pistol = function() {
    this.bullets = -1; // Pistol has infinite bullets
    this.name = "Pistol";
    this.shoot = function(player) {
        if (!this.canShoot(player)) return;
        
		player.game.addEntity(new Bullet(player.x, player.y + (player.direction == 1 ? 30 : - 30), player.direction == 1 ? player.DIRECTION_UP : player.DIRECTION_DOWN));

        this.lastShootTime = player.game.currentTime;
    };
};
Pistol.prototype = new Weapon();

var Shotgun = function(x, y) {
    this.bullets = 8;
    this.name = "Shotgun";
    this.image = "shotgun";
    this.width = 100;
    this.height = 24;
    this.x = x;
    this.y = y;
    this.loadTime = 300;

    this.shoot = function(player) {
        if (!this.canShoot(player)) return;
        
        for(var i = -3; i < 3; i++) {
		    player.game.addEntity(new Bullet(player.x, player.y + (player.direction == 1 ? 30 : - 30), player.direction == 1 ? player.DIRECTION_UP + i / 15 : player.DIRECTION_DOWN + i / 15));
        }
        this.bullets -= 1;

        this.lastShootTime = player.game.currentTime;
    };
};
Shotgun.prototype = new Weapon();

var MachineGun = function(x, y) {
    this.bullets = 50;
    this.name = "Machine Gun";
    this.image = "shotgun";
    this.width = 100;
    this.height = 24;
    this.x = x;
    this.y = y;
    this.loadTime = 200;

    this.shoot = function(player) {
        if (!this.canShoot(player)) return;
        
        for(var i = 0; i < 5; i++) {
		    player.game.addEntity(new Bullet(player.x, player.y + (player.direction == 1 ? 30 : - 30) + i * 10 * (player.direction == 1 ? 1 : -1), player.direction == 1 ? player.DIRECTION_UP : player.DIRECTION_DOWN));
        }
        this.bullets -=5;

        this.lastShootTime = player.game.currentTime;
    };
};
MachineGun.prototype = new Weapon();

var FragmentationPistol = function(x, y) {
    this.bullets = 3;
    this.name = "Frag";
    this.image = "shotgun";
    this.width = 100;
    this.height = 24;
    this.x = x;
    this.y = y;
    this.loadTime = 1000;

    this.shoot = function(player) {
        if (!this.canShoot(player)) return;
        
        player.game.addEntity(new FragmentationBullet(player.x, player.y + (player.direction == 1 ? 30 : - 30), player.direction == 1 ? player.DIRECTION_UP : player.DIRECTION_DOWN, 2));
        this.bullets -= 1;

        this.lastShootTime = player.game.currentTime;
    };
};
FragmentationPistol.prototype = new Weapon();

var weaponTypes = [MachineGun, Shotgun, FragmentationPistol];
