// Environment Setup

var gEnv = {
  canvas : document.getElementById("mycanvas"),
  ctx : document.getElementById("mycanvas").getContext('2d'),
  xlim : mycanvas.width,
  ylim : mycanvas.height,

  kGravity : 150,
  kDrag : 0.06,
  kMaxVelocity : 100,
  
  particles : [],
  sinks : [],

  kEnableGrav : true,
  kElastic : true,
  kInelastic : false,

  paused : false,
  kDrawRose : false,
  kSizeConst : 0.3
};

var EnvTime = function(ticks, total_elapsed) {
  this.time_last = 0;
  this.time_current = 0;
  this.ticks = ticks;
  this.total_elapsed = total_elapsed;
};
EnvTime.prototype.tick = function() {
  var ctime = new Date();
  this.time_last = this.time_current;
  this.time_current = ctime.getTime() / 100; 
  this.ticks += 1;
  this.total_elapsed += this.delta();
  return this.ticks;
};
EnvTime.prototype.delta = function() {
  return this.time_current - this.time_last;
}
var gEnvTime = new EnvTime(0,0);
gEnvTime.tick();

function gravity(m1, m2, d) {
  // the gravitational force which m1 will feel towards m2
  //
  var fGrav = (m1*m2*gEnv.kGravity) / (d*d);
  return fGrav * -1;
}

function drawRose() {
  // Draws a compass rose on the map to give me a sense of
  // direction and to ensure that I made the correct assumution
  // of where the quadrants are.
  //
  var ctx = gEnv.ctx;
  ctx.font = "18px Arial";
  ctx.strokeStyle = "#111111";
  ctx.fillStyle = "#111111";
  var center = [100,100];
  var offset = 50;
  var points = [[offset,0], [0,offset], [-offset, 0], [0,-offset]];
  for (var i = 0; i < points.length; i++) {
    ctx.beginPath();
    ctx.moveTo(center[0], center[1]);
    var endx = center[0] + points[i][0];
    var endy = center[1] + points[i][1];
    ctx.lineTo(endx, endy);
    ctx.stroke();
    ctx.fillText(points[i][0] + "," + points[i][1], endx, endy);
  }

  ctx.fillStyle = "#333333";
  offset *= (Math.sqrt(2));
  for (var i = 0; i < 4; i++) {
    var ang = (Math.PI/4) + ((Math.PI*i)/2);
    var x = (center[0] + offset * Math.cos(ang));
    var y = (center[1] + offset * Math.sin(ang));
    ctx.fillText(quadrant(ang), x, y);
  }
}

var Particle = function(xx,yy,m,v,a,c) {
  // m : mass
  // v : velocity
  // a : angle of velocity
  // c : color
  this.x = xx;
  this.y = yy;
  this.mass = m;
  this.velocity = v;
  this.angle = a;
  this.color = c;
  this.radius = Math.min(this.mass * gEnv.kSizeConst, 50);
  this.instances = [];
  this.id = Math.random();
};

Particle.prototype.getPositionAt = function(time) {
  // position at a time point.
  // TODO: this could be a continuous function.
  //
  if (gEnvTime.time_current == time) {
    return {x: this.x, y:this.y};
  }
  // lookup past positions
  var tinst;
  for (var i = this.instances.length; i < this.instances.length; i++) {
    tinst = this.instances[i];
    if (tinst.time == time) {
      break;
    }
  }
  return tinst.pos;
};

Particle.prototype.setPositionAt = function(time, inst) {
  // associates a position with a time. Keeps the last 5.
  //
  this.instances.push({time:time, pos:inst});
  if (this.instances.length > 3) {
    this.instances = this.instances.slice(this.instances.length - 3,this.instances.length);
  }
}

Particle.prototype.forceDrag = function() {
  // returns the force of drag.
  // TODO: drag is also a function of surface area
  //
  var vsqrd = this.velocity * this.velocity;
  return gEnv.kDrag * vsqrd;
};

