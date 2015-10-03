if (typeof window == "undefined") {
    Explosion = require('./explosion');
}

var Client = function(game, socket) {
    this.game = game;
    this.socket = socket;

    socket.on("new explosion", function(data) {
        game.addEntity(new Explosion(data.x, data.y, data.damage, data.maxRadius, data.increase, data.id));
    });
};

/**
 * Adds a bullet to the server
 */
Client.prototype.addBullet = function(bullet) {
    this.socket.emit("new bullet", {
        id: bullet.id,
        position: {x: bullet.x, y: bullet.y},
        direction: bullet.direction,
        randomNumbers: bullet.randomNumbers,
        outsideSuicideZone: 15, // bullet.outsideSuicideZone,
        bulletTypeIndex: bullet.bulletTypeIndex
    });
};

if (typeof window == "undefined") {
    module.exports = Client;
}
