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

$(document).ready(function() {
    $("#newGameBtn").click(function() {
        setStage("CreateGame");
        return false;
    });

    $("#startGameBtn").click(function() {
        setStage("Game");

	    var ctx = $('#canvas')[0].getContext("2d");		 
	    var game = new Game(ctx, $('#canvas').attr("width"), $('#canvas').attr("height"));
	    
	    game.init();        
        
        return false;
    });
    
    setStage("Init");
});

setStage = function(stage) {
    $(".stage").hide();
    $("#stage"+stage).show();
};

