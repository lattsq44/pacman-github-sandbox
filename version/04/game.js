// ============================================================================
// File 4: game.js — Pac-Man engine (v3: Kedar face + red walls + pink dots)
// ============================================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE = 24;
const ROWS = window.GAME_MAP_TEMPLATE.length;
const COLS = window.GAME_MAP_TEMPLATE[0].length;
canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

const cfg = window.GAME_CONFIG;

document.getElementById("bannerMsg").textContent = cfg.BANNER_MESSAGE;
document.getElementById("lastEditor").textContent = "Last Edited By: " + cfg.LAST_EDITED_BY;

const kedarImg = new Image();
kedarImg.src = "kedar.jpg";
let kedarReady = false;
kedarImg.onload = () => { kedarReady = true; };

let map = [];
let score = 0;
let lives = cfg.INITIAL_LIVES;
let dotsRemaining = 0;
let powerTimer = 0;
let gameOver = false;
let gameWon = false;
let mouthOpen = true;

let pacman = { r: 16, c: 9, dr: 0, dc: 0, nextDr: 0, nextDc: 0, angle: 0 };
let ghosts = [];

function cloneMap() {
  map = window.GAME_MAP_TEMPLATE.map(row => [...row]);
  dotsRemaining = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (map[r][c] === 0 || map[r][c] === 2) dotsRemaining++;
    }
  }
}

function resetPositions() {
  pacman = { r: 16, c: 9, dr: 0, dc: -1, nextDr: 0, nextDc: -1, angle: Math.PI };
  const startCoords = [
    { r: 9, c: 9 },
    { r: 10, c: 8 },
    { r: 10, c: 9 },
    { r: 10, c: 10 }
  ];
  ghosts = startCoords.map((pos, idx) => ({
    r: pos.r,
    c: pos.c,
    dr: idx % 2 === 0 ? -1 : 0,
    dc: idx % 2 === 0 ? 0 : 1,
    color: cfg.GHOST_COLORS[idx % cfg.GHOST_COLORS.length]
  }));
}

function initGame() {
  score = 0;
  lives = cfg.INITIAL_LIVES;
  powerTimer = 0;
  gameOver = false;
  gameWon = false;
  cloneMap();
  resetPositions();
  updateHUD();
}

function updateHUD() {
  document.getElementById("scoreVal").textContent = score;
  document.getElementById("livesVal").textContent = "❤️".repeat(Math.max(0, Math.min(lives, 10))) + (lives > 10 ? ` (x${lives})` : "");
  const statusEl = document.getElementById("statusVal");
  if (gameOver) {
    statusEl.textContent = "💥 GAME OVER! Click Restart";
    statusEl.style.color = "#f87171";
  } else if (gameWon) {
    statusEl.textContent = "🏆 YOU WIN! All dots cleared!";
    statusEl.style.color = "#4ade80";
  } else if (powerTimer > 0) {
    statusEl.textContent = `⚡ POWER MODE! (${powerTimer}s)`;
    statusEl.style.color = "#60a5fa";
  } else {
    statusEl.textContent = "🎮 Use Arrow Keys or W A S D";
    statusEl.style.color = "#38bdf8";
  }
}

function canMove(r, c) {
  if (c < 0 || c >= COLS) return true;
  if (r < 0 || r >= ROWS) return false;
  return map[r][c] !== 1;
}

function stepPacman() {
  if (gameOver || gameWon) return;

  const tryR = pacman.r + pacman.nextDr;
  const tryC = (pacman.c + pacman.nextDc + COLS) % COLS;
  if (canMove(tryR, tryC)) {
    pacman.dr = pacman.nextDr;
    pacman.dc = pacman.nextDc;
    if (pacman.dc === 1) pacman.angle = 0;
    else if (pacman.dc === -1) pacman.angle = Math.PI;
    else if (pacman.dr === -1) pacman.angle = -Math.PI / 2;
    else if (pacman.dr === 1) pacman.angle = Math.PI / 2;
  }

  const nextR = pacman.r + pacman.dr;
  const nextC = (pacman.c + pacman.dc + COLS) % COLS;
  if (canMove(nextR, nextC)) {
    pacman.r = nextR;
    pacman.c = nextC;
    mouthOpen = !mouthOpen;
  }

  const cell = map[pacman.r][pacman.c];
  if (cell === 0) {
    map[pacman.r][pacman.c] = 9;
    score += cfg.SCORE_PER_DOT;
    dotsRemaining--;
  } else if (cell === 2) {
    map[pacman.r][pacman.c] = 9;
    score += cfg.SCORE_PER_POWER_PELLET;
    dotsRemaining--;
    powerTimer = cfg.POWER_MODE_SECONDS;
  }

  if (dotsRemaining <= 0) {
    gameWon = true;
  }

  checkCollisions();
  updateHUD();
}

