var Client = function(game, socket) {
    this.game = game;
    this.socket = socket;
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
        bulletTypeIndex: 0 // hardcoded
    });
};

if (typeof window == "undefined") {
    module.exports = Client;
}
