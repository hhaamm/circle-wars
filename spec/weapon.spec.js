var Game = require("./../src/game.js");
var Weapon = require("./../src/weapon.js");
var Pistol = Weapon.Pistol;
var Shotgun = Weapon.Shotgun;
var Player = require("./../src/player.js");

var opts = {
    maxWalls: 0,
    weaponGeneration: 0.999,
    minWalls: 0
};

var game = new Game(null, 1000, 1000, opts);

describe("Weapon", function() {

});


describe("Weapon.Pistol", function() {
    var pistol = null;

    it("new()", function() {
        pistol = new Pistol();

        expect(pistol.name).toBe("Pistol");

        expect(pistol.id).not.toBe(null);
    });

    it("shoot()", function() {
        // var player = new Player();
    });
});


describe("Weapon.Shotgun", function() {

});
