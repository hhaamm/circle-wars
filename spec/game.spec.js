var Game = require("./../src/game.js");
var Weapon = require("./../src/weapon.js");
var Player = require("./../src/player.js");

var opts = {
    maxWalls: 50,
    weaponGeneration: 0.999,
    minWalls: 0,
    multiplayer: "server"
};

var game = new Game(null, 1000, 1000, opts);

describe("Game class", function() {
    var weaponId = null;
    var shotgun = null;

    it("addEntity()", function() {
        shotgun = new Weapon.Shotgun(10, 10);

        weaponId = shotgun.id;

        expect(weaponId).not.toBe(null);

        expect(__entityExists(game, shotgun.id)).toBe(false);

        game.addEntity(shotgun, false);

         expect(__entityExists(game, shotgun.id)).toBe(true);
    });

    it("removeEntity()", function() {
        // Not very good... remove entity by id would be better
        game.removeEntity(shotgun);

        expect(__entityExists(game, shotgun.id)).toBe(true);

        // Game runs 1 frame
        game.process();

        expect(__entityExists(game, shotgun.id)).toBe(false);
    });

    it("getEntityCount()", function() {
        expect(game.getEntityCount("weapon")).toBe(0);
        expect(game.getEntityCount("player")).toBe(0);

        game.addEntity(new Weapon.Shotgun(10,10));
        expect(game.getEntityCount("weapon")).toBe(1);
        expect(game.getEntityCount("player")).toBe(0);

        game.addEntity(new Weapon.Shotgun(100,100));
        expect(game.getEntityCount("weapon")).toBe(2);
        expect(game.getEntityCount("player")).toBe(0);
    });

    it("getEntities()", function() {
        var entities = game.getEntities("weapon");

        expect(entities.length).toBe(2);

        entities = game.getEntities("player");
        expect(entities.length).toBe(0);
    });

    it("addPlayerIfNotPresent()", function() {
        var player = new Player(
            500,
            500,
            0,
            "Player",
            1,
            "ffffff"
        );

        // We need to set player id :O
        player.id = 2342423;

        expect(game.getEntities("player").length).toBe(0);

        game.addPlayerIfNotPresent(player);

        expect(game.getEntities("player").length).toBe(1);

        game.addPlayerIfNotPresent(player);

        expect(game.getEntities("player").length).toBe(1);
    });

    it("getPlayer()", function() {
        var player = game.getPlayer(2342423);

        expect(player).not.toBe(null);
        expect(player).not.toBe(undefined);

        player = game.getPlayer(1231);
        expect(player).toBe(null);
    });

    it("removePlayer()", function() {
        game.removePlayer(2342423);

        expect(game.getEntities("player").length).toBe(0);
    });

    it("getEntityById()", function() {
        var shot = new Weapon.Shotgun(50, 50);
        var id = shot.id;

        game.addEntity(shot);

        var shot2 = game.getEntityById(id);

        expect(shot2.id).toBe(id);
        expect(shot2.type).toBe("weapon");
    });

    it("onGameOver()", function() {
        //TODO: implement
    });

    it("runNextFrames()", function() {
        //TODO: implement
    });

    describe("process()", function() {
        //TODO: implement complex tests
    });
});

function __entityExists(game, entityId) {
    var found = false;
    game.entities.forEach(function(entity) {
        if (entity.id == entityId) {
            found = true;
        }
    });
    return found;
}
