// define quadrant start.
var kPI1 = Math.PI/2;
var kPI2 = Math.PI;
var kPI3 = kPI1 * 3;

function normalizeAngle(ang){
  // returns a positive angle < 2PI equivalent to the given angle.
  //
  var twoPI = Math.PI * 2;
  var a = ang % twoPI;
  if ( a < 0 ) {
    a = a + twoPI;
  }
  return a;
}

function quadrant(ang) {
  // returns the quadrant (0-3) of the angle.
  //
  var a = normalizeAngle(ang);
  if (a < kPI1) {
    return 0;
  } else if (a < kPI2) {
    return 1;
  } else if (a < kPI3) {
    return 2;
  } else {
    return 3;
  }
};

function reflectXaxis(ang) {
  // reflects the given angle over the X axis
  //
  var quad = quadrant(ang);
  var anorm = normalizeAngle(ang);
  var reflect = 0;
  if (quad == 1 || quad == 2) {
    reflect = Math.PI + (Math.PI - anorm);
  } else {
    reflect = (Math.PI*2) - anorm;
  }
  return reflect;
};

function reflectYaxis(ang) {
  // reflects the given angle over the Y axis
  //
  var quad = quadrant(ang);
  var anorm = normalizeAngle(ang);
  var reflect = 0;
  if (quad == 1 || quad == 0) {
    reflect = anorm - (anorm - kPI1)*2; 
  } else {
    reflect = kPI3 + (kPI3 - anorm); 
  }
  return reflect;
};

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(y1-y2,2) + Math.pow(x1-x2,2));
};

function atan(dy,dx) {
  if (Math.abs(dx) < 1e-5) {
    dx = 0;
  }
  if (Math.abs(dy) < 1e-5) {
    dy = 0;
  }
  if (dx == 0 && dy == 0) {
    console.log("wtf, atan 0");
  }

  if (dx == 0) {
    if (dy > 0) {
      return kPI1;
    } else {
      return kPI3;
    }
  }
  if (dy == 0) {
    if (dx > 0) {
      return 0;
    } else {
      return -Math.PI;
    }
  }
  return Math.atan2(dy,dx); 
}

function ecollision(part1, part2) {
  // calculates the elastic collision between the particles.
  // Returns a vector of the new velocities. [v1x, v1y, v2x, v2y]
  //
  var m1 = part1.mass;
  var m2 = part2.mass;
  var v1 = [Math.cos(part1.angle) * part1.velocity,
            Math.sin(part1.angle) * part1.velocity];
  var v2 = [Math.cos(part2.angle) * part2.velocity,
            Math.sin(part2.angle) * part2.velocity];

  var kMass2 = (2 * part2.mass) / (part1.mass + part2.mass);
  var x1dx2 = [part1.x - part2.x, part1.y - part2.y];
  var v1dv2 = [v1[0] - v2[0], v1[1] - v2[1]];
  var v1dotx = x1dx2[0] * v1dv2[0] + x1dx2[1] * v1dv2[1];
  var xdotx = x1dx2[0] * x1dx2[0] + x1dx2[1] * x1dx2[1];
  var iprod = kMass2 * (v1dotx/xdotx);
  var v1p = [v1[0] - (iprod * x1dx2[0]), v1[1] - (iprod * x1dx2[1])];

  var kMass1 = (2 * part1.mass) / (part1.mass + part2.mass);
  x1dx2[0] *= -1;
  x1dx2[1] *= -1;
  v1dv2[0] *= -1;
  v1dv2[1] *= -1;
  v1dotx = x1dx2[0] * v1dv2[0] + x1dx2[1] * v1dv2[1];
  iprod = kMass1 * (v1dotx/xdotx);
  var v2p = [v2[0] - (iprod * x1dx2[0]), v2[1] - (iprod * x1dx2[1])];
  return [v1p, v2p];
}

function iecollision(part1, part2) {
  // calculates the inelastic collision between the particles.
  // Returns a vector of the new velocities. [v1x, v1y, v2x, v2y]
  //
  var vx1 = part1.velocity * Math.cos(part1.angle);
  var vy1 = part1.velocity * Math.sin(part1.angle);

  var vx2 = part2.velocity * Math.cos(part2.angle);
  var vy2 = part2.velocity * Math.sin(part2.angle);

  return [(part1.mass * vx1 + part2.mass * vx2) / (part1.mass + part2.mass),
    (part1.mass * vy1 + part2.mass * vy2) / (part1.mass + part2.mass)];
}





