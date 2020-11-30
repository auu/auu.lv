var canvas;
var context;
var proton;
var renderer;
var emitter, pointZone;
var R, num;

main();

function main() {
  num = Math.min(parseInt(window.innerWidth / (1000 / 145)), 400);
  R = 140;

  initCanvas();
  createProton(num);
  setTimeout(addMouseEvent, 200);
  addRenderer();
  tick();

  appendInfo(
    "https://codesandbox.io/s/proton-spiderweb-0fzi4",
    "https://github.com/drawcall/Proton/blob/master/example/initialize/position/bg-particle.html",
    { source: "#ccc", es5: "#999" }
  );
}

function initCanvas() {
  canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context = canvas.getContext("2d");
}

function createProton(num) {
  proton = new Proton();

  emitter = new Proton.Emitter();
  emitter.rate = new Proton.Rate(
    new Proton.Span(num),
    new Proton.Span(0.05, 0.2)
  );

  emitter.addInitialize(new Proton.Mass(1));
  emitter.addInitialize(new Proton.Radius(1, 4));
  emitter.addInitialize(new Proton.Life(Infinity));

  pointZone = new Proton.Position(
    new Proton.RectZone(0, 0, canvas.width, canvas.height)
  );
  emitter.addInitialize(pointZone);
  emitter.addInitialize(
    new Proton.Velocity(
      new Proton.Span(0.3, 0.6),
      new Proton.Span(0, 360),
      "polar"
    )
  );

  emitter.addBehaviour(new Proton.Alpha(Proton.getSpan(0.2, 0.9)));
  emitter.addBehaviour(new Proton.Color("#ffffff"));
  emitter.addBehaviour(
    new Proton.CrossZone(
      new Proton.RectZone(0, 0, canvas.width, canvas.height),
      "cross"
    )
  );

  emitter.emit("once");
  emitter.damping = 0;
  proton.addEmitter(emitter);
}

function addRenderer() {
  renderer = new Proton.CanvasRenderer(canvas);
  renderer.onProtonUpdateAfter = function() {
    var particles = emitter.particles;

    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var pA = particles[i];
        var pB = particles[j];
        var dis = pA.p.distanceTo(pB.p);

        if (dis < R) {
          var alpha = (1 - dis / R) * 0.5;
          context.strokeStyle = "rgba(255,255,255," + alpha + ")";
          context.beginPath();
          context.moveTo(pA.p.x, pA.p.y);
          context.lineTo(pB.p.x, pB.p.y);
          context.closePath();
          context.stroke();
        }
      }
    }
  };

  proton.addRenderer(renderer);
}

function addMouseEvent() {
  emitter.rate = new Proton.Rate(new Proton.Span(3), 0.5);
  emitter.removeInitialize(pointZone);

  canvas.addEventListener("mousedown", function(e) {
    for (var i = 0; i < 3; i++) emitter.particles[i].dead = true;

    setTimeout(function() {
      emitter.p.x = getPos(e).x;
      emitter.p.y = getPos(e).y;
      emitter.emit("once");
    }, 60);
  });

  canvas.addEventListener("mouseup", function(e) {
    emitter.stop();
  });

  canvas.addEventListener("mousemove", function(e) {
    var p0 = emitter.particles[0];
    p0.radius = 0;
    var ease = 0.3;

    p0.p.x += (getPos(e).x - p0.p.x) * ease;
    p0.p.y += (getPos(e).y - p0.p.y) * ease;
  });
}

var _pos = { x: 0, y: 0 };
function getPos(e) {
  if (e.layerX !== undefined) {
    _pos.x = e.layerX;
    _pos.y = e.layerY;
  } else if (e.offsetX !== undefined) {
    _pos.x = e.offsetX;
    _pos.y = e.offsetY;
  }

  return _pos;
}

function tick() {
  requestAnimationFrame(tick);

  proton.update();
  proton.stats.update(3);
}
