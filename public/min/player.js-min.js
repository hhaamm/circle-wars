if(typeof window=="undefined"){Entity=require("./entity.js");Pistol=require("./weapon.js").Pistol}var Player=function(b,f,e,d,a,c){this.x=b;this.y=f;this.direction=e;this.name=d;this.type="player";this.radius=10;this.life=100;this.keyboard=a;this.DIRECTION_UP=90*Math.PI/180;this.DIRECTION_DOWN=270*Math.PI/180;this.DIRECTION_LEFT=180*Math.PI/180;this.DIRECTION_RIGHT=0;this.weapon=null;this.basicWeapon=new Pistol();this.color=c||"#00A308";this.hit=function(g){this.life-=g;if(this.life<=0){this.game.removeEntity(this);this.life=0;if(console){console.log("Game over")}}};this.draw=function(g){g.fillStyle=this.color;g.beginPath();g.arc(this.x,this.y,this.radius,0,Math.PI*2,true);g.closePath();g.fill();g.beginPath();g.moveTo(this.x,this.y);g.lineTo(this.x+Math.cos(this.direction)*this.radius,this.y-Math.sin(this.direction)*this.radius);g.lineWidth=1;g.strokeStyle="#000000";g.stroke()};this.shoot=function(){this.getWeapon().shoot(this);if(this.getWeapon().bullets===0){this.weapon=null}};this.getWeapon=function(){if(this.weapon){return this.weapon}else{return this.basicWeapon}};this.addWeapon=function(g){this.weapon=g};this.onKeyDown=function(h){switch(h.keyCode){case this.keyboard.left:if(this.canMove(this.x-10,this.y)){this.x-=10}this.direction=this.DIRECTION_LEFT;break;case this.keyboard.right:if(this.canMove(this.x+10,this.y)){this.x+=10}this.direction=this.DIRECTION_RIGHT;break;case this.keyboard.forward:if(this.canMove(this.x,this.y-10)){this.y-=10+this.direction}this.direction=this.DIRECTION_UP;break;case this.keyboard.backward:if(this.canMove(this.x,this.y+10)){this.y+=10+this.direction}this.direction=this.DIRECTION_DOWN;break;case this.keyboard.shoot:this.shoot();break}var g=this;$(this.game.entities).each(function(k,j){if(j.type=="weapon"&&g.hitTest(j)){debug("Picked up weapon");if(g.game.isClient){g.game.trigger("weapon taken",{id:j.id,playerId:g.id})}g.game.removeEntity(j);g.addWeapon(j)}})};this.onKeyUp=function(g){};this.canMove=function(h,j){var g=this;var i=true;$(this.game.entities).each(function(l,k){if(k.type=="player"){}if(k.type=="wall"){if(g.hitTest(k,h,j)){i=false}}});return i};this.getX=function(){return this.x};this.getY=function(){return this.y}};Player.prototype=new Entity();if(typeof window=="undefined"){module.exports=Player};