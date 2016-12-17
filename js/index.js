'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// fun options!
var PARTICLES_PER_FIREWORK = 150; // 100 - 400 or try 1000
var FIREWORK_CHANCE = 0.02; // percentage, set to 0 and click instead
var BASE_PARTICLE_SPEED = 0.6; // between 0-4, controls the size of the overall fireworks
var FIREWORK_LIFESPAN = 600; // ms
var PARTICLE_INITIAL_SPEED = 4.5; // 2-8

// not so fun options =\
var GRAVITY = 9.8;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var particles = [];
var disableAutoFireworks = false;
var resetDisable = 0;

var loop = function loop() {

  if (!disableAutoFireworks && Math.random() < FIREWORK_CHANCE) {
    createFirework();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(function (particle, i) {
    particle.animate();
    particle.render();
    if (particle.y > canvas.height || particle.x < 0 || particle.x > canvas.width || particle.alpha <= 0) {
      particles.splice(i, 1);
    }
  });

  requestAnimationFrame(loop);
};

var createFirework = function createFirework() {
  var x = arguments.length <= 0 || arguments[0] === undefined ? Math.random() * canvas.width : arguments[0];
  var y = arguments.length <= 1 || arguments[1] === undefined ? Math.random() * canvas.height : arguments[1];

  var speed = Math.random() * 2 + BASE_PARTICLE_SPEED;
  var maxSpeed = speed;

  var red = ~ ~(Math.random() * 255);
  var green = ~ ~(Math.random() * 255);
  var blue = ~ ~(Math.random() * 255);

  // use brighter colours
  red = red < 150 ? red + 150 : red;
  green = green < 150 ? green + 150 : green;
  blue = blue < 150 ? blue + 150 : blue;

  // inner firework
  for (var i = 0; i < PARTICLES_PER_FIREWORK; i++) {
    var particle = new Particle(x, y, red, green, blue, speed);
    particles.push(particle);

    maxSpeed = speed > maxSpeed ? speed : maxSpeed;
  }

  // outer edge particles to make the firework appear more full
  for (var i = 0; i < 40; i++) {
    var particle = new Particle(x, y, red, green, blue, maxSpeed, true);
    particles.push(particle);
  }
};

var Particle = function () {
  function Particle() {
    var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var red = arguments.length <= 2 || arguments[2] === undefined ? ~ ~(Math.random() * 255) : arguments[2];
    var green = arguments.length <= 3 || arguments[3] === undefined ? ~ ~(Math.random() * 255) : arguments[3];
    var blue = arguments.length <= 4 || arguments[4] === undefined ? ~ ~(Math.random() * 255) : arguments[4];
    var speed = arguments[5];
    var isFixedSpeed = arguments[6];

    _classCallCheck(this, Particle);

    this.x = x;
    this.y = y;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = 0.05;
    this.radius = 1 + Math.random();
    this.angle = Math.random() * 360;
    this.speed = Math.random() * speed + 0.1;
    this.velocityX = Math.cos(this.angle) * this.speed;
    this.velocityY = Math.sin(this.angle) * this.speed;
    this.startTime = new Date().getTime();
    this.duration = Math.random() * 300 + FIREWORK_LIFESPAN;
    this.currentDiration = 0;
    this.dampening = 30; // slowing factor at the end

    this.colour = this.getColour();

    if (isFixedSpeed) {
      this.speed = speed;
      this.velocityY = Math.sin(this.angle) * this.speed;
      this.velocityX = Math.cos(this.angle) * this.speed;
    }

    this.initialVelocityX = this.velocityX;
    this.initialVelocityY = this.velocityY;
  }

  Particle.prototype.animate = function animate() {

    this.currentDuration = new Date().getTime() - this.startTime;

    // initial speed kick
    if (this.currentDuration <= 200) {

      this.x += this.initialVelocityX * PARTICLE_INITIAL_SPEED;
      this.y += this.initialVelocityY * PARTICLE_INITIAL_SPEED;
      this.alpha += 0.01;

      this.colour = this.getColour(240, 240, 240, 0.9);
    } else {

      // normal expansion
      this.x += this.velocityX;
      this.y += this.velocityY;
      this.colour = this.getColour(this.red, this.green, this.blue, 0.4 + Math.random() * 0.3);
    }

    this.velocityY += GRAVITY / 1000;

    // slow down particles at the end
    if (this.currentDuration >= this.duration) {
      this.velocityX -= this.velocityX / this.dampening;
      this.velocityY -= this.velocityY / this.dampening;
    }

    if (this.currentDuration >= this.duration + this.duration / 1.1) {

      // fade out at the end
      this.alpha -= 0.02;
      this.colour = this.getColour();
    } else {

      // fade in during expansion
      if (this.alpha < 1) {
        this.alpha += 0.03;
      }
    }
  };

  Particle.prototype.render = function render() {

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.lineWidth = this.lineWidth;
    ctx.fillStyle = this.colour;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.getColour(this.red + 150, this.green + 150, this.blue + 150, 1);
    ctx.fill();
  };

  Particle.prototype.getColour = function getColour(red, green, blue, alpha) {

    return 'rgba(' + (red || this.red) + ', ' + (green || this.green) + ', ' + (blue || this.blue) + ', ' + (alpha || this.alpha) + ')';
  };

  return Particle;
}();

var updateCanvasSize = function updateCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

// run it!

updateCanvasSize();
$(window).resize(updateCanvasSize);
$(canvas).on('click', function (e) {

  createFirework(e.clientX, e.clientY);

  // stop fireworks when clicked, re-enable after short time
  disableAutoFireworks = true;
  clearTimeout(resetDisable);
  resetDisable = setTimeout(function () {
    disableAutoFireworks = false;
  }, 5000);
});

loop();