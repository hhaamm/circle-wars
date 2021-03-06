var Weapon = function() {
    this.bullets = 5;
    this.type = "weapon";
    this.playerKeyUp = function() {};
    this.playerKeyDown = function() {};
    this.lastShootTime = 0;
    this.loadTime = 150;
    // Constant used for putting a new bullet in the game without killing the shooter.
    this.outsideSuicideZone = 15; 

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
    this.loadTime = 150;
    this.shoot = function(player) {
        if (!this.canShoot(player)) return;

        var v = new Vector(player.direction, this.outsideSuicideZone);
        v.originX = player.x;
        v.originY = player.y;
        
		player.game.addEntity(new Bullet(v.x(), v.y(), player.direction));

        this.lastShootTime = player.game.currentTime;
    };
};
Pistol.prototype = new Weapon();

var Shotgun = function(x, y) {
    this.bullets = 8;
    this.name = "Shotgun";
    this.image = "shotgun";
    this.width = 50;
    this.height = 16;
    this.x = x;
    this.y = y;
    this.loadTime = 300;

    this.shoot = function(player) {
        if (!this.canShoot(player)) return;

        var v = new Vector(player.direction, this.outsideSuicideZone);
        v.originX = player.x;
        v.originY = player.y;
        
        for(var i = -3; i < 3; i++) {
		    player.game.addEntity(new Bullet(v.x(), v.y(), player.direction + i / 15));
        }
        this.bullets -= 1;

        this.lastShootTime = player.game.currentTime;
    };
};
Shotgun.prototype = new Weapon();

var MachineGun = function(x, y) {
    this.bullets = 50;
    this.name = "Machine Gun";
    this.image = "machinegun";
    this.width = 39;
    this.height = 18;
    this.x = x;
    this.y = y;
    this.loadTime = 200;

    this.shoot = function(player) {
        if (!this.canShoot(player)) return;

        var v = new Vector(player.direction, this.outsideSuicideZone);
        v.originX = player.x;
        v.originY = player.y;

        for (var i = 0; i < 5; i++) {
            v.sum(i*10);
            player.game.addEntity(new Bullet(v.x(), v.y(), player.direction));   
        }

        this.bullets -=5;

        this.lastShootTime = player.game.currentTime;
    };
};
MachineGun.prototype = new Weapon();

var FragmentationPistol = function(x, y) {
    this.bullets = 4;
    this.name = "Frag";
    this.image = "frag";
    this.width = 28;
    this.height = 11;
    this.x = x;
    this.y = y;
    this.loadTime = 1000;

    this.shoot = function(player) {
        if (!this.canShoot(player)) return;

        var v = new Vector(player.direction, this.outsideSuicideZone);
        v.originX = player.x;
        v.originY = player.y;
        
        player.game.addEntity(new FragmentationBullet(v.x(), v.y(), player.direction, 2));
        this.bullets -= 1;

        this.lastShootTime = player.game.currentTime;
    };
};
FragmentationPistol.prototype = new Weapon();

var ArmagedonPistol = function(x, y) {
    this.bullets = 1;
    this.name = "Armagedon";
    this.image = "pistol2";
    this.width = 24;
    this.height = 11;
    this.x = x;
    this.y = y;
    this.loadTime = 1000;

    this.shoot = function(player) {
        if (!this.canShoot(player)) return;

        var v = new Vector(player.direction, this.outsideSuicideZone);
        v.originX = player.x;
        v.originY = player.y;
        
        player.game.addEntity(new FragmentationBullet(v.x(), v.y(), player.direction, 4));
        this.bullets -= 1;

        this.lastShootTime = player.game.currentTime;
    };
};
ArmagedonPistol.prototype = new Weapon();

var MissileLauncher = function(x, y) {
    this.bullets = 5;
    this.name = "Missile Launcher";
    this.image = "missile";
    this.width = 12;
    this.height = 51;
    this.x = x;
    this.y = y;
    this.loadTime = 1000;
    this.outsideSuicideZone = 30; 

    this.shoot = function(player) {
        if (!this.canShoot(player)) return;

        var v = new Vector(player.direction, this.outsideSuicideZone);
        v.originX = player.x;
        v.originY = player.y;
        
        player.game.addEntity(new Missile(v.x(), v.y(), player.direction, 4));
        this.bullets -= 1;

        this.lastShootTime = player.game.currentTime;
    };
};
MissileLauncher.prototype = new Weapon();

var weaponTypes = [MachineGun, Shotgun, FragmentationPistol, ArmagedonPistol, MissileLauncher];
