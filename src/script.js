/* COMMON FUNCTIONS */
setIntervalWithContext = function(code,delay,context){
    return setInterval(function(){
        code.call(context);
    },delay);
};

setTimeoutWithContext = function(code,delay,context){
    return setTimeout(function(){
        code.call(context);
    },delay);
};

debug = function(message) {
    if (window.console)
        window.console.log(message);
};

(function() {
    var startGame = function() {
        var ctx = $('#canvas')[0].getContext("2d");
        var game = new Game(ctx, $('#canvas').attr("width"), $('#canvas').attr("height"));

        game.init();

        game.onGameOver = function() {
            $("#gameEndMenu").show();
            delete game;
        };
    };

    var setButtonCallbacks = function() {
        $("#newGameBtn").click(function() {
            setStage("CreateGame");
            return false;
        });

        $("#startGameBtn").click(function() {
            setStage("Game");

            startGame();

            return false;
        });

        // --- Buttons of game end menu ---
        $("#newGame2Btn").click(function() {
            $("#gameEndMenu").hide();
            console.log("restart");
            setStage("CreateGame");
            return false;
        });

        $("#restartGameBtn").click(function() {
            $("#gameEndMenu").hide();
            console.log("restart");
            setStage("Game");
            startGame();
            return false;
        });

        $("#exitBtn").click(function() {
            $("#gameEndMenu").hide();
            setStage("Init");
            return false;
        });
        // ---
    };

    var setStage = function(stage) {
        $(".stage").hide();
        $("#stage"+stage).show();
    };

    $(document).ready(function() {
        setButtonCallbacks();

        setStage("Init");
    });
})();