function stepGhosts() {
  if (gameOver || gameWon) return;

  ghosts.forEach(g => {
    const dirs = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];

    let valid = dirs.filter(d => {
      const nr = g.r + d.dr;
      const nc = (g.c + d.dc + COLS) % COLS;
      return canMove(nr, nc) && !(d.dr === -g.dr && d.dc === -g.dc);
    });

    if (valid.length === 0) {
      valid = dirs.filter(d => canMove(g.r + d.dr, (g.c + d.dc + COLS) % COLS));
    }

    if (valid.length > 0) {
      let chosen = valid[Math.floor(Math.random() * valid.length)];
      if (Math.random() < 0.6) {
        valid.sort((a, b) => {
          const distA = Math.hypot((g.r + a.dr) - pacman.r, (g.c + a.dc) - pacman.c);
          const distB = Math.hypot((g.r + b.dr) - pacman.r, (g.c + b.dc) - pacman.c);
          return powerTimer > 0 ? distB - distA : distA - distB;
        });
        chosen = valid[0];
      }
      g.dr = chosen.dr;
      g.dc = chosen.dc;
      g.r += g.dr;
      g.c = (g.c + g.dc + COLS) % COLS;
    }
  });

  checkCollisions();
  updateHUD();
}

function checkCollisions() {
  ghosts.forEach(g => {
    if (g.r === pacman.r && g.c === pacman.c) {
      if (powerTimer > 0) {
        score += cfg.SCORE_PER_GHOST;
        g.r = 10;
        g.c = 9;
      } else {
        lives--;
        if (lives <= 0) {
          gameOver = true;
        } else {
          resetPositions();
        }
      }
    }
  });
}

function drawKedarPacman(px, py) {
  const rad = TILE / 2 - 2;
  const mouth = mouthOpen ? 0.23 * Math.PI : 0.04 * Math.PI;
  const start = pacman.angle + mouth;
  const end = pacman.angle + Math.PI * 2 - mouth;

  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, rad, start, end, false);
  ctx.lineTo(px, py);
  ctx.closePath();
  ctx.clip();

  if (kedarReady) {
    ctx.drawImage(kedarImg, px - rad, py - rad, rad * 2, rad * 2);
  } else {
    ctx.fillStyle = cfg.PACMAN_COLOR;
    ctx.fill();
  }
  ctx.restore();

  // Yellow rim so it still reads as Pac-Man
  ctx.beginPath();
  ctx.arc(px, py, rad, start, end, false);
  ctx.lineTo(px, py);
  ctx.closePath();
  ctx.strokeStyle = "#FACC15";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = map[r][c];
      const x = c * TILE;
      const y = r * TILE;

      if (cell === 1) {
        ctx.fillStyle = cfg.WALL_COLOR;
        ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
      } else if (cell === 0) {
        ctx.fillStyle = cfg.DOT_COLOR || "#f472b6";
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (cell === 2) {
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const px = pacman.c * TILE + TILE / 2;
  const py = pacman.r * TILE + TILE / 2;
  drawKedarPacman(px, py);

  ghosts.forEach(g => {
    const gx = g.c * TILE + TILE / 2;
    const gy = g.r * TILE + TILE / 2;
    const rad = TILE / 2 - 2;

    ctx.fillStyle = powerTimer > 0 ? "#2563eb" : g.color;
    ctx.beginPath();
    ctx.arc(gx, gy - 2, rad, Math.PI, 0, false);
    ctx.lineTo(gx + rad, gy + rad);
    ctx.lineTo(gx - rad, gy + rad);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(gx - 4, gy - 3, 3, 0, Math.PI * 2);
    ctx.arc(gx + 4, gy - 3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(gx - 4 + g.dc, gy - 3 + g.dr, 1.5, 0, Math.PI * 2);
    ctx.arc(gx + 4 + g.dc, gy - 3 + g.dr, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(draw);
}

window.addEventListener("keydown", e => {
  if (["ArrowUp", "KeyW"].includes(e.code)) { pacman.nextDr = -1; pacman.nextDc = 0; e.preventDefault(); }
  if (["ArrowDown", "KeyS"].includes(e.code)) { pacman.nextDr = 1; pacman.nextDc = 0; e.preventDefault(); }
  if (["ArrowLeft", "KeyA"].includes(e.code)) { pacman.nextDr = 0; pacman.nextDc = -1; e.preventDefault(); }
  if (["ArrowRight", "KeyD"].includes(e.code)) { pacman.nextDr = 0; pacman.nextDc = 1; e.preventDefault(); }
});

document.getElementById("restartBtn").addEventListener("click", initGame);

initGame();
setInterval(stepPacman, cfg.PACMAN_SPEED_MS);
setInterval(stepGhosts, cfg.GHOST_SPEED_MS);
setInterval(() => {
  if (powerTimer > 0) {
    powerTimer--;
    updateHUD();
  }
}, 1000);
requestAnimationFrame(draw);
