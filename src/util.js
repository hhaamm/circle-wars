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
    if (typeof window == 'undefined') {
        console.log(message);
    } else {
        if (window.console)
            window.console.log(message);
    }
};

if (typeof window == 'undefined') {
    module.exports.debug = debug;
    module.exports.setTimeoutWithContext = setTimeoutWithContext;
    module.exports.setIntervalWithContext = setIntervalWithContext;
}
