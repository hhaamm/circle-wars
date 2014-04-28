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
	var ctx = $('#canvas')[0].getContext("2d");		 
	var game = new Game(ctx, $('#canvas').attr("width"), $('#canvas').attr("height"));
	
	game.init();
});