Particle.prototype.update = function() {
  // sets the new x,y,velocity,angle. Does not draw
  //
  var dTime = gEnvTime.delta();
  var aDrag = -1.0 * (this.forceDrag() / this.mass);
  var newVelocity = this.velocity;
  var newAngVelocity = this.angle;

  // update position
  var newX = this.x
    + (Math.cos(this.angle) * this.velocity * dTime) 
    + (Math.cos(this.angle) * aDrag * dTime * dTime);
  var newY = this.y
    + (Math.sin(this.angle) * this.velocity * dTime)
    + (Math.sin(this.angle) * aDrag * dTime * dTime);
  if (newX < 0) {
    newX *= -1;
    newAngVelocity = reflectYaxis(newAngVelocity);
  } else if (newX > gEnv.xlim) {
    newX = gEnv.xlim - (newX - gEnv.xlim);
    newAngVelocity = reflectYaxis(newAngVelocity);
  }
  if (newY < 0) {
    newY *= -1;
    newAngVelocity = reflectXaxis(newAngVelocity);
  } else if (newY > gEnv.ylim) {
    newY = gEnv.ylim - (newY - gEnv.ylim);
    newAngVelocity = reflectXaxis(newAngVelocity);
  }

  // acceleration due to gravity
  var xgComp = 0;
  var ygComp = 0;
  if(gEnv.kEnableGrav) {
    var updateGravLamdba = (other) => {
      if (other.id != this.id) {
        var a = atan(this.y - other.y, this.x - other.x);
        var f = gravity(this.mass, other.mass, distance(this.x,this.y,other.x,other.y));
        xgComp = xgComp + (Math.cos(a) * f);
        ygComp = ygComp + (Math.sin(a) * f);
      }
    };
    for (var i = 0; i < gEnv.particles.length; i++){
      var other = gEnv.particles[i];
      updateGravLamdba(other);
    }
    for (var i = 0; i < gEnv.sinks.length; i++) {
      var other = gEnv.sinks[i];
      updateGravLamdba(other);
    }

    var angGrav = atan(ygComp, xgComp);
    var fGrav = Math.sqrt((xgComp*xgComp)+(ygComp*ygComp));
    // apply gravity (directional)
    var vxn = (Math.cos(newAngVelocity) * newVelocity) + (2 * dTime * (xgComp/this.mass));
    var vyn = (Math.sin(newAngVelocity) * newVelocity) + (2 * dTime * (ygComp/this.mass));
    newVelocity = Math.sqrt(vxn*vxn + vyn*vyn);
    newAngVelocity = atan(vyn, vxn);
  }
  
  // apply drag
  newVelocity = newVelocity + (2 * dTime * aDrag);
  
  // because I can't code:
  newVelocity = Math.min(gEnv.kMaxVelocity, newVelocity);
  newVelocity = Math.max(0, newVelocity);

  this.setPositionAt(gEnvTime.time_current, {x:this.x, y:this.y});

  if (newX == NaN || newY == NaN) {
    pause(true);
    console.log("Paused: invalid position calculation.");
  }

  this.velocity = newVelocity;
  this.angle = newAngVelocity;
  this.x = newX;
  this.y = newY;
};

