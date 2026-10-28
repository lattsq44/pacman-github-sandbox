// ============================================================================
// 📄 File 1: config.js (Game Rules & Settings - Edit this to practice Git!)
// ============================================================================

window.GAME_CONFIG = {
  // 🏷️ Editor name or version tag
  LAST_EDITED_BY: "Marcus (Initial Setup v1.0)",

  // ❤️ Starting lives for Pac-Man
  INITIAL_LIVES: 3,

  // ⚡ Movement speed in milliseconds per tile (lower = faster)
  PACMAN_SPEED_MS: 150,
  GHOST_SPEED_MS: 210,

  // 🍒 Points configuration
  SCORE_PER_DOT: 10,
  SCORE_PER_POWER_PELLET: 50,
  SCORE_PER_GHOST: 200,

  // ⏱️ Power Pellet duration (seconds)
  POWER_MODE_SECONDS: 7,

  // 🎨 Colors (Hex codes or CSS color names)
  PACMAN_COLOR: "#FFD700",
  WALL_COLOR: "#1E40AF",
  GHOST_COLORS: [
    "#EF4444", // Blinky (Red)
    "#F472B6", // Pinky (Pink)
    "#06B6D4", // Inky (Cyan)
    "#FB923C"  // Clyde (Orange)
  ],

  // 📢 Header banner message
  BANNER_MESSAGE: "Welcome to Square44 GitHub Sandbox! Edit config.js or map.js to customize the game."
};
