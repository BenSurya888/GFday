// game.js (diperbarui)
// Mendukung: keyboard (← →, space), swipe, dan on-screen buttons.
// Menggunakan requestAnimationFrame untuk animasi lebih halus.
// Hati sebagai obstacle (digambar sebagai shape).

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let score = 0;

const state = {
  running: false,
  lastTime: 0,
  spawnTimer: 0,
  spawnInterval: 900,
  speedMultiplier: 1,
};

const player = {
  x: 140, y: 400, width: 46, height: 24, color: "#ff6b9a",
  vx: 0, speed: 6, friction: 0.82, jumpForce: -10, vy: 0, grounded: true
};

let obstacles = [];
let animationId = null;

// responsive canvas
function resizeCanvas() {
  const wrap = document.querySelector('.canvas-wrap');
  const maxWidth = Math.min(window.innerWidth - 48, 420);
  const aspect = 320 / 480; // canvas internal ratio
  const width = Math.floor(maxWidth);
  const height = Math.floor(width / aspect);
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  canvas.width = 320;
  canvas.height = 480;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// draw a heart shape at (cx, cy)
function drawHeart(cx, cy, size, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(size/30, size/30);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.bezierCurveTo(12, -30, 40, -18, 0, 22);
  ctx.bezierCurveTo(-40, -18, -12, -30, 0, -10);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawPlayer() {
  // draw small heart on top of player rectangle
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  drawHeart(player.x + player.width/2, player.y - 8, 20, player.color);
}

function drawObstacles() {
  obstacles.forEach(o => {
    drawHeart(o.x + o.size/2, o.y + o.size/2 - 6, o.size, "#8b2b3d");
  });
}

function spawnObstacle() {
  const size = 22 + Math.random() * 18;
  const x = Math.random() * (canvas.width - size);
  obstacles.push({ x, y: -size - 10, size, speed: 2 + Math.random()*1.8 + state.speedMultiplier*0.4 });
}

function updateObstacles(delta) {
  obstacles.forEach(o => { o.y += o.speed * (delta/16); });
  obstacles = obstacles.filter(o => o.y < canvas.height + 80);
  // collision
  obstacles.forEach(o => {
    const px = player.x, py = player.y, pw = player.width, ph = player.height;
    if (o.x < px + pw &&
        o.x + o.size > px &&
        o.y < py + ph &&
        o.y + o.size > py) {
      endGame();
    }
  });
}

function updatePlayer(delta) {
  // apply velocity and friction
  player.vx *= player.friction;
  player.x += player.vx * (delta/16);

  // gravity for simple jump
  if (!player.grounded) {
    player.vy += 0.6 * (delta/16);
    player.y += player.vy * (delta/16);
    if (player.y >= canvas.height - player.height - 10) {
      player.y = canvas.height - player.height - 10;
      player.vy = 0;
      player.grounded = true;
    }
  }

  // keep inside canvas
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function clear() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // subtle floor
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(0, canvas.height - 8, canvas.width, 8);
}

function gameLoop(ts) {
  if (!state.running) return;
  if (!state.lastTime) state.lastTime = ts;
  const delta = Math.min(50, ts - state.lastTime);
  state.lastTime = ts;

  clear();
  // spawn obstacles progressively faster
  state.spawnTimer += delta;
  if (state.spawnTimer > state.spawnInterval) {
    spawnObstacle();
    state.spawnTimer = 0;
    // slowly increase difficulty
    if (state.spawnInterval > 420) state.spawnInterval *= 0.985;
    state.speedMultiplier += 0.02;
  }

  updatePlayer(delta);
  updateObstacles(delta);
  drawPlayer();
  drawObstacles();

  // score increases with time
  score += Math.round( (delta/16) * (1 + state.speedMultiplier*0.05) );
  document.getElementById("scoreText").innerText = "Skor: " + score;

  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  // reset
  cancelAnimationFrame(animationId);
  score = 0;
  obstacles = [];
  state.running = true;
  state.spawnTimer = 0;
  state.spawnInterval = 900;
  state.speedMultiplier = 0;
  state.lastTime = 0;
  player.x = (canvas.width - player.width)/2;
  player.y = canvas.height - player.height - 10;
  player.vx = 0; player.vy = 0; player.grounded = true;
  document.getElementById("gameOverModal").classList.remove("show");
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  state.running = false;
  cancelAnimationFrame(animationId);
  document.getElementById("finalScore").innerText = score;
  const modal = document.getElementById("gameOverModal");
  modal.classList.add("show");
}

// keyboard control
window.addEventListener("keydown", (e) => {
  if (!state.running) return;
  if (e.key === "ArrowLeft") {
    player.vx = -player.speed;
  } else if (e.key === "ArrowRight") {
    player.vx = player.speed;
  } else if (e.key === " " || e.key === "Spacebar") {
    // jump
    if (player.grounded) {
      player.vy = player.jumpForce;
      player.grounded = false;
    }
  }
});
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    // let friction handle slowdown
    // no-op on keyup
  }
});

// simple swipe detection
let touchStartX = null, touchStartY = null;
canvas.addEventListener("touchstart", e => {
  if (e.changedTouches.length > 0) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }
});
canvas.addEventListener("touchend", e => {
  if (!touchStartX) return;
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 24) {
    // horizontal swipe
    if (dx > 0) player.vx = player.speed * 1.6;
    else player.vx = -player.speed * 1.6;
  } else if (Math.abs(dy) > 30 && dy < 0) {
    // swipe up => jump
    if (player.grounded) { player.vy = player.jumpForce; player.grounded = false; }
  } else {
    // tap => small jump
    if (player.grounded) { player.vy = player.jumpForce * 0.9; player.grounded = false; }
  }
  touchStartX = null; touchStartY = null;
});

// on-screen touch buttons
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
if (leftBtn && rightBtn) {
  let leftPressed = false, rightPressed = false;
  function loopTouchButtons() {
    if (!state.running) return;
    if (leftPressed) player.vx = -player.speed;
    if (rightPressed) player.vx = player.speed;
    requestAnimationFrame(loopTouchButtons);
  }
  leftBtn.addEventListener("touchstart", e => { e.preventDefault(); leftPressed = true; loopTouchButtons(); });
  leftBtn.addEventListener("touchend", e => { e.preventDefault(); leftPressed = false; });
  rightBtn.addEventListener("touchstart", e => { e.preventDefault(); rightPressed = true; loopTouchButtons(); });
  rightBtn.addEventListener("touchend", e => { e.preventDefault(); rightPressed = false; });
  // also allow mouse click for easier desktop testing
  leftBtn.addEventListener("mousedown", () => { leftPressed = true; loopTouchButtons(); });
  leftBtn.addEventListener("mouseup", () => { leftPressed = false; });
  rightBtn.addEventListener("mousedown", () => { rightPressed = true; loopTouchButtons(); });
  rightBtn.addEventListener("mouseup", () => { rightPressed = false; });
}

// UI buttons
document.getElementById("playGameBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", startGame);
document.getElementById("closeModalBtn").addEventListener("click", () => {
  document.getElementById("gameOverModal").classList.remove("show");
});

// pause on page visibility lost
document.addEventListener("visibilitychange", () => {
  if (document.hidden && state.running) {
    state.running = false;
    cancelAnimationFrame(animationId);
  }
});