Particle.prototype.draw = function() {
  var ctx = gEnv.ctx;
  ctx.beginPath();
  ctx.fillStyle = this.color;
  ctx.strokeStyle = "#000000";
  ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

Particle.prototype.angleTo = function(other){
  // the angle of the other object with respect to this particle
  return atan(other.y-this.y,other.x-this.x);
}

function doInelastic(p1, p2, i, j) {
  var nv = iecollision(p1,p2);
  var rm = j;
  if (p1.mass > p2.mass) {
    p1.velocity = Math.sqrt(nv[0] * nv[0] + nv[1] * nv[1]);
    p1.angle = atan(nv[1], nv[0]);
    p1.mass += p2.mass;
    p1.radius = Math.min(p1.mass * gEnv.kSizeConst, 50);
  } else {
    p2.velocity = Math.sqrt(nv[0] * nv[0] + nv[1] * nv[1]);
    p2.angle = atan(nv[1], nv[0]);
    p2.mass += p1.mass;
    p2.radius = Math.min(p2.mass * gEnv.kSizeConst, 50);
    rm = i;
  }
  gEnv.particles.splice(rm,1);
}

function doElastic(p2, p1, i, j) {
  var nv = ecollision(p1,p2);
  p1.velocity = Math.sqrt(nv[0][0] * nv[0][0] + nv[0][1] * nv[0][1]);
  p2.velocity = Math.sqrt(nv[1][0] * nv[1][0] + nv[1][1] * nv[1][1]);
  p1.angle = atan(nv[0][1], nv[0][0]);
  p2.angle = atan(nv[1][1], nv[1][0]);
}

function doCollisions() {
  var ctx = gEnv.ctx;
  var particles = gEnv.particles;
  for(var i = 0; i < particles.length - 1; i++) {
    var p1 = particles[i];
    for(var j = i + 1; j < particles.length; j++) {
      var p2 = particles[j];
      // detect overlap
      if (distance(p1.x, p1.y, p2.x, p2.y) < p1.radius + p2.radius) {
        if (gEnv.kInelastic && gEnv.kElastic) {
          // do some funky critera to decide if the particles reflect or join
          if (p1.velocity > 80 || p2.velocity > 80) {
            doInelastic(p1, p2, i, j);
          } else {
            doElastic(p1, p2, i, j);
          }
        } else if (gEnv.kInelastic) {
          doInelastic(p1, p2, i, j);
        } else if (gEnv.kElastic) {
          doElastic(p1, p2, i, j);
        }
      }
    }
  }
  // TODO move the particles from overlapping each other.
};

var Sink = function(x,y) {
  Particle.call(this,x,y,10,0,0,0,'#000000');
}
// a way of doing inheritence in Javascript.
Sink.prototype = Object.create(Particle.prototype);

Sink.prototype.draw = function() {
  var kSize = 400;
  var ctx = gEnv.ctx;
  var grd = ctx.createRadialGradient(this.x, this.y, this.radius * 0.9, 
                                     this.x, this.y, this.radius * 0.3);
  grd.addColorStop(1, '#444444');
  grd.addColorStop(0, '#FFFFFF');

  ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);

  ctx.fillStyle = grd;
  ctx.fill();
}

Sink.prototype.update = function() {
  this.x = gMouse.xCurrent;
  this.y = gMouse.yCurrent;

  if (gMouse.xInit != -1 && gMouse.yInit != -1) {
    if (Math.sqrt(Math.pow(gMouse.xInit - this.x,2) +
                  Math.pow(gMouse.yInit - this.y,2)) < gMouse.kRadiusInit) {
      gMouse.tPressed += gEnvTime.delta();
      this.mass = Math.atan(gMouse.tPressed/10) * 2000;
      this.radius = this.mass * gEnv.kSizeConst * 0.5;

      // console.log('(' + this.radius + ", " + this.mass + ", " + gMouse.tPressed + ")");
    } else {
      gMouse.xInit = -1;
      gMouse.yInit = -1;
    }
  }
}

var gMouse = {
  kBoundGrowthRadius : 10,
  kRadiusInit : 10,
  kRadiusMax : 100,

  tPressed : 0,

  xInit : -1,
  yInit : -1,
  radius : -1,
  xCurrent : -1,
  yCurrent : -1,
  active : false
};

gMouse.begin = function(event) {
  var x = event.offsetX;
  var y = event.offsetY;

  gMouse.xInit = x;
  gMouse.yInit = y;
  gMouse.xCurrent = x;
  gMouse.yCurrent = y;
  gMouse.tPressed = 0;
  gMouse.radius = gMouse.kRadiusInit;
  gMouse.active = true;

  gEnv.sinks.push(new Sink(gMouse.xCurrent, gMouse.yCurrent));

  gEnv.canvas.removeEventListener("mousedown", gMouse.begin);
  gEnv.canvas.addEventListener("mousemove", gMouse.update);
  gEnv.canvas.addEventListener("mouseup", gMouse.end);
};

