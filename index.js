var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext('2d');

window.addEventListener("touchstart", function(e) {
    for(let i = 0; i < circleArray.length; i++) {
    let xDif = e.touches[0].clientX - circleArray[i].x;
    let yDif = e.touches[0].clientY - circleArray[i].y;
    circleArray[i].velocity.x = xDif * -0.05;
    circleArray[i].velocity.y = yDif * -0.05;
    }
});

window.addEventListener("resize", function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var palette = ["#31706B", "#31677D", "#357E87", "#358770", "#2D806C"];

function colorfrompalette() {
    return palette[Math.floor(Math.random() * palette.length)];
}

function randomNumber(n1, n2) {
return Math.random() * (n2 - n1) + n1;
}

/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

/**
 * Swaps out two colliding particles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m2 - m1) / (m1 + m2) + u1.x * 2 * m1 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}


function Circle(x, y, dx, dy, radius, mass) {
    this.x = x;
    this.y = y;
    this.velocity = {
        x: dx,
        y: dy
    };
    this.radius = radius;
    this.color = getRandomColor();
    this.mass = mass;
    
    this.draw = function() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    }
    
    this.update = function() {
    if(this.x+this.radius > innerWidth || this.x-this.radius <0) {
        this.velocity.x=-this.velocity.x;
    }
    if(this.y+this.radius > innerHeight || this.y-this.radius <0) {
        this.velocity.y=-this.velocity.y;
    } 
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.x *= 0.99
    this.velocity.y *= 0.99
    
    this.draw();
    for(let i=0; i < circleArray.length; i++) {
        if(this !== circleArray[i]) 
        if(distance(this.x, this.y, circleArray[i].x, circleArray[i].y) - radius * 2 < 0) {
            resolveCollision(this, circleArray[i])
        }
        
    }
    }
}

var circleArray;

function init() {
circleArray = [];

for(var i = 0; i<100; i++) {
    let radius = 8;
    let x = randomNumber(radius, innerWidth-radius);
    let y = randomNumber(radius, innerHeight-radius);
    let dx = randomNumber(-10, 10);
    let dy = randomNumber(-10, 10);
    let mass = 1;
    
    if(i !== 0) {
        for(let j = 0; j < circleArray.length; j++) {
            if(distance(x, y, circleArray[j].x, circleArray[j].y) - radius * 2 < 0) {
                x = randomNumber(radius, innerWidth-radius);
                y = randomNumber(radius, innerHeight-radius);
                
                j = -1
            }
        }
    }

    
    // debug: console.log(x,y,dx,dy,radius);
    circleArray.push(new Circle(x, y, dx, dy, radius, mass));
}
}

function animate() {
    requestAnimationFrame(animate);
    //c.clearRect(0, 0, innerWidth, innerHeight);
    c.fillStyle = "rgba(255, 255, 255, 0.489)"
    c.fillRect(0, 0, innerWidth, innerHeight);
    
    for(var i = 0; i < circleArray.length; i++) {
        circleArray[i].update();
    }
    
}


init();
animate();

