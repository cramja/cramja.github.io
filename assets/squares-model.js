_TargetChangeConst = 0.1;

_MaxValue = 200.0;
_MaxX = 50.0;
_MaxY = 50.0;

_EffectRange = 1;

_MutationRate = 0.0005;
_SwapIterval = 250;

_GaussianA = 2;
_GaussianB = 0;
_GaussianC = 2.0;
_GaussianArray = {}

function Vector(x,y,m) {
  this.x = x;
  this.y = y;
  this.m = m;

  this.distance = function(o) {
    var xx = Math.abs(this.x - o.x);
    var yy = Math.abs(this.y - o.y);
    if (xx > _MaxX / 2) {
        xx = _MaxX - xx;
    }
    if (yy > _MaxY / 2) {
        yy = _MaxY - yy;
    }
    return Math.sqrt(
          Math.pow(xx,2) + 
          Math.pow(yy,2)
    );
  }
}

function gaussian(x) {
    var n = Math.pow(x - _GaussianB, 2);
    var d = 2.0 * _GaussianC * _GaussianC;
    return _GaussianA * Math.pow(Math.E, -1 * (n / d));
}

function nz(x) {
    if (x == 0) {
        return 0.001;
    }
    return x;
}

function wrap(x, limit) {
    if (!limit) {
        limit = _MaxValue;
    }
    var xx = x % limit;
    return xx < 0 ? limit + xx : xx;
}

function distance(p1, p2) {
    var d = Math.abs(p1 - p2);
    return d > _MaxValue / 2 ? _MaxValue - d : d;
}

function directionalDistance(source, destination) {
    var d = distance(source, destination);
    if (Math.abs(wrap(source + d) - destination) < 0.01) {
        return d;
    }
    return -1.0 * d;
}

function initializeTarget() {
    return Math.random() * _MaxValue;
}

function initializeVector() {
    var v = [];
    for (var i = 0; i < _MaxValue; i += 1) {
        // TODO: smoothing
        v = v.concat(Math.random() * _MaxValue);
    }
    return v;
}

function initializeVector2() {
    var v = [];
    for (var i = 0; i < _MaxY; i += 1) {
        var row = [];
        for (var j = 0; j < _MaxX; j += 1) {
            row.push(new Vector(j, i, Math.random() * _MaxValue));
        }
        v.push(row);
    }
    return v;
}

function targetStep(target, iteration, v) {
    return wrap((Math.cos(iteration / 50) * _MaxValue) + _MaxValue);
    // return target;
}

function max(x, m) {
    if (x < 0) {
        return Math.max(x, -1 * m);
    }
    return Math.min(x, m);
}

function vectorStep2(v, t) {
    var distances = [];
    for (var i = 0; i < v.length; i += 1) {
        var distanceRow = [];
        var row = v[i];
        for (var j = 0; j < row.length; j += 1) {
            distanceRow.push(distance(row[j].m, t));
        }
        distances.push(distanceRow);
    }

    var vp = [];
    for (var i = 0; i < v.length; i += 1) {
        var newRow = [];
        var row = v[i];
        for (var j = 0; j < row.length; j += 1) {
            var vector = row[j];
            var delta = 0.0;
            var sX = wrap(j - _EffectRange, _MaxX);
            var sY = wrap(i - _EffectRange, _MaxY);
            for (var xx = 0; xx <= _EffectRange * 2; xx += 1) {
                var sXx = wrap(sX + xx, _MaxX);
                for (var yy = 0; yy <= _EffectRange * 2; yy += 1) {
                    var sYy = wrap(sY + yy, _MaxY);

                    var influence = 0.008 * Math.max((10 / nz(distances[sYy][sXx])) - 0.4);
                    // var influence = 0.004 * gaussian((1 / nz(distances[sYy][sXx]))- 0.2);

                    delta += influence * directionalDistance(row[j].m, v[sYy][sXx].m);
                }
            }
            newRow.push(new Vector(vector.x, vector.y, wrap(vector.m + max(delta, _MaxValue / 3), _MaxValue)));
            if (Math.random() < _MutationRate) {
                newRow[j].m = Math.random() * _MaxValue;
            }
        }
        vp.push(newRow);
    }

    return vp;
}

function vectorStep(v, t) {
    var distances = [];
    var vp = v.slice();
    for (var i = 0; i < v.length; i += 1) {
        distances = distances.concat(distance(v[i], t));
    }

    for (var i = 0; i < v.length; i += 1) {
        var delta = 0.0;
        var vi = v[i];
        for (var j = -1 * _EffectRange; j <= _EffectRange; j += 1) {
            var jj = wrap(i + j);
            var vj = v[jj]
            var influence = 0.1 * _GaussianArray[j] * Math.min(1 / nz(distances[jj]) * 10, 3);
            delta += influence * directionalDistance(vi, vj);
        }
        if (Math.random() < _MutationRate) {
            delta += (Math.random() - 0.5) * (_MaxValue / 2);
        }
        vp[i] = wrap(vi + delta);
    }

    return vp;
}

function mse2(v, t) {
    var se = 0;
    for (var i = 0; i < v.length; i++) {
        var row = v[i];
        for (var j = 0; j < row.length; j+=1) {
            se += Math.pow(distance(row[j].m, t), 2);
        }
    }
    return se / (v.length * v[0].length);
}

function mse(v, t) {
    var se = 0;
    for (var i = 0; i < v.length; i++) {
        se += Math.pow(distance(t, v[i]), 2);
    }
    return se / v.length
}

for (var i = -1 * _MaxValue; i <= _MaxValue; i++) {
    _GaussianArray[i] = gaussian(i);
}

// t = initializeTarget();
// v = initializeVector2();

// console.log("starting. MSE: ", mse2(v, t));
// for (var i = 0; i < 10; i++) {
//     v = vectorStep2(v, t);
// }
// console.log("done. MSE: ", mse2(v, t));