gMouse.update = function(event) {
  if (gMouse.active) {
    gMouse.xCurrent = event.offsetX;
    gMouse.yCurrent = event.offsetY;
  }
}

gMouse.end = function(event) {
  gMouse.xInit = -1;
  gMouse.yInit = -1;
  gMouse.xCurrent = -1;
  gMouse.yCurrent = -1;
  gMouse.radius = -1;
  gMouse.active = false;

  gEnv.sinks = [];
  gEnv.canvas.removeEventListener("mousemove", gMouse.update);
  gEnv.canvas.removeEventListener("mouseup", gMouse.end);
  gEnv.canvas.addEventListener("mousedown", gMouse.begin);
};

function updateDelta(dTime) {
  // draws enviroment.
  gEnvTime.time_last = gEnvTime.time_current;
  gEnvTime.time_current += dTime;
  gEnvTime.ticks += 1;
  gEnvTime.total_elapsed += dTime;
  
  gEnv.ctx.clearRect(0,0,gEnv.xlim,gEnv.ylim);
  for (var i = 0; i < gEnv.particles.length; i++) {
    gEnv.particles[i].update();
  }
  for (var i = 0; i < gEnv.particles.length; i++) {
    gEnv.particles[i].draw();
  }
}

function updateEnv() {
  // draws enviroment.
  gEnvTime.tick();
  gEnv.ctx.clearRect(0,0,gEnv.xlim,gEnv.ylim);
  for (var i = 0; i < gEnv.particles.length; i++) {
    gEnv.particles[i].update();
  }
  for (var i = 0; i < gEnv.sinks.length; i++) {
    gEnv.sinks[i].update();
    gEnv.sinks[i].draw();
  }
  for (var i = 0; i < gEnv.particles.length; i++) {
    gEnv.particles[i].draw();
  }
  doCollisions();
}

function onTick() {
  if (!gEnv.paused) {    
    updateEnv();
  }
  if (gEnv.kDrawRose) {
    drawRose();
  }

  window.requestAnimationFrame(onTick);
}

function pause(s) {
  if (s == null) {
    s = !gEnv.paused;
  }
  if (s != gEnv.paused) {
    if (s == false) {
      var newEnvTime = new EnvTime(gEnvTime.ticks, gEnvTime.total_elapsed);
      newEnvTime.tick();
      gEnvTime = newEnvTime;
    }
    gEnv.paused = s;
  }
}
  
function initEnv() {
  // gEnv.particles.push(new Particle(gEnv.xlim/2,gEnv.ylim/2,300,0,0,"#427A82"));
  // gEnv.particles.push(new Particle(10,gEnv.ylim/2,2,0,7*(Math.PI/4) + 0.001,"#427A82"));
  for (var i = 0; i < 30; i++ ) {
    gEnv.particles.push(
      new Particle( (Math.random() * 1000) % gEnv.xlim,
                    (Math.random() * 1000) % gEnv.ylim,
                    ((Math.random() * 1000) % 50),      // velocity
                    ((Math.random() * 1000) % 40),      // mass
                    normalizeAngle(Math.random() * 100),
                    "#427A82"));
  }
  gEnv.canvas.addEventListener("mousedown", gMouse.begin);
  window.requestAnimationFrame(onTick);
}

// keyboard listeners

document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }
  var keyName = event.key.toLowerCase();

  if (keyName === 's') {
    // step the game
    gEnv.paused = true;
    updateDelta(1);
  } else if (keyName === 'p') {
    pause(!gEnv.paused);
  } else if (keyName === 'g') {
    if (event.shiftKey) {
      gEnv.kGravity = gEnv.kGravity * 0.75;
      if (gEnv.kGravity < 1) {
        gEnv.kGravity = 1;
      }
    } else {
      gEnv.kGravity = gEnv.kGravity * 1.25;
      if (gEnv.kGravity > 1000) {
        gEnv.kGravity = 1000;
      }
    }
  }
}, false);

initEnv();