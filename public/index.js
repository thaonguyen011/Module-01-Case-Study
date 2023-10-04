const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const scoreEl = document.querySelector("#scoreEl");

canvas.width = innerWidth;
canvas.height = innerHeight;

const enermyShootSound = new Audio("./Image/audio/enemyShoot.wav");
enermyShootSound.volume = 0.6;
const backgroundSound = new Audio("./Image/audio/backgroundMusic.wav");
backgroundSound.volume = 0.4;
const playerShootSound = new Audio("./Image/audio/shoot.wav");
playerShootSound.volume = 0.3;
const gameOverSound = new Audio("./Image/audio/gameOver.mp3");
const bombSound = new Audio("./Image/audio/bomb.mp3");
const explodeSound = new Audio("./Image/audio/explode.wav");
explodeSound.volume = 0.6;

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.rotation = 0;
    this.opacity = 1;
    const image = new Image();
    image.src = "./Image/spaceship.png";
    image.onload = () => {
      const scale = 0.15;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 20,
      };
    };
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
    c.rotate(this.rotation);
    c.translate(
      -(this.position.x + this.width / 2),
      -(this.position.y + this.height / 2)
    );

    if (this.image)
      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );

    c.restore();
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = 3;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "red";
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Invader {
  constructor({ position }) {
    this.velocity = {
      x: 0,
      y: 0,
    };

    const image = new Image();
    image.src = "./Image/invader.png";
    image.onload = () => {
      const scale = 1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  draw() {
    if (this.image)
      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
  }

  update({ velocity }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  shoot(invaderProjectiles) {
    invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 5,
        },
      })
    );
    enermyShootSound.play();
  }
}

class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 5;
    this.height = 15;
  }

  draw() {
    c.fillStyle = "#00FF00";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.y += this.velocity.y;
  }
}

class Grid {
  constructor() {
    (this.position = {
      x: 0,
      y: 0,
    }),
      (this.velocity = {
        x: 3,
        y: 0,
      }),
      (this.invaders = []);

    const rows = Math.floor(Math.random() * 5 + 2);
    const cols = Math.floor(Math.random() * 10 + 5);

    this.width = cols * 30;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        this.invaders.push(
          new Invader({
            position: {
              x: j * 30,
              y: i * 30,
            },
          })
        );
      }
    }
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.y = 0;
    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 30;
    }
  }
}

class Particle {
  constructor({ position, velocity, radius, color, fades }) {
    this.position = position;
    this.velocity = velocity;
    this.color = color;
    this.radius = radius;
    this.opacity = 1;
    this.fades = fades;
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
    c.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.fades) this.opacity -= 0.01;
  }
}

const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];
const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  space: {
    pressed: false,
  },
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500) + 500;
let game = {
  over: false,
  active: true,
};
let score = 0;
// let countGrid = 0;

for (let i = 0; i < 100; i++) {
  particles.push(
    new Particle({
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      },
      velocity: {
        x: 0,
        y: 0.2,
      },
      radius: Math.random() * 3,
      color: "#000066",
      fades: false,
    })
  );
}
function createParticle({ object, radiusRange, radiusMin, color }) {
  for (let i = 0; i < 10; i++) {
    particles.push(
      new Particle({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * radiusRange + radiusMin,
        color: color || "#9966FF",
        fades: true,
      })
    );
  }
}

function touch(object1, object2) {
  return (
    object1.position.x + object1.width >= object2.position.x &&
    object1.position.x <= object2.position.x + object2.width &&
    object1.position.y + object1.height >= object2.position.y &&
    object1.position.y <= object2.position.y + object2.height
  );
}

