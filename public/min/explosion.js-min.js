var Explosion=function(a,e,b,c,d){this.maxRadius=c?c:30;this.damage=b;this.increase=d?d:1;this.radius=0;this.x=a;this.y=e;this.touchedPlayers=[];debug("Exlosion!");this.process=function(){this.radius+=this.increase;var f=this;for(var h=0;h<this.game.players.length;h++){var g=this.game.players[h];if(f.hitTest(g)&&f.touchedPlayers.indexOf(g)==-1){console.log(g);g.hit(f.damage);f.touchedPlayers.push(g)}}if(this.radius>=this.maxRadius){debug("Explosion end!");this.game.removeEntity(this)}};this.draw=function(f){f.fillStyle="#00ff00";f.beginPath();f.arc(this.x,this.y,this.radius,0,Math.PI*2,true);f.closePath();f.fill()};this.hitTest=function(f){var h=this.x-f.x;var g=this.y-f.y;var i=Math.sqrt(h*h+g*g);return i<this.radius+f.radius}};Explosion.prototype=new Entity();if(typeof window=="undefined"){module.exports=Explosion};