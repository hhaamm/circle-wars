var Player = require("./../src/player.js");

var player = new Player(100, 100, 1, "Player", 1, "#ffffff");

describe("Player", function() {
    it("Player default life is 100", function() {
        expect(player.life).toBe(100);
    });

    it("hit() should decrease player's life", function() {
        player.hit(20);

        expect(player.life).toBe(80);
    });
});