function animate() {
  if (game.active) {
    requestAnimationFrame(animate);
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);
    backgroundSound.play();
    player.update();

    particles.forEach((particle, i) => {
      if (particle.position.y + particle.radius >= canvas.height) {
        particle.position.x = Math.random() * canvas.width;
        particle.position.y = 0;
      }
      if (particle.opacity <= 0) {
        setTimeout(() => {
          particles.splice(i, 1);
        }, 0);
      } else particle.update();
    });

    invaderProjectiles.forEach((invaderProjectile, i) => {
      if (
        invaderProjectile.position.y + invaderProjectile.height >=
        canvas.height
      ) {
        setTimeout(() => {
          invaderProjectiles.splice(i, 1);
        }, 0);
      } else invaderProjectile.update();

      if (touch(invaderProjectile, player)) {
        setTimeout(() => {
          invaderProjectiles.splice(i, 1);
          player.opacity = 0;
          game.over = true;
        }, 0);
        gameOverSound.play();
        setTimeout(() => {
          game.active = false;
          c.font = "50px serif ";
          c.fillStyle = "#FFFF00";
          c.fillText("YOU LOSE", canvas.width / 2 - 100, canvas.height / 2);
        }, 1000);
        createParticle({
          object: player,
          color: "red",
          radiusRange: 5,
          radiusMin: 3,
        });
      }
    });

    projectiles.forEach((projectile, index) => {
      if (projectile.position.y + projectile.radius <= 0) {
        setTimeout(() => {
          projectiles.splice(index, 1);
        }, 0);
      } else projectile.update();
    });

    grids.forEach((grid, index) => {
      grid.update();
      if (frames % 100 === 0 && grid.invaders.length > 0) {
        grid.invaders[
          Math.floor(Math.random() * (grid.invaders.length - 1))
        ].shoot(invaderProjectiles);
      }
      grid.invaders.forEach((invader, i) => {
        invader.update({ velocity: grid.velocity });
        if (touch(invader, player)) {
          setTimeout(() => {
            player.opacity = 0;
            game.over = true;
          }, 0);
          gameOverSound.play();
          setTimeout(() => {
            game.active = false;
            c.font = "50px serif ";
            c.fillStyle = "#FFFF00";
            c.fillText("YOU LOSE", canvas.width / 2 - 100, canvas.height / 2);
          }, 1000);
          createParticle({
            object: player,
            color: "red",
            radiusRange: 5,
            radiusMin: 3,
          });
        }

        projectiles.forEach((projectile, j) => {
          if (
            projectile.position.y - projectile.radius <=
              invader.position.y + invader.height &&
            projectile.position.x + projectile.radius >= invader.position.x &&
            projectile.position.x - projectile.radius <=
              invader.position.x + invader.width &&
            projectile.position.y + projectile.radius >= invader.position.y
          ) {
            explodeSound.play();
            createParticle({
              object: invader,
              radiusRange: 3,
              radiusMin: 0,
              color: "#BAA0DE",
              fades: true,
            });
            setTimeout(() => {
              const invaderFound = grid.invaders.find((invader2) => {
                return invader2 === invader;
              });

              const projectileFound = projectiles.find((projectile2) => {
                return projectile2 === projectile;
              });
              if (invaderFound && projectileFound) {
                score += 100;
                scoreEl.innerHTML = score;
                createParticle({
                  object: invader,
                  radiusRange: 3,
                  radiusMin: 0,
                  fades: true,
                });
                grid.invaders.splice(i, 1);
                projectiles.splice(j, 1);
              }
            }, 0);
            if (grid.invaders.length === 0) {
              grids.splice(index, 1);
            }
          }
        });
      });
    });
    if (keys.a.pressed && player.position.x >= 0) {
      player.velocity.x = -7;
      player.rotation = -0.15;
    } else if (
      keys.d.pressed &&
      player.position.x + player.width <= canvas.width
    ) {
      player.velocity.x = 7;
      player.rotation = 0.15;
    } 
    else {
      player.velocity.x = 0;
      player.rotation = 0;
    }
    if (frames % randomInterval === 0) {
      grids.push(new Grid());
      randomInterval = Math.floor(Math.random() * 500) + 500;
    
    }

    frames++;
  }
}
animate();

addEventListener("keydown", ({ key }) => {
  if (game.over) return;
  switch (key) {
    case "a":
      keys.a.pressed = true;
      break;
    case "d":
      keys.d.pressed = true;
      break;
    case "w":
      player.velocity.y = -10;
      break;
    case " ":
      keys.space.pressed = true;
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y,
          },
          velocity: {
            x: 0,
            y: -10,
          },
        })
      );
      playerShootSound.play();
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  if (game.over) return;
  switch (key) {
    case "a":
      keys.a.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
    case " ":
      keys.space.pressed = false;
      break;
  }
});
