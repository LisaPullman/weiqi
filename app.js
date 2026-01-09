// Configuration
const CONFIG = {
  storageKey: "foxai-go-progress",
  maxLevel: 10,
  animationDuration: 280,
  aiDelay: 520,
  cardFlipDelay: 600,
};

// Dynamic board size (default 9, can be changed)
let boardSize = 9;

// DOM Elements - cached for performance
const DOM = {
  board: document.getElementById("board"),
  winCountEl: document.getElementById("winCount"),
  starCountEl: document.getElementById("starCount"),
  levelDoneEl: document.getElementById("levelDone"),
  rewardModal: document.getElementById("rewardModal"),
  rewardGame: document.getElementById("rewardGame"),
  coachLine: document.getElementById("coachLine"),
  puzzlePanel: document.getElementById("puzzlePanel"),
  puzzleText: document.getElementById("puzzleText"),
  aiLevelSelect: document.getElementById("aiLevel"),
  boardSizeSelect: document.getElementById("boardSize"),
  rewardTitle: document.querySelector(".reward-header h2"),
  rewardSubtitle: document.querySelector(".reward-header p"),
  scoreLine: document.getElementById("scoreLine"),
  puzzleLevelSelect: document.getElementById("puzzleLevelSelect"),
  puzzleFileInput: document.getElementById("puzzleFile"),
  reviewModal: document.getElementById("reviewModal"),
  reviewBoard: document.getElementById("reviewBoard"),
  reviewSummary: document.getElementById("reviewSummary"),
  reviewDetail: document.getElementById("reviewDetail"),
  headerRankPill: document.querySelector(".header-meta .pill:last-child"),
  hintBtn: document.getElementById("hintBtn"),
  // 残局挑战元素
  endgamePanel: document.getElementById("endgamePanel"),
  endgameText: document.getElementById("endgameText"),
  endgameLivesEl: document.getElementById("endgameLives"),
  endgameComboEl: document.getElementById("endgameCombo"),
  endgameScoreEl: document.getElementById("endgameScore"),
  endgameTimerEl: document.getElementById("endgameTimer"),
  endgameLevelSelect: document.getElementById("endgameLevelSelect"),
  startEndgameBtn: document.getElementById("startEndgameBtn"),
  giveUpEndgameBtn: document.getElementById("giveUpEndgameBtn"),
  // 棋谱导入元素
  importBtn: document.getElementById("importBtn"),
  sgfFileInput: document.getElementById("sgfFileInput"),
  // 形势分析元素
  analyzeBtn: document.getElementById("analyzeBtn"),
  analyzeModal: document.getElementById("analyzeModal"),
  blackAdvantage: document.getElementById("blackAdvantage"),
  whiteAdvantage: document.getElementById("whiteAdvantage"),
  blackAdvantageValue: document.getElementById("blackAdvantageValue"),
  whiteAdvantageValue: document.getElementById("whiteAdvantageValue"),
  blackStonesEl: document.getElementById("blackStones"),
  whiteStonesEl: document.getElementById("whiteStones"),
  blackTerritoryEl: document.getElementById("blackTerritory"),
  whiteTerritoryEl: document.getElementById("whiteTerritory"),
  totalMovesEl: document.getElementById("totalMoves"),
  suggestionText: document.getElementById("suggestionText"),
  closeAnalyzeBtn: document.getElementById("closeAnalyzeBtn"),
  // 音效控制元素
  soundToggleBtn: document.getElementById("soundToggle"),
};

// ========== 音效系统 ==========
let audioContext = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log("[Audio] AudioContext init failed:", e);
      audioContext = null;
    }
  }
  return audioContext;
}

function playStoneSound() {
  if (!soundEnabled) return;
  try {
    const context = getAudioContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  } catch (e) {
    console.log('[Audio] Error playing stone sound:', e);
  }
}

function playCaptureSound() {
  if (!soundEnabled) return;
  try {
    const context = getAudioContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.frequency.setValueAtTime(600, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.15);
    oscillator.type = 'triangle';
    gainNode.gain.setValueAtTime(0.2, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  } catch (e) {
    console.log('[Audio] Error playing capture sound:', e);
  }
}

function playWinSound() {
  if (!soundEnabled) return;
  try {
    const context = getAudioContext();
    if (!context) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      const startTime = context.currentTime + i * 0.15;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  } catch (e) {
    console.log('[Audio] Error playing win sound:', e);
  }
}

function playErrorSound() {
  if (!soundEnabled) return;
  try {
    const context = getAudioContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';
    gainNode.gain.setValueAtTime(0.2, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.15);
  } catch (e) {
    console.log('[Audio] Error playing error sound:', e);
  }
}

function playPuzzleCorrectSound() {
  if (!soundEnabled) return;
  try {
    const context = getAudioContext();
    if (!context) return;
    const notes = [783.99, 1046.50];
    notes.forEach((freq, i) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      const startTime = context.currentTime + i * 0.1;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.25);
    });
  } catch (e) {
    console.log('[Audio] Error playing puzzle correct sound:', e);
  }
}

// ========== 震动反馈 ==========
function vibrate(pattern = [10]) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.log('[Vibrate] Error:', e);
    }
  }
}

function vibrateStone() {
  vibrate([8]);
}

function vibrateCapture() {
  vibrate([15, 30, 15]);
}

function vibrateWin() {
  vibrate([50, 50, 50, 50, 100]);
}

function vibrateError() {
  vibrate([30, 50, 30]);
}

const { storageKey } = CONFIG;
const levels = [
  "启蒙 1 级",
  "启蒙 2 级",
  "小棋童 1 级",
  "小棋童 2 级",
  "小棋童 3 级",
  "小棋士 1 级",
  "小棋士 2 级",
  "小棋士 3 级",
  "星耀 1 级",
  "星耀 2 级",
];

let state = {
  wins: 0,
  stars: 0,
  levelDone: 1,
  currentMode: "learn",
  aiLevel: 3,
  lastBoardString: "",
  currentBoardString: "",
  puzzleIndex: 0,
  puzzleLevel: 0,
  passCount: 0,
  reviewData: null,
  moveHistory: [],
  board: Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => null)
  ),
  // 统计数据
  totalGames: 0,
  totalPuzzles: 0,
  currentStreak: 0,
  winStreak: 0,
  achievements: {
    firstGame: false,
    winStreak3: false,
    puzzles50: false,
    stars100: false,
    chessPlayer: false,
    tutorialComplete: false
  },
  // 残局挑战状态
  endgameLives: 3,
  endgameCombo: 0,
  endgameScore: 0,
  endgameTimer: 60,
  endgameLevel: 1,
  endgameActive: false,
  endgameTimerInterval: null,
  endgameCurrentPuzzle: null,
  // 本地对战状态
  currentPlayer: "black", // black 或 white
  localGameActive: false
};

const coachLines = [
  "歪歪，试试在白子旁边下黑子，让它喘不过气。",
  "这步可以先连起来，别让小狐狸把你分开哦。",
  "先占住角落更稳，歪歪做得很棒！",
  "点亮星星就能解锁奖励，我们继续加油！",
  "找找看哪颗白子只剩一口气了？",
  "围住白子，不让它逃跑！",
  "角上的点很重要哦，歪歪加油！",
  "看看中间有没有好位置？",
  "保护好自己的棋子，别被吃掉啦！",
  "歪歪真聪明，继续思考！",
];

const fallbackPuzzleData = {
  levels: [
    {
      id: "basic",
      name: "启蒙",
      puzzles: [
        {
          title: "数气：吃掉一颗白子",
          stones: [
            { row: 3, col: 3, color: "black" },
            { row: 3, col: 4, color: "white" },
            { row: 4, col: 3, color: "black" },
            { row: 2, col: 4, color: "black" },
          ],
          answer: { row: 4, col: 4 },
        },
        {
          title: "连接：让黑子相连",
          stones: [
            { row: 4, col: 2, color: "black" },
            { row: 4, col: 4, color: "black" },
            { row: 3, col: 3, color: "white" },
          ],
          answer: { row: 4, col: 3 },
        },
        {
          title: "断点：先补气",
          stones: [
            { row: 2, col: 2, color: "black" },
            { row: 2, col: 3, color: "white" },
            { row: 3, col: 2, color: "white" },
          ],
          answer: { row: 3, col: 3 },
        },
        {
          title: "吃子：提走白子",
          stones: [
            { row: 1, col: 1, color: "white" },
            { row: 1, col: 2, color: "black" },
            { row: 2, col: 1, color: "black" },
          ],
          answer: { row: 2, col: 2 },
        },
        {
          title: "占角：抢先落角",
          stones: [{ row: 1, col: 7, color: "white" }],
          answer: { row: 0, col: 8 },
        },
        {
          title: "虎口：守住空点",
          stones: [
            { row: 6, col: 2, color: "black" },
            { row: 6, col: 4, color: "black" },
            { row: 5, col: 3, color: "white" },
          ],
          answer: { row: 6, col: 3 },
        },
      ],
    },
    {
      id: "intermediate",
      name: "基础",
      puzzles: [
        {
          title: "逃子：白子快没气了",
          stones: [
            { row: 5, col: 5, color: "white" },
            { row: 5, col: 4, color: "black" },
            { row: 4, col: 5, color: "black" },
            { row: 6, col: 5, color: "black" },
          ],
          answer: { row: 5, col: 6 },
        },
        {
          title: "切断：阻止白子连起来",
          stones: [
            { row: 3, col: 6, color: "white" },
            { row: 4, col: 6, color: "white" },
            { row: 3, col: 5, color: "black" },
          ],
          answer: { row: 4, col: 5 },
        },
        {
          title: "连接：跨一格连起来",
          stones: [
            { row: 6, col: 6, color: "black" },
            { row: 6, col: 8, color: "black" },
            { row: 5, col: 7, color: "white" },
          ],
          answer: { row: 6, col: 7 },
        },
        {
          title: "断点：切开白子",
          stones: [
            { row: 2, col: 2, color: "white" },
            { row: 2, col: 3, color: "white" },
            { row: 3, col: 2, color: "black" },
          ],
          answer: { row: 3, col: 3 },
        },
        {
          title: "连接：抢救一条线",
          stones: [
            { row: 1, col: 4, color: "black" },
            { row: 3, col: 4, color: "black" },
            { row: 2, col: 4, color: "white" },
          ],
          answer: { row: 2, col: 5 },
        },
      ],
    },
    {
      id: "advanced",
      name: "进阶",
      puzzles: [
        {
          title: "死活：救活黑子",
          stones: [
            { row: 4, col: 4, color: "black" },
            { row: 4, col: 5, color: "white" },
            { row: 5, col: 4, color: "white" },
            { row: 3, col: 4, color: "white" },
          ],
          answer: { row: 5, col: 5 },
        },
        {
          title: "死活：一手吃",
          stones: [
            { row: 2, col: 6, color: "white" },
            { row: 1, col: 6, color: "black" },
            { row: 2, col: 5, color: "black" },
            { row: 3, col: 6, color: "black" },
          ],
          answer: { row: 2, col: 7 },
        },
        {
          title: "劫争：制造劫",
          stones: [
            { row: 4, col: 6, color: "white" },
            { row: 4, col: 5, color: "black" },
            { row: 3, col: 6, color: "black" },
            { row: 5, col: 6, color: "black" },
          ],
          answer: { row: 4, col: 7 },
        },
        {
          title: "劫争：抢先打劫",
          stones: [
            { row: 5, col: 2, color: "white" },
            { row: 5, col: 3, color: "black" },
            { row: 4, col: 2, color: "black" },
            { row: 6, col: 2, color: "black" },
          ],
          answer: { row: 5, col: 1 },
        },
        {
          title: "死活：做眼",
          stones: [
            { row: 7, col: 4, color: "black" },
            { row: 7, col: 5, color: "black" },
            { row: 6, col: 4, color: "white" },
            { row: 6, col: 5, color: "white" },
          ],
          answer: { row: 8, col: 4 },
        },
      ],
    },
  ],
};

let puzzleData = fallbackPuzzleData;

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    state = { ...state, ...JSON.parse(saved) };
  }
  DOM.aiLevelSelect.value = String(state.aiLevel || 3);
  updateProgress();
  renderLevels();
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function updateProgress() {
  DOM.winCountEl.textContent = state.wins;
  DOM.starCountEl.textContent = state.stars;
  DOM.levelDoneEl.textContent = state.levelDone;
  const levelIndex = Math.min(state.levelDone - 1, levels.length - 1);
  if (DOM.headerRankPill) {
    DOM.headerRankPill.textContent = `段位：${levels[levelIndex]}`;
  }
  updateStats();
  checkAchievements();
}

function updateStats() {
  const totalGamesEl = document.getElementById("totalGames");
  const winRateEl = document.getElementById("winRate");
  const totalPuzzlesEl = document.getElementById("totalPuzzles");
  const currentStreakEl = document.getElementById("currentStreak");

  if (totalGamesEl) totalGamesEl.textContent = state.totalGames;
  if (winRateEl) {
    const rate = state.totalGames > 0 ? Math.round((state.wins / state.totalGames) * 100) : 0;
    winRateEl.textContent = `${rate}%`;
  }
  if (totalPuzzlesEl) totalPuzzlesEl.textContent = state.totalPuzzles;
  if (currentStreakEl) currentStreakEl.textContent = state.currentStreak;
}

function checkAchievements() {
  const achievementList = document.getElementById("achievementList");
  if (!achievementList) return;

  const badges = achievementList.querySelectorAll(".achievement-badge");
  const achievementKeys = ["firstGame", "winStreak3", "puzzles50", "stars100", "chessPlayer", "tutorialComplete"];

  // Check and update achievements
  if (!state.achievements.firstGame && state.totalGames >= 1) {
    state.achievements.firstGame = true;
    unlockAchievement(0, "完成了第一局对局！");
  }

  if (!state.achievements.winStreak3 && state.winStreak >= 3) {
    state.achievements.winStreak3 = true;
    unlockAchievement(1, "连胜3局！太棒了！");
  }

  if (!state.achievements.puzzles50 && state.totalPuzzles >= 50) {
    state.achievements.puzzles50 = true;
    unlockAchievement(2, "完成50道题目！");
  }

  if (!state.achievements.stars100 && state.stars >= 100) {
    state.achievements.stars100 = true;
    unlockAchievement(3, "收集了100颗星！");
  }

  if (!state.achievements.chessPlayer && state.levelDone >= 6) {
    state.achievements.chessPlayer = true;
    unlockAchievement(4, "晋升为小棋士！");
  }

  // Update visual state
  achievementKeys.forEach((key, index) => {
    if (state.achievements[key]) {
      badges[index].classList.remove("locked");
      badges[index].classList.add("unlocked");
    }
  });
}

function unlockAchievement(index, message) {
  const badges = document.querySelectorAll(".achievement-badge");
  if (badges[index]) {
    badges[index].classList.remove("locked");
    badges[index].classList.add("unlocked");
  }
  playWinSound();
  vibrateWin();
  speak(`解锁成就：${message}`);
  createConfetti();
}

function renderLevels() {
  const grid = document.getElementById("levelGrid");
  grid.innerHTML = "";
  for (let i = 1; i <= 10; i += 1) {
    const item = document.createElement("div");
    item.className = `level-item${i <= state.levelDone ? " completed" : ""}`;
    item.textContent = `第 ${i} 关`;
    grid.appendChild(item);
  }
}

function buildBoard() {
  DOM.board.innerHTML = "";
  const fragment = document.createDocumentFragment();
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      const cell = document.createElement("button");
      cell.className = "intersection";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.setAttribute("aria-label", `位置 ${row + 1}行 ${col + 1}列`);
      cell.addEventListener("click", handlePlayerMove);
      cell.addEventListener("mouseenter", () => showGhostStone(row, col));
      cell.addEventListener("mouseleave", hideGhostStone);
      cell.addEventListener("touchstart", () => showGhostStone(row, col), { passive: true });
      cell.addEventListener("touchend", hideGhostStone);
      fragment.appendChild(cell);
    }
  }
  DOM.board.appendChild(fragment);
}

let ghostStone = null;

function showGhostStone(row, col) {
  if (state.board[row][col]) return;
  if (ghostStone) ghostStone.remove();

  ghostStone = document.createElement("div");
  ghostStone.className = "ghost-stone";
  ghostStone.setAttribute("aria-hidden", "true");
  const cellSize = DOM.board.clientWidth / boardSize;
  ghostStone.style.left = `${cellSize * col + cellSize / 2}px`;
  ghostStone.style.top = `${cellSize * row + cellSize / 2}px`;
  DOM.board.appendChild(ghostStone);
}

function hideGhostStone() {
  if (ghostStone) {
    ghostStone.remove();
    ghostStone = null;
  }
}

function placeStone(row, col, color, animate = true) {
  const stone = document.createElement("div");
  stone.className = `stone-piece ${color}`;
  stone.setAttribute("aria-hidden", "true");
  stone.dataset.row = row;
  stone.dataset.col = col;

  if (!animate) {
    stone.style.animation = "none";
    stone.style.transform = "translate(-50%, -50%) scale(1)";
  }
  const cellSize = DOM.board.clientWidth / boardSize;
  stone.style.left = `${cellSize * col + cellSize / 2}px`;
  stone.style.top = `${cellSize * row + cellSize / 2}px`;
  DOM.board.appendChild(stone);
  state.board[row][col] = color;

  // Add marker for last move
  markLastMove(row, col, color);
}

// Mark the last move with a small indicator
function markLastMove(row, col, color) {
  // Remove existing markers
  DOM.board.querySelectorAll('.last-move-marker').forEach(m => m.remove());

  // Add new marker
  const marker = document.createElement("div");
  marker.className = "last-move-marker";
  marker.setAttribute("aria-hidden", "true");
  const cellSize = DOM.board.clientWidth / boardSize;
  marker.style.left = `${cellSize * col + cellSize / 2}px`;
  marker.style.top = `${cellSize * row + cellSize / 2}px`;
  DOM.board.appendChild(marker);
}

function cloneBoard(boardData) {
  return boardData.map((row) => row.slice());
}

function boardToString(boardData) {
  return boardData.map((row) => row.map((cell) => cell || ".").join("")).join("");
}

function getNeighbors(row, col) {
  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ].filter(([r, c]) => r >= 0 && r < boardSize && c >= 0 && c < boardSize);
}

function getGroup(boardData, row, col) {
  const color = boardData[row][col];
  const stack = [[row, col]];
  const visited = new Set();
  const group = [];
  while (stack.length) {
    const [r, c] = stack.pop();
    const key = `${r}-${c}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);
    group.push([r, c]);
    getNeighbors(r, c).forEach(([nr, nc]) => {
      if (boardData[nr][nc] === color) {
        stack.push([nr, nc]);
      }
    });
  }
  return group;
}

function getLiberties(boardData, group) {
  const liberties = new Set();
  group.forEach(([r, c]) => {
    getNeighbors(r, c).forEach(([nr, nc]) => {
      if (!boardData[nr][nc]) {
        liberties.add(`${nr}-${nc}`);
      }
    });
  });
  return liberties;
}

function removeGroup(boardData, group) {
  group.forEach(([r, c]) => {
    boardData[r][c] = null;
  });
}

function applyMove(boardData, row, col, color) {
  if (boardData[row][col]) {
    return null;
  }
  const nextBoard = cloneBoard(boardData);
  nextBoard[row][col] = color;
  const opponent = color === "black" ? "white" : "black";
  let captured = 0;
  getNeighbors(row, col).forEach(([nr, nc]) => {
    if (nextBoard[nr][nc] === opponent) {
      const group = getGroup(nextBoard, nr, nc);
      if (getLiberties(nextBoard, group).size === 0) {
        captured += group.length;
        removeGroup(nextBoard, group);
      }
    }
  });
  const selfGroup = getGroup(nextBoard, row, col);
  if (getLiberties(nextBoard, selfGroup).size === 0 && captured === 0) {
    return null;
  }
  return { nextBoard, captured };
}

function isKo(boardString) {
  return boardString === state.lastBoardString;
}

function commitBoard(nextBoard) {
  state.lastBoardString = state.currentBoardString;
  state.currentBoardString = boardToString(nextBoard);
  state.board = nextBoard;
}

function handlePlayerMove(event) {
  const row = Number(event.currentTarget.dataset.row);
  const col = Number(event.currentTarget.dataset.col);
  if (state.board[row][col]) {
    playErrorSound();
    vibrateError();
    showMoveHint(row, col, "这个位置已经有棋子啦");
    return;
  }
  const result = applyMove(state.board, row, col, "black");
  if (!result) {
    speak("这一步不能下哦。");
    playErrorSound();
    vibrateError();
    showMoveHint(row, col, "这步会让自己没气哦");
    return;
  }
  const nextString = boardToString(result.nextBoard);
  if (isKo(nextString)) {
    speak("打劫啦！这步不行。");
    playErrorSound();
    vibrateError();
    return;
  }
  commitBoard(result.nextBoard);
  state.moveHistory.push({ row, col, color: "black" });
  if (result.captured > 0) {
    playCaptureSound();
    vibrateCapture();
    handleCaptures();
  } else {
    playStoneSound();
    vibrateStone();
    placeStone(row, col, "black");
    updateScoreLine();
  }
  state.passCount = 0;
  clearMoveHint();
  saveState();
  if (state.currentMode === "puzzle") {
    checkPuzzleAnswer(row, col);
    return;
  }
  if (state.currentMode === "endgame") {
    checkEndgameAnswer(row, col);
    return;
  }
  if (state.currentMode === "local") {
    // 本地对战模式：切换玩家
    state.currentPlayer = state.currentPlayer === "black" ? "white" : "black";
    const playerName = state.currentPlayer === "black" ? "黑方" : "白方";
    speak(`轮到${playerName}下棋了！`);
    return;
  }
  window.setTimeout(() => makeAiMove(state.aiLevel), CONFIG.aiDelay);
}

// ========== AI 提示系统 ==========
let hintMarker = null;
let hintText = null;

function showMoveHint(row, col, message) {
  // Remove existing hint
  clearMoveHint();

  // Create hint marker on board
  hintMarker = document.createElement("div");
  hintMarker.className = "hint-marker";
  const cellSize = DOM.board.clientWidth / boardSize;
  hintMarker.style.left = `${cellSize * col + cellSize / 2}px`;
  hintMarker.style.top = `${cellSize * row + cellSize / 2}px`;
  DOM.board.appendChild(hintMarker);

  // Show hint text
  hintText = document.createElement("div");
  hintText.className = "hint-text";
  hintText.textContent = message;
  DOM.board.parentElement.appendChild(hintText);

  // Auto remove after 2 seconds
  setTimeout(clearMoveHint, 2000);
}

function clearMoveHint() {
  if (hintMarker) {
    hintMarker.remove();
    hintMarker = null;
  }
  if (hintText) {
    hintText.remove();
    hintText = null;
  }
}

function makeAiMove(level) {
  const empty = [];
  const candidates = [];
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      if (!state.board[row][col]) {
        empty.push({ row, col });
        const result = applyMove(state.board, row, col, "white");
        if (result) {
          const nextString = boardToString(result.nextBoard);
          if (!isKo(nextString)) {
            candidates.push({ row, col, result });
          }
        }
      }
    }
  }
  if (!candidates.length) {
    state.passCount += 1;
    if (state.passCount >= 2) {
      endGame();
    }
    return;
  }
  let pick;
  if (level <= 2 && Math.random() < 0.45) {
    pick = candidates[Math.floor(Math.random() * candidates.length)];
  } else {
    pick = pickBestMove(candidates, level);
  }
  if (shouldAiPass(pick, empty.length)) {
    state.passCount += 1;
    if (state.passCount >= 2) {
      endGame();
    }
    return;
  }
  commitBoard(pick.result.nextBoard);
  state.moveHistory.push({ row: pick.row, col: pick.col, color: "white" });
  if (pick.result.captured > 0) {
    playCaptureSound();
    handleCaptures();
  } else {
    playStoneSound();
    placeStone(pick.row, pick.col, "white");
    updateScoreLine();
  }
  state.passCount = 0;
}

function handleWin() {
  state.wins += 1;
  state.stars += 2;
  state.levelDone = Math.min(CONFIG.maxLevel, state.levelDone + 1);
  state.totalGames += 1;
  state.winStreak += 1;
  resetBoard();
  updateProgress();
  renderLevels();
  saveState();
  playWinSound();
  vibrateWin();
  speak("歪歪太棒了！你完成了这一关！");
  createConfetti();
}

function createConfetti() {
  const colors = ["#ff6f61", "#5ee4b4", "#ffcc4d", "#6bb6ff", "#ff9950"];
  for (let i = 0; i < 30; i += 1) {
    const confetti = document.createElement("div");
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -10px;
      z-index: 1000;
      pointer-events: none;
      animation: fall ${2 + Math.random() * 2}s linear forwards;
    `;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }

  // Add confetti animation if not exists
  if (!document.getElementById("confetti-style")) {
    const style = document.createElement("style");
    style.id = "confetti-style";
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

function resetBoard() {
  state.board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => null)
  );
  state.currentBoardString = boardToString(state.board);
  state.lastBoardString = "";
  state.passCount = 0;
  state.moveHistory = [];
  DOM.board.querySelectorAll(".stone-piece").forEach((node) => node.remove());
  updateScoreLine();
}

function undoMove() {
  if (state.moveHistory.length === 0) {
    speak("没有可以撤销的步骤啦。");
    return;
  }
  if (state.currentMode === "puzzle") {
    speak("题库模式下不能撤销哦。");
    return;
  }

  // Undo last two moves (player + AI)
  state.moveHistory.pop();
  state.moveHistory.pop();

  // Reconstruct board from history
  state.board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => null)
  );

  state.moveHistory.forEach((move) => {
    state.board[move.row][move.col] = move.color;
  });

  state.currentBoardString = boardToString(state.board);
  state.lastBoardString = "";

  // Redraw board
  DOM.board.querySelectorAll(".stone-piece").forEach((node) => node.remove());
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      if (state.board[row][col]) {
        placeStone(row, col, state.board[row][col], false);
      }
    }
  }
  updateScoreLine();
  speak("撤销成功！");
}

function speak(text) {
  if (!window.speechSynthesis) {
    console.log("[Speech]", text);
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "zh-CN";
  utter.rate = 0.95;
  utter.pitch = 1.1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function openRewardGame() {
  DOM.rewardModal.classList.add("active");
  DOM.rewardModal.setAttribute("aria-hidden", "false");
  DOM.rewardTitle.textContent = "星星捕捉";
  DOM.rewardSubtitle.textContent = "点亮 5 颗星星，解锁小狐狸贴纸！";
  document
    .querySelectorAll(".tab-btn")
    .forEach((node) => node.classList.remove("active"));
  document
    .querySelector('.tab-btn[data-game="stars"]')
    .classList.add("active");
  buildStarGame();
}

function closeRewardGame() {
  DOM.rewardModal.classList.remove("active");
  DOM.rewardModal.setAttribute("aria-hidden", "true");
}

function buildStarGame() {
  DOM.rewardGame.innerHTML = "";
  for (let i = 0; i < 6; i += 1) {
    const star = document.createElement("div");
    star.className = "star";
    star.setAttribute("role", "button");
    star.setAttribute("aria-label", `星星 ${i + 1}`);
    star.style.left = `${10 + Math.random() * 80}%`;
    star.style.top = `${10 + Math.random() * 70}%`;
    star.style.animationDelay = `${Math.random() * 2}s`;
    star.addEventListener("click", () => {
      star.remove();
      state.stars += 1;
      updateProgress();
      saveState();
      if (DOM.rewardGame.querySelectorAll(".star").length === 0) {
        speak("奖励完成！歪歪获得了小狐狸贴纸！");
      }
    });
    DOM.rewardGame.appendChild(star);
  }
}

function buildMemoryGame() {
  DOM.rewardGame.innerHTML = "";
  const emojis = ["🦊", "🌟", "🍎", "🎈", "🐼", "🎵"];
  const deck = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  const grid = document.createElement("div");
  grid.className = "memory-grid";
  DOM.rewardGame.appendChild(grid);
  let firstCard = null;
  let lock = false;
  deck.forEach((emoji, index) => {
    const card = document.createElement("button");
    card.className = "memory-card";
    card.textContent = "❓";
    card.setAttribute("aria-label", `卡片 ${index + 1}`);
    card.addEventListener("click", () => {
      if (lock || card.classList.contains("matched")) {
        return;
      }
      card.textContent = emoji;
      card.classList.add("revealed");
      if (!firstCard) {
        firstCard = { card, emoji };
        return;
      }
      if (firstCard.emoji === emoji) {
        card.classList.add("matched");
        firstCard.card.classList.add("matched");
        firstCard = null;
        state.stars += 1;
        updateProgress();
        saveState();
        if (grid.querySelectorAll(".matched").length === deck.length) {
          speak("连连乐完成！歪歪真厉害！");
        }
      } else {
        lock = true;
        window.setTimeout(() => {
          card.textContent = "❓";
          firstCard.card.textContent = "❓";
          card.classList.remove("revealed");
          firstCard.card.classList.remove("revealed");
          firstCard = null;
          lock = false;
        }, CONFIG.cardFlipDelay);
      }
    });
    grid.appendChild(card);
  });
}

function shouldAiPass(bestCandidate, emptyCount) {
  if (emptyCount > 8) {
    return false;
  }
  const group = getGroup(bestCandidate.result.nextBoard, bestCandidate.row, bestCandidate.col);
  const liberties = getLiberties(bestCandidate.result.nextBoard, group).size;
  const score = bestCandidate.result.captured * 10 + liberties;
  return score < 4 && Math.random() < 0.6;
}

function handleCaptures() {
  const stones = DOM.board.querySelectorAll(".stone-piece");
  stones.forEach((node) => {
    node.remove();
  });
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      if (state.board[row][col]) {
        placeStone(row, col, state.board[row][col], false);
      }
    }
  }
  updateScoreLine();
}

function pickBestMove(candidates, level) {
  const weights = {
    1: { capture: 4, liberty: 1, center: 0.5, random: 3, atari: 2, defend: 1, pattern: 0.5, connection: 1 },
    2: { capture: 6, liberty: 1.5, center: 0.7, random: 2, atari: 3, defend: 1.5, pattern: 1, connection: 1.5 },
    3: { capture: 8, liberty: 2, center: 1, random: 1.5, atari: 4, defend: 2, pattern: 1.5, connection: 2 },
    4: { capture: 10, liberty: 2.5, center: 1.2, random: 1, atari: 5, defend: 2.5, pattern: 2, connection: 2.5 },
    5: { capture: 14, liberty: 3, center: 1.5, random: 0.5, atari: 6, defend: 3, pattern: 2.5, connection: 3 },
  };
  const weight = weights[level] || weights[3];
  let best = candidates[0];
  let bestScore = -Infinity;

  // Count stones for each color
  let blackCount = 0;
  let whiteCount = 0;
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (state.board[r][c] === "black") blackCount++;
      if (state.board[r][c] === "white") whiteCount++;
    }
  }
  const isEarlyGame = (blackCount + whiteCount) < 15;

  candidates.forEach((candidate) => {
    const { row, col, result } = candidate;
    const centerDist =
      Math.abs(row - (boardSize - 1) / 2) + Math.abs(col - (boardSize - 1) / 2);
    const group = getGroup(result.nextBoard, row, col);
    const liberties = getLiberties(result.nextBoard, group).size;

    // Capture bonus
    let captureBonus = result.captured * weight.capture;

    // Atari detection - putting opponent in atari
    let atariBonus = 0;
    getNeighbors(row, col).forEach(([nr, nc]) => {
      if (result.nextBoard[nr] && result.nextBoard[nr][nc] === "black") {
        const opponentGroup = getGroup(result.nextBoard, nr, nc);
        const opponentLiberties = getLiberties(result.nextBoard, opponentGroup).size;
        if (opponentLiberties === 1) {
          atariBonus += weight.atari * 2; // Double bonus for immediate capture threat
        } else if (opponentLiberties === 2) {
          atariBonus += weight.atari * 0.5; // Small bonus for reducing to 2 liberties
        }
      }
    });

    // Defend our stones in danger
    let defendBonus = 0;
    getNeighbors(row, col).forEach(([nr, nc]) => {
      if (result.nextBoard[nr] && result.nextBoard[nr][nc] === "white") {
        const ourGroup = getGroup(result.nextBoard, nr, nc);
        const ourLiberties = getLiberties(result.nextBoard, ourGroup).size;
        if (ourLiberties === 1) {
          defendBonus += weight.defend * 3; // Critical defense
        } else if (ourLiberties === 2) {
          defendBonus += weight.defend; // Important defense
        }
      }
    });

    // Connection bonus - connecting our own stones
    let connectionBonus = 0;
    getNeighbors(row, col).forEach(([nr, nc]) => {
      if (state.board[nr] && state.board[nr][nc] === "white") {
        connectionBonus += weight.connection;
      }
    });

    // Pattern recognition for opening
    let patternBonus = 0;
    if (isEarlyGame) {
      // Star points (3,3), (3,5), (5,3), (5,5) in 0-indexed
      const starPoints = [
        [2, 2], [2, 6], [6, 2], [6, 6], // 4-4 points
        [2, 4], [4, 2], [4, 6], [6, 4], // 4-3 points
      ];
      const isStarPoint = starPoints.some(([r, c]) => r === row && c === col);
      if (isStarPoint && !state.board[row][col]) {
        patternBonus += weight.pattern * 2;
      }

      // Corner preference in early game
      if ((row <= 1 || row >= boardSize - 2) && (col <= 1 || col >= boardSize - 2)) {
        patternBonus += weight.pattern * 1.5;
      }

      // Avoid center too early
      if (row >= 3 && row <= 5 && col >= 3 && col <= 5) {
        patternBonus -= weight.pattern * 0.5;
      }
    }

    // Territory control - count adjacent empty points
    let territoryBonus = 0;
    getNeighbors(row, col).forEach(([nr, nc]) => {
      if (!result.nextBoard[nr][nc]) {
        territoryBonus += 0.3;
      }
    });

    // Shape bonus - avoid bad shapes (empty triangles)
    let shapePenalty = 0;
    if (!isEarlyGame) {
      getNeighbors(row, col).forEach(([nr, nc]) => {
        if (state.board[nr] && state.board[nr][nc] === "white") {
          // Check if this creates an empty triangle
          const diagonalNeighbors = [
            [nr - 1, nc - 1], [nr - 1, nc + 1],
            [nr + 1, nc - 1], [nr + 1, nc + 1]
          ].filter(([r, c]) => r >= 0 && r < boardSize && c >= 0 && c < boardSize);
          diagonalNeighbors.forEach(([dr, dc]) => {
            if (state.board[dr] && state.board[dr][dc] === "white") {
              const cornerPos = [nr, dc];
              if (!state.board[cornerPos[0]] || !state.board[cornerPos[0]][cornerPos[1]]) {
                shapePenalty += 0.5;
              }
            }
          });
        }
      });
    }

    const score =
      captureBonus +
      liberties * weight.liberty -
      centerDist * weight.center +
      atariBonus +
      defendBonus +
      connectionBonus +
      patternBonus +
      territoryBonus -
      shapePenalty +
      Math.random() * weight.random;

    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  });
  return best;
}

function updateScoreLine() {
  const score = calculateScoreDetailed(state.board);
  DOM.scoreLine.textContent = `黑 ${score.totalBlack} · 白 ${score.totalWhite}`;

  // 更新本地对战模式的指示器
  if (state.currentMode === "local") {
    const guides = document.querySelectorAll(".stone-guide");
    if (guides.length >= 2) {
      if (state.currentPlayer === "black") {
        guides[0].style.opacity = "1";
        guides[0].style.fontWeight = "700";
        guides[1].style.opacity = "0.5";
        guides[1].style.fontWeight = "400";
      } else {
        guides[0].style.opacity = "0.5";
        guides[0].style.fontWeight = "400";
        guides[1].style.opacity = "1";
        guides[1].style.fontWeight = "700";
      }
    }
  }
}

function calculateScoreDetailed(boardData) {
  let blackStones = 0;
  let whiteStones = 0;
  let blackTerritory = 0;
  let whiteTerritory = 0;
  const territoryMap = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => "neutral")
  );
  const visited = new Set();
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      const cell = boardData[row][col];
      if (cell === "black") {
        blackStones += 1;
        territoryMap[row][col] = "neutral";
        continue;
      }
      if (cell === "white") {
        whiteStones += 1;
        territoryMap[row][col] = "neutral";
        continue;
      }
      const key = `${row}-${col}`;
      if (visited.has(key)) {
        continue;
      }
      const stack = [[row, col]];
      const region = [];
      const bordering = new Set();
      while (stack.length) {
        const [r, c] = stack.pop();
        const regionKey = `${r}-${c}`;
        if (visited.has(regionKey)) {
          continue;
        }
        visited.add(regionKey);
        region.push([r, c]);
        getNeighbors(r, c).forEach(([nr, nc]) => {
          const neighbor = boardData[nr][nc];
          if (!neighbor) {
            stack.push([nr, nc]);
          } else {
            bordering.add(neighbor);
          }
        });
      }
      if (bordering.size === 1) {
        const owner = [...bordering][0];
        if (owner === "black") {
          blackTerritory += region.length;
          region.forEach(([r, c]) => {
            territoryMap[r][c] = "black";
          });
        } else if (owner === "white") {
          whiteTerritory += region.length;
          region.forEach(([r, c]) => {
            territoryMap[r][c] = "white";
          });
        }
      } else {
        region.forEach(([r, c]) => {
          territoryMap[r][c] = "neutral";
        });
      }
    }
  }
  return {
    totalBlack: blackStones + blackTerritory,
    totalWhite: whiteStones + whiteTerritory,
    blackStones,
    whiteStones,
    blackTerritory,
    whiteTerritory,
    map: territoryMap,
    board: boardData,
  };
}

function endGame() {
  const score = calculateScoreDetailed(state.board);
  const result =
    score.totalBlack === score.totalWhite
      ? "平局"
      : score.totalBlack > score.totalWhite
      ? "黑胜"
      : "白胜";
  const message = `对局结束，${result}。黑 ${score.totalBlack} 分，白 ${score.totalWhite} 分。`;

  // Update statistics
  state.totalGames += 1;
  if (result !== "黑胜") {
    state.winStreak = 0;
  }

  // Update daily challenge progress
  updateChallengeProgress("games", 1);
  if (result === "黑胜") {
    updateChallengeProgress("wins", 1);
  }

  DOM.coachLine.textContent = `歪歪，${message}`;
  speak(message);
  state.reviewData = score;
  openReview();
  if (result === "黑胜") {
    handleWin();
  } else {
    resetBoard();
  }
  updateProgress();
  saveState();
}

function loadPuzzle(index) {
  const level = puzzleData.levels[state.puzzleLevel] || puzzleData.levels[0];
  const puzzle = level.puzzles[index % level.puzzles.length];
  resetBoard();
  puzzle.stones.forEach((stone) => {
    state.board[stone.row][stone.col] = stone.color;
  });
  state.currentBoardString = boardToString(state.board);
  handleCaptures();
  puzzleText.textContent = `第 ${index + 1}/${level.puzzles.length} 题：${puzzle.title}`;
  speak(`歪歪，${puzzle.title}`);
}

function checkPuzzleAnswer(row, col) {
  const level = puzzleData.levels[state.puzzleLevel] || puzzleData.levels[0];
  const puzzle = level.puzzles[state.puzzleIndex % level.puzzles.length];
  if (puzzle.answer.row === row && puzzle.answer.col === col) {
    state.stars += 2;
    state.wins += 1;
    state.levelDone = Math.min(CONFIG.maxLevel, state.levelDone + 1);
    state.totalPuzzles += 1;
    state.currentStreak += 1;

    // Update daily challenge progress
    updateChallengeProgress("puzzles", 1);

    updateProgress();
    renderLevels();
    saveState();
    playPuzzleCorrectSound();
    vibrateWin();
    speak("答对啦！歪歪太棒了！");
    state.puzzleIndex = (state.puzzleIndex + 1) % level.puzzles.length;
    window.setTimeout(() => loadPuzzle(state.puzzleIndex), 600);
  } else {
    state.currentStreak = 0;
    updateProgress();
    saveState();
    playErrorSound();
    vibrateError();
    speak("再想一想，歪歪一定可以的！");
  }
}

function showPuzzleHint() {
  const level = puzzleData.levels[state.puzzleLevel] || puzzleData.levels[0];
  const puzzle = level.puzzles[state.puzzleIndex % level.puzzles.length];
  const hintRow = puzzle.answer.row + 1;
  const hintCol = puzzle.answer.col + 1;
  speak(`提示：试试在第 ${hintRow} 行，第 ${hintCol} 列下子。`);
}

function setMode(mode) {
  state.currentMode = mode;
  const modeText = {
    learn: "启蒙课：学习吃子和连接",
    puzzle: "题库闯关：挑战数气与死活",
    battle: "对战练习：和小狐狸较量",
    local: "本地对战：两个朋友一起下棋！",
    story: "故事关卡：守护围棋森林",
    endgame: "残局挑战：高难度死活题限时挑战！",
    reward: "奖励乐园：收集贴纸与徽章",
  };
  DOM.coachLine.textContent = `歪歪，进入${modeText[mode] || "新的模式"}！`;
  speak(DOM.coachLine.textContent);
  DOM.puzzlePanel.style.display = mode === "puzzle" ? "flex" : "none";
  DOM.endgamePanel.style.display = mode === "endgame" ? "flex" : "none";

  // 如果切换出残局模式，停止计时器
  if (mode !== "endgame" && state.endgameActive) {
    endEndgameChallenge();
  }

  // 设置本地对战模式
  if (mode === "local") {
    state.localGameActive = true;
    state.currentPlayer = "black";
    resetBoard();
    updateScoreLine();
    speak("本地对战模式！黑方先下。");
  } else {
    state.localGameActive = false;
  }

  // Update hint button text based on mode
  if (DOM.hintBtn) {
    DOM.hintBtn.textContent = mode === "puzzle" || mode === "endgame" ? "题目提示" : "语音提示";
  }

  if (mode === "puzzle") {
    loadPuzzle(state.puzzleIndex);
  } else if (mode !== "local") {
    resetBoard();
    updateScoreLine();
  }
  saveState();
}

// ========== 残局挑战系统 ==========

// 残局题库数据
const endgamePuzzles = {
  1: [ // 初级残局
    {
      title: "角上做活",
      stones: [
        { row: 7, col: 7, color: "black" },
        { row: 7, col: 8, color: "black" },
        { row: 8, col: 7, color: "white" },
        { row: 8, col: 8, color: "white" },
        { row: 6, col: 7, color: "white" },
        { row: 6, col: 8, color: "white" }
      ],
      answer: { row: 8, col: 6 },
      timeLimit: 60
    },
    {
      title: "征子练习",
      stones: [
        { row: 4, col: 4, color: "white" },
        { row: 4, col: 5, color: "black" },
        { row: 3, col: 5, color: "white" },
        { row: 5, col: 4, color: "white" }
      ],
      answer: { row: 3, col: 3 },
      timeLimit: 45
    },
    {
      title: "连接救子",
      stones: [
        { row: 4, col: 3, color: "black" },
        { row: 4, col: 5, color: "black" },
        { row: 3, col: 4, color: "white" },
        { row: 5, col: 4, color: "white" },
        { row: 4, col: 4, color: "white" }
      ],
      answer: { row: 4, col: 4 },
      timeLimit: 50
    }
  ],
  2: [ // 中级残局
    {
      title: "破眼杀棋",
      stones: [
        { row: 4, col: 4, color: "white" },
        { row: 4, col: 5, color: "white" },
        { row: 5, col: 4, color: "white" },
        { row: 5, col: 5, color: "white" },
        { row: 3, col: 3, color: "black" },
        { row: 3, col: 4, color: "black" },
        { row: 3, col: 5, color: "black" },
        { row: 4, col: 3, color: "black" },
        { row: 5, col: 3, color: "black" }
      ],
      answer: { row: 4, col: 6 },
      timeLimit: 60
    },
    {
      title: "打劫应对",
      stones: [
        { row: 4, col: 4, color: "black" },
        { row: 4, col: 5, color: "white" },
        { row: 5, col: 4, color: "white" },
        { row: 5, col: 5, color: "black" },
        { row: 3, col: 4, color: "white" }
      ],
      answer: { row: 5, col: 3 },
      timeLimit: 55
    },
    {
      title: "金鸡独立",
      stones: [
        { row: 3, col: 4, color: "white" },
        { row: 4, col: 4, color: "white" },
        { row: 5, col: 4, color: "white" },
        { row: 4, col: 3, color: "black" },
        { row: 4, col: 5, color: "black" },
        { row: 3, col: 3, color: "black" },
        { row: 5, col: 5, color: "black" }
      ],
      answer: { row: 3, col: 5 },
      timeLimit: 70
    }
  ],
  3: [ // 高级残局
    {
      title: "倒扑",
      stones: [
        { row: 3, col: 3, color: "white" },
        { row: 3, col: 4, color: "white" },
        { row: 4, col: 3, color: "white" },
        { row: 5, col: 4, color: "white" },
        { row: 4, col: 5, color: "black" },
        { row: 5, col: 5, color: "black" },
        { row: 5, col: 3, color: "black" },
        { row: 6, col: 4, color: "black" }
      ],
      answer: { row: 4, col: 4 },
      timeLimit: 60
    },
    {
      title: "盘角曲四",
      stones: [
        { row: 6, col: 6, color: "white" },
        { row: 6, col: 7, color: "white" },
        { row: 7, col: 6, color: "white" },
        { row: 7, col: 7, color: "white" },
        { row: 5, col: 6, color: "black" },
        { row: 5, col: 7, color: "black" },
        { row: 6, col: 5, color: "black" },
        { row: 7, col: 5, color: "black" },
        { row: 8, col: 6, color: "black" },
        { row: 8, col: 7, color: "black" }
      ],
      answer: { row: 8, col: 8 },
      timeLimit: 80
    },
    {
      title: "老鼠偷油",
      stones: [
        { row: 3, col: 4, color: "white" },
        { row: 4, col: 4, color: "white" },
        { row: 4, col: 3, color: "white" },
        { row: 4, col: 5, color: "white" },
        { row: 5, col: 4, color: "black" },
        { row: 3, col: 3, color: "black" },
        { row: 3, col: 5, color: "black" },
        { row: 5, col: 3, color: "black" }
      ],
      answer: { row: 5, col: 5 },
      timeLimit: 90
    }
  ]
};

function startEndgameChallenge() {
  const level = parseInt(DOM.endgameLevelSelect.value);
  const puzzles = endgamePuzzles[level] || endgamePuzzles[1];
  const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];

  // 重置残局状态
  state.endgameLives = 3;
  state.endgameCombo = 0;
  state.endgameScore = 0;
  state.endgameTimer = randomPuzzle.timeLimit;
  state.endgameLevel = level;
  state.endgameActive = true;
  state.endgameCurrentPuzzle = randomPuzzle;

  // 重置棋盘并加载残局
  resetBoard();
  randomPuzzle.stones.forEach((stone) => {
    const stoneEl = document.createElement("div");
    stoneEl.className = `stone-piece ${stone.color}`;
    stoneEl.setAttribute("aria-hidden", "true");
    stoneEl.dataset.row = stone.row;
    stoneEl.dataset.col = stone.col;
    stoneEl.style.animation = "none";
    stoneEl.style.transform = "translate(-50%, -50%) scale(1)";
    const cellSize = DOM.board.clientWidth / boardSize;
    stoneEl.style.left = `${cellSize * stone.col + cellSize / 2}px`;
    stoneEl.style.top = `${cellSize * stone.row + cellSize / 2}px`;
    DOM.board.appendChild(stoneEl);
    state.board[stone.row][stone.col] = stone.color;
  });
  updateScoreLine();

  // 更新UI
  DOM.endgameText.textContent = `挑战：${randomPuzzle.title}`;
  updateEndgameStats();
  DOM.startEndgameBtn.disabled = true;
  DOM.giveUpEndgameBtn.disabled = false;

  speak(`残局挑战开始！${randomPuzzle.title}，限时${randomPuzzle.timeLimit}秒！`);

  // 启动计时器
  startEndgameTimer();
}

function startEndgameTimer() {
  if (state.endgameTimerInterval) {
    clearInterval(state.endgameTimerInterval);
  }

  state.endgameTimerInterval = setInterval(() => {
    state.endgameTimer--;

    if (state.endgameTimer <= 10) {
      DOM.endgameTimerEl.classList.add("endgame-timer-warning");
    }

    if (state.endgameTimer <= 0) {
      handleEndgameTimeout();
    }

    updateEndgameStats();
  }, 1000);
}

function handleEndgameTimeout() {
  state.endgameLives--;
  state.endgameCombo = 0;

  if (state.endgameLives <= 0) {
    endEndgameChallenge();
    speak("时间到！残局挑战结束。");
  } else {
    speak("时间到！失去一条生命，继续加油！");
    // 重新加载当前残局
    const currentPuzzle = state.endgameCurrentPuzzle;
    resetBoard();
    currentPuzzle.stones.forEach((stone) => {
      const stoneEl = document.createElement("div");
      stoneEl.className = `stone-piece ${stone.color}`;
      stoneEl.setAttribute("aria-hidden", "true");
      stoneEl.dataset.row = stone.row;
      stoneEl.dataset.col = stone.col;
      stoneEl.style.animation = "none";
      stoneEl.style.transform = "translate(-50%, -50%) scale(1)";
      const cellSize = DOM.board.clientWidth / boardSize;
      stoneEl.style.left = `${cellSize * stone.col + cellSize / 2}px`;
      stoneEl.style.top = `${cellSize * stone.row + cellSize / 2}px`;
      DOM.board.appendChild(stoneEl);
      state.board[stone.row][stone.col] = stone.color;
    });
    updateScoreLine();
    state.endgameTimer = currentPuzzle.timeLimit;
  }

  updateEndgameStats();
}

function checkEndgameAnswer(row, col) {
  if (!state.endgameActive) return;

  const puzzle = state.endgameCurrentPuzzle;
  const isCorrect = puzzle.answer.row === row && puzzle.answer.col === col;

  if (isCorrect) {
    // 答对
    state.endgameCombo++;
    const baseScore = 100;
    const comboBonus = Math.min(state.endgameCombo * 20, 100);
    const timeBonus = Math.floor(state.endgameTimer * 2);
    const totalScore = baseScore + comboBonus + timeBonus;

    state.endgameScore += totalScore;
    state.stars += Math.floor(totalScore / 50);

    playPuzzleCorrectSound();
    vibrateWin();

    if (state.endgameCombo >= 3) {
      DOM.endgameComboEl.classList.add("endgame-combo-bonus");
      setTimeout(() => DOM.endgameComboEl.classList.remove("endgame-combo-bonus"), 600);
    }

    speak(`太棒了！+${totalScore}分！连击${state.endgameCombo}！`);

    // 加载下一题
    const level = state.endgameLevel;
    const puzzles = endgamePuzzles[level];
    const nextPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    state.endgameCurrentPuzzle = nextPuzzle;

    resetBoard();
    nextPuzzle.stones.forEach((stone) => {
      const stoneEl = document.createElement("div");
      stoneEl.className = `stone-piece ${stone.color}`;
      stoneEl.setAttribute("aria-hidden", "true");
      stoneEl.dataset.row = stone.row;
      stoneEl.dataset.col = stone.col;
      stoneEl.style.animation = "none";
      stoneEl.style.transform = "translate(-50%, -50%) scale(1)";
      const cellSize = DOM.board.clientWidth / boardSize;
      stoneEl.style.left = `${cellSize * stone.col + cellSize / 2}px`;
      stoneEl.style.top = `${cellSize * stone.row + cellSize / 2}px`;
      DOM.board.appendChild(stoneEl);
      state.board[stone.row][stone.col] = stone.color;
    });
    updateScoreLine();

    DOM.endgameText.textContent = `挑战：${nextPuzzle.title}`;
    state.endgameTimer = nextPuzzle.timeLimit;
  } else {
    // 答错
    state.endgameLives--;
    state.endgameCombo = 0;
    state.currentStreak = 0;

    playErrorSound();
    vibrate([30, 50, 30]);
    showMoveHint(row, col, "不对哦，再想想！");

    if (state.endgameLives <= 0) {
      endEndgameChallenge();
      speak("挑战失败！下次继续努力！");
    } else {
      speak(`答错了！还有${state.endgameLives}条命。`);
    }
  }

  updateEndgameStats();
  updateProgress();
  saveState();
}

function updateEndgameStats() {
  const livesDisplay = "❤️".repeat(state.endgameLives) + "🖤".repeat(3 - state.endgameLives);
  DOM.endgameLivesEl.textContent = livesDisplay;
  DOM.endgameComboEl.textContent = state.endgameCombo;
  DOM.endgameScoreEl.textContent = state.endgameScore;
  DOM.endgameTimerEl.textContent = `${state.endgameTimer}s`;

  if (state.endgameTimer > 10) {
    DOM.endgameTimerEl.classList.remove("endgame-timer-warning");
  }
}

function endEndgameChallenge() {
  state.endgameActive = false;

  if (state.endgameTimerInterval) {
    clearInterval(state.endgameTimerInterval);
    state.endgameTimerInterval = null;
  }

  DOM.startEndgameBtn.disabled = false;
  DOM.giveUpEndgameBtn.disabled = true;
  DOM.endgameText.textContent = "准备好挑战高难度残局了吗？";

  // 保存最高分
  const savedHighScore = localStorage.getItem("foxai-endgame-highscore") || 0;
  if (state.endgameScore > savedHighScore) {
    localStorage.setItem("foxai-endgame-highscore", state.endgameScore);
    speak(`新纪录！得分${state.endgameScore}分！`);
  }

  resetBoard();
  updateEndgameStats();
  saveState();
}

function giveUpEndgame() {
  if (state.endgameActive) {
    endEndgameChallenge();
    speak("放弃了？下次继续加油！");
  }
}

function updatePuzzleLevels() {
  DOM.puzzleLevelSelect.innerHTML = "";
  puzzleData.levels.forEach((level, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${level.name}（${level.puzzles.length}题）`;
    DOM.puzzleLevelSelect.appendChild(option);
  });
  DOM.puzzleLevelSelect.value = String(state.puzzleLevel || 0);
}

async function loadPuzzleData() {
  try {
    const response = await fetch("./puzzles.json");
    if (!response.ok) {
      throw new Error("Failed to load puzzles");
    }
    puzzleData = await response.json();
  } catch (error) {
    puzzleData = fallbackPuzzleData;
  }
  updatePuzzleLevels();
}

function openReview() {
  if (!state.reviewData) {
    state.reviewData = calculateScoreDetailed(state.board);
  }
  DOM.reviewModal.classList.add("active");
  DOM.reviewModal.setAttribute("aria-hidden", "false");
  const score = state.reviewData;
  DOM.reviewSummary.textContent = `黑 ${score.totalBlack} · 白 ${score.totalWhite}`;
  DOM.reviewDetail.textContent = `黑子 ${score.blackStones} + 黑地 ${score.blackTerritory} | 白子 ${score.whiteStones} + 白地 ${score.whiteTerritory}`;
  renderReviewBoard(score.map, score.board);
}

function closeReview() {
  DOM.reviewModal.classList.remove("active");
  DOM.reviewModal.setAttribute("aria-hidden", "true");
}

function renderReviewBoard(map, boardData) {
  DOM.reviewBoard.innerHTML = "";
  const fragment = document.createDocumentFragment();
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      const cell = document.createElement("div");
      cell.className = `review-cell territory-${map[row][col]}`;
      cell.setAttribute("aria-label", `位置 ${row + 1}行 ${col + 1}列`);
      const stone = boardData[row][col];
      if (stone) {
        const piece = document.createElement("div");
        piece.className = `review-stone ${stone}`;
        piece.setAttribute("aria-hidden", "true");
        cell.appendChild(piece);
      }
      fragment.appendChild(cell);
    }
  }
  DOM.reviewBoard.appendChild(fragment);
}

function bindActions() {
  document.getElementById("undoBtn").addEventListener("click", undoMove);

  // 音效开关按钮
  document.getElementById("soundToggle").addEventListener("click", toggleSound);

  // 快捷操作面板
  document.getElementById("quickActionsToggle").addEventListener("click", toggleQuickActions);
  document.getElementById("quickUndo").addEventListener("click", undoMove);
  document.getElementById("quickReset").addEventListener("click", resetBoard);
  document.getElementById("quickHint").addEventListener("click", () => {
    const hint = generateAISuggestion(calculateScoreDetailed(state.board), 0);
    speak(hint);
    updateChallengeProgress("hints", 1);
  });
  document.getElementById("quickPass").addEventListener("click", () => {
    if (state.currentMode === "puzzle") {
      const level = puzzleData.levels[state.puzzleLevel] || puzzleData.levels[0];
      state.puzzleIndex = (state.puzzleIndex + 1) % level.puzzles.length;
      loadPuzzle(state.puzzleIndex);
      return;
    }
    if (state.currentMode === "endgame") {
      speak("残局挑战不能跳过哦！");
      return;
    }
    state.passCount += 1;
    if (state.passCount >= 2) {
      endGame();
      return;
    }
    makeAiMove(state.aiLevel);
  });
  document.getElementById("quickSave").addEventListener("click", saveGameProgress);
  document.getElementById("quickHistory").addEventListener("click", openGameHistory);
  document.getElementById("closeHistoryBtn").addEventListener("click", closeGameHistory);

  document.getElementById("coachBtn").addEventListener("click", () => {
    const line = coachLines[Math.floor(Math.random() * coachLines.length)];
    DOM.coachLine.textContent = line;
    speak(line);
  });

  document.getElementById("resetBtn").addEventListener("click", resetBoard);

  document.getElementById("passBtn").addEventListener("click", () => {
    if (state.currentMode === "puzzle") {
      const level = puzzleData.levels[state.puzzleLevel] || puzzleData.levels[0];
      state.puzzleIndex = (state.puzzleIndex + 1) % level.puzzles.length;
      loadPuzzle(state.puzzleIndex);
      return;
    }
    if (state.currentMode === "endgame") {
      speak("残局挑战不能跳过哦！");
      return;
    }
    state.passCount += 1;
    if (state.passCount >= 2) {
      endGame();
      return;
    }
    makeAiMove(state.aiLevel);
  });

  document.getElementById("rewardBtn").addEventListener("click", openRewardGame);

  document.getElementById("reviewBtn").addEventListener("click", () => {
    openReview();
  });

  document
    .getElementById("closeRewardBtn")
    .addEventListener("click", closeRewardGame);

  document
    .getElementById("closeReviewBtn")
    .addEventListener("click", closeReview);

  document.querySelectorAll(".tab-btn").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((node) => node.classList.remove("active"));
      tab.classList.add("active");
      const game = tab.dataset.game;
      if (game === "memory") {
        DOM.rewardTitle.textContent = "连连乐";
        DOM.rewardSubtitle.textContent = "翻开两张一样的牌，收集星星奖励。";
        buildMemoryGame();
      } else {
        DOM.rewardTitle.textContent = "星星捕捉";
        DOM.rewardSubtitle.textContent = "点亮 5 颗星星，解锁小狐狸贴纸！";
        buildStarGame();
      }
    });
  });

  document.getElementById("nextPuzzleBtn").addEventListener("click", () => {
    const level = puzzleData.levels[state.puzzleLevel] || puzzleData.levels[0];
    state.puzzleIndex = (state.puzzleIndex + 1) % level.puzzles.length;
    loadPuzzle(state.puzzleIndex);
  });

  document.getElementById("prevPuzzleBtn").addEventListener("click", () => {
    const level = puzzleData.levels[state.puzzleLevel] || puzzleData.levels[0];
    state.puzzleIndex =
      (state.puzzleIndex - 1 + level.puzzles.length) % level.puzzles.length;
    loadPuzzle(state.puzzleIndex);
  });

  DOM.puzzleLevelSelect.addEventListener("change", (event) => {
    state.puzzleLevel = Number(event.target.value);
    state.puzzleIndex = 0;
    saveState();
    if (state.currentMode === "puzzle") {
      loadPuzzle(state.puzzleIndex);
    }
  });

  DOM.puzzleFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.levels || !Array.isArray(data.levels)) {
          throw new Error("invalid puzzle data");
        }
        puzzleData = data;
        updatePuzzleLevels();
        state.puzzleLevel = 0;
        state.puzzleIndex = 0;
        saveState();
        if (state.currentMode === "puzzle") {
          loadPuzzle(state.puzzleIndex);
        }
        speak("题库导入成功！");
      } catch (error) {
        speak("题库导入失败，请检查格式。");
      }
    };
    reader.readAsText(file);
  });

  DOM.aiLevelSelect.addEventListener("change", (event) => {
    state.aiLevel = Number(event.target.value);
    saveState();
  });

  document.querySelectorAll(".mode-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document
        .querySelectorAll(".mode-chip")
        .forEach((node) => node.classList.remove("active"));
      chip.classList.add("active");
      const mode = chip.dataset.mode;
      setMode(mode);
    });
  });

  // Keyboard navigation support
  document.addEventListener("keydown", (event) => {
    // Escape to close modals
    if (event.key === "Escape") {
      if (DOM.rewardModal.classList.contains("active")) {
        closeRewardGame();
      }
      if (DOM.reviewModal.classList.contains("active")) {
        closeReview();
      }
      if (document.getElementById("tutorialModal")?.classList.contains("active")) {
        closeTutorial();
      }
      if (document.getElementById("historyModal")?.classList.contains("active")) {
        closeGameHistory();
      }
      if (document.getElementById("analyzeModal")?.classList.contains("active")) {
        closeAnalyze();
      }
      if (document.getElementById("replayModal")?.classList.contains("active")) {
        closeReplay();
      }
      if (document.getElementById("shareModal")?.classList.contains("active")) {
        closeShareModal();
      }

      // Close quick actions menu if open
      if (quickActionsOpen) {
        toggleQuickActions();
      }
      return;
    }

    // Shortcuts when no modal is active
    if (!DOM.rewardModal.classList.contains("active") &&
        !DOM.reviewModal.classList.contains("active") &&
        !document.getElementById("tutorialModal")?.classList.contains("active") &&
        !document.getElementById("historyModal")?.classList.contains("active") &&
        !document.getElementById("analyzeModal")?.classList.contains("active") &&
        !document.getElementById("replayModal")?.classList.contains("active") &&
        !document.getElementById("shareModal")?.classList.contains("active")) {
      switch(event.key.toLowerCase()) {
        case 'z':
        case 'u':
          // Ctrl+Z or U to undo
          if (event.ctrlKey || event.key.toLowerCase() === 'u') {
            event.preventDefault();
            undoMove();
          }
          break;
        case 'r':
          // R to reset
          event.preventDefault();
          resetBoard();
          break;
        case 'h':
          // H for hint
          event.preventDefault();
          const hint = generateAISuggestion(calculateScoreDetailed(state.board), 0);
          speak(hint);
          break;
        case 'p':
        case ' ':
          // P or Space to pass
          event.preventDefault();
          document.getElementById("passBtn").click();
          break;
        case 't':
          // T for tutorial
          event.preventDefault();
          openTutorial();
          break;
        case 's':
          // S to save game
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            saveGameProgress();
          }
          break;
        case 'o':
          // O to open history
          event.preventDefault();
          openGameHistory();
          break;
        case 'a':
          // A to analyze position
          event.preventDefault();
          openAnalyze();
          break;
        case 'q':
          // Q to toggle quick actions menu
          event.preventDefault();
          toggleQuickActions();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          // Number keys to change AI level
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const level = parseInt(event.key);
            DOM.aiLevelSelect.value = level;
            state.aiLevel = level;
            speak(`AI难度已设置为 ${level} 级`);
          }
          break;
        case '?':
          // ? for help
          event.preventDefault();
          const helpText = `
            快捷键说明：
            Z 或 U - 撤销上一步
            R - 重新开始
            H - 获取提示
            P 或 空格 - 跳过
            T - 打开教程
            S - 保存游戏
            O - 打开历史
            A - 形势分析
            Q - 快捷菜单
            Esc - 关闭弹窗
            Ctrl+数字 - 设置AI难度
          `;
          speak(helpText);
          break;
      }
    }

    // Arrow keys for replay control
    if (document.getElementById("replayModal")?.classList.contains("active")) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        replayStepBack();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        replayStepForward();
      } else if (event.key === " ") {
        event.preventDefault();
        toggleReplayPlay();
      }
    }
  });

  // Tutorial button
  document.getElementById("tutorialBtn").addEventListener("click", openTutorial);
  document.getElementById("skipTutorialBtn").addEventListener("click", closeTutorial);
  document.getElementById("nextTutorialBtn").addEventListener("click", nextTutorialStep);

  // Replay and export buttons
  document.getElementById("replayBtn").addEventListener("click", openReplay);
  document.getElementById("exportBtn").addEventListener("click", exportGameRecord);
  document.getElementById("importBtn").addEventListener("click", importGameRecord);
  document.getElementById("analyzeBtn").addEventListener("click", openAnalyze);
  document.getElementById("shareBtn").addEventListener("click", openShareModal);
  document.getElementById("closeShareBtn").addEventListener("click", closeShareModal);
  document.getElementById("closeShareBtn2").addEventListener("click", closeShareModal);
  document.getElementById("copyShareUrlBtn").addEventListener("click", copyShareUrl);
  document.getElementById("copyShareCodeBtn").addEventListener("click", copyShareCode);
  DOM.sgfFileInput.addEventListener("change", handleSGFFileSelect);
  document.getElementById("closeReplayBtn").addEventListener("click", closeReplay);
  DOM.closeAnalyzeBtn.addEventListener("click", closeAnalyze);

  // Replay controls
  document.getElementById("replayFirstBtn").addEventListener("click", () => replayGoTo(0));
  document.getElementById("replayPrevBtn").addEventListener("click", replayStepBack);
  document.getElementById("replayPlayBtn").addEventListener("click", toggleReplayPlay);
  document.getElementById("replayNextBtn").addEventListener("click", replayStepForward);
  document.getElementById("replayLastBtn").addEventListener("click", () => replayGoTo(state.moveHistory.length));

  // Replay comment system
  document.getElementById("replayCommentBtn").addEventListener("click", openCommentPanel);
  document.getElementById("closeCommentPanel").addEventListener("click", closeCommentPanel);
  document.getElementById("submitCommentBtn").addEventListener("click", addComment);

  // Endgame challenge buttons
  DOM.startEndgameBtn.addEventListener("click", startEndgameChallenge);
  DOM.giveUpEndgameBtn.addEventListener("click", giveUpEndgame);
  DOM.endgameLevelSelect.addEventListener("change", (event) => {
    state.endgameLevel = Number(event.target.value);
    saveState();
  });

  // 棋盘尺寸选择
  DOM.boardSizeSelect.addEventListener("change", (event) => {
    changeBoardSize(event.target.value);
  });

  // Update hint button for endgame mode
  document.getElementById("hintBtn").addEventListener("click", () => {
    if (state.currentMode === "endgame" && state.endgameActive) {
      const puzzle = state.endgameCurrentPuzzle;
      const hintRow = puzzle.answer.row + 1;
      const hintCol = puzzle.answer.col + 1;
      speak(`提示：试试在第 ${hintRow} 行，第 ${hintCol} 列下子。`);
    } else if (state.currentMode === "puzzle") {
      showPuzzleHint();
    } else {
      const line = coachLines[Math.floor(Math.random() * coachLines.length)];
      speak(line);
    }
  });

  // 家长监控面板按钮
  document.getElementById("parentDashboardToggle").addEventListener("click", openParentDashboard);
  document.getElementById("closeParentDashboardBtn").addEventListener("click", closeParentDashboard);
}

// ========== 教学系统 ==========
const tutorialSteps = [
  {
    title: "什么是围棋？",
    content: `<p>围棋是一个两人对弈的策略游戏。歪歪执黑先下，小狐狸执白后下。</p>
      <div class="tutorial-tip">
        <span class="tip-icon">💡</span>
        <span>目标：围住更多的地盘，保护自己的棋子不被吃掉。</span>
      </div>`,
  },
  {
    title: "如何落子？",
    content: `<p>点击棋盘上的交叉点就可以落子。黑子先下，然后白子下，轮流进行。</p>
      <div class="tutorial-tip">
        <span class="tip-icon">🎯</span>
        <span>提示：棋子下在线的交叉点上，不是格子里哦！</span>
      </div>`,
  },
  {
    title: "什么是气？",
    content: `<p>棋子上下左右相邻的空点叫做"气"。气越多，棋子越安全。</p>
      <div class="tutorial-tip">
        <span class="tip-icon">🫧</span>
        <span>记住：当一颗棋子没有气时，就会被吃掉提走。</span>
      </div>`,
  },
  {
    title: "如何吃子？",
    content: `<p>围住对方的棋子，让它没有气，就可以把它提走。这是围棋最重要的技巧！</p>
      <div class="tutorial-tip">
        <span class="tip-icon">⭐</span>
        <span>练习：尝试用黑子把白子完全包围住。</span>
      </div>`,
  },
  {
    title: "准备开始！",
    content: `<p>歪歪，现在你已经了解了围棋的基本规则。让我们开始练习吧！</p>
      <div class="tutorial-tip">
        <span class="tip-icon">🎮</span>
        <span>选择"启蒙课"开始练习，或者"题库闯关"挑战死活题。</span>
      </div>`,
  },
];

let currentTutorialStep = 0;

function openTutorial() {
  currentTutorialStep = 0;
  updateTutorialContent();
  document.getElementById("tutorialModal").classList.add("active");
  document.getElementById("tutorialModal").setAttribute("aria-hidden", "false");
}

function closeTutorial() {
  document.getElementById("tutorialModal").classList.remove("active");
  document.getElementById("tutorialModal").setAttribute("aria-hidden", "true");
}

function nextTutorialStep() {
  currentTutorialStep++;
  if (currentTutorialStep >= tutorialSteps.length) {
    // Mark tutorial as complete
    state.achievements.tutorialComplete = true;
    saveState();
    checkAchievements();
    closeTutorial();
    speak("歪歪，准备好开始下棋了吗？");
  } else {
    updateTutorialContent();
  }
}

function updateTutorialContent() {
  const step = tutorialSteps[currentTutorialStep];
  const contentEl = document.getElementById("tutorialContent");
  contentEl.innerHTML = `<h3>${step.title}</h3>${step.content}`;
  document.getElementById("tutorialStep").textContent = currentTutorialStep + 1;
  document.getElementById("tutorialTotal").textContent = tutorialSteps.length;

  const nextBtn = document.getElementById("nextTutorialBtn");
  if (currentTutorialStep === tutorialSteps.length - 1) {
    nextBtn.textContent = "开始游戏";
  } else {
    nextBtn.textContent = "下一步";
  }

  speak(step.title);
}

function init() {
  buildBoard();
  loadState();
  state.currentBoardString = boardToString(state.board);
  bindActions();
  loadPuzzleData().then(() => {
    document.querySelectorAll(".mode-chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.mode === state.currentMode);
    });
    setMode(state.currentMode);
  });

  // Add loading indicator
  console.log("围棋乐园已启动 | Go Learning Garden initialized");
}

// ========== 棋谱回放系统 ==========
let replayState = {
  currentStep: 0,
  isPlaying: false,
  playInterval: null,
  playSpeed: 1000 // 1秒每步
};

function openReplay() {
  if (state.moveHistory.length === 0) {
    speak("还没有下棋呢，先下一局吧！");
    return;
  }

  replayState.currentStep = 0;
  replayState.isPlaying = false;
  updateReplayBoard();
  updateReplayInfo();

  document.getElementById("replayModal").classList.add("active");
  document.getElementById("replayModal").setAttribute("aria-hidden", "false");
  document.getElementById("replayTotal").textContent = state.moveHistory.length;
}

function closeReplay() {
  if (replayState.playInterval) {
    clearInterval(replayState.playInterval);
    replayState.playInterval = null;
  }
  replayState.isPlaying = false;
  updateReplayPlayButton();

  document.getElementById("replayModal").classList.remove("active");
  document.getElementById("replayModal").setAttribute("aria-hidden", "true");
}

function updateReplayBoard() {
  const replayBoard = document.getElementById("replayBoard");
  replayBoard.innerHTML = "";

  const fragment = document.createDocumentFragment();

  // Create grid cells
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement("div");
      cell.className = "replay-cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      fragment.appendChild(cell);
    }
  }

  // Build board up to current step
  const tempBoard = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => null)
  );

  for (let i = 0; i < replayState.currentStep; i++) {
    const move = state.moveHistory[i];
    tempBoard[move.row][move.col] = move.color;
  }

  // Place stones on board
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (tempBoard[row][col]) {
        const cellIndex = row * boardSize + col;
        const cell = fragment.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
          const stone = document.createElement("div");
          stone.className = `replay-stone ${tempBoard[row][col]}`;
          // Mark last move
          if (replayState.currentStep > 0) {
            const lastMove = state.moveHistory[replayState.currentStep - 1];
            if (lastMove.row === row && lastMove.col === col) {
              stone.classList.add("last-move");
            }
          }
          cell.appendChild(stone);
        }
      }
    }
  }

  replayBoard.appendChild(fragment);
}

function updateReplayInfo() {
  document.getElementById("replayStep").textContent = replayState.currentStep;

  const playerEl = document.getElementById("replayPlayer");
  if (replayState.currentStep < state.moveHistory.length) {
    const nextMove = state.moveHistory[replayState.currentStep];
    playerEl.textContent = nextMove.color === "black" ? "黑方落子" : "白方落子";
  } else {
    playerEl.textContent = "对局结束";
  }
}

function updateReplayPlayButton() {
  const btn = document.getElementById("replayPlayBtn");
  btn.textContent = replayState.isPlaying ? "⏸" : "▶";
  btn.title = replayState.isPlaying ? "暂停" : "播放";
}

function replayStepForward() {
  if (replayState.currentStep < state.moveHistory.length) {
    replayState.currentStep++;
    updateReplayBoard();
    updateReplayInfo();

    // Play stone sound
    if (replayState.currentStep > 0) {
      const move = state.moveHistory[replayState.currentStep - 1];
      playStoneSound();
    }
  }
}

function replayStepBack() {
  if (replayState.currentStep > 0) {
    replayState.currentStep--;
    updateReplayBoard();
    updateReplayInfo();
  }
}

function replayGoTo(step) {
  replayState.currentStep = Math.max(0, Math.min(step, state.moveHistory.length));
  updateReplayBoard();
  updateReplayInfo();
}

function toggleReplayPlay() {
  replayState.isPlaying = !replayState.isPlaying;
  updateReplayPlayButton();

  if (replayState.isPlaying) {
    // Auto play from current position
    if (replayState.currentStep >= state.moveHistory.length) {
      replayState.currentStep = 0;
      updateReplayBoard();
    }

    replayState.playInterval = setInterval(() => {
      if (replayState.currentStep >= state.moveHistory.length) {
        // Reached end, stop playing
        clearInterval(replayState.playInterval);
        replayState.playInterval = null;
        replayState.isPlaying = false;
        updateReplayPlayButton();
        speak("回放结束");
      } else {
        replayStepForward();
      }
    }, replayState.playSpeed);
  } else {
    // Pause
    if (replayState.playInterval) {
      clearInterval(replayState.playInterval);
      replayState.playInterval = null;
    }
  }
}

// ========== 棋谱评论标注系统 ==========

const GAME_COMMENTS_KEY = "foxai-game-comments";
let gameComments = {}; // 存储当前游戏的评论 { moveNumber: { text, mark, timestamp } }

/**
 * 加载游戏评论
 */
function loadGameComments() {
  try {
    const saved = localStorage.getItem(GAME_COMMENTS_KEY);
    if (saved) {
      gameComments = JSON.parse(saved);
    }
  } catch (error) {
    console.error("加载评论失败:", error);
    gameComments = {};
  }
}

/**
 * 保存游戏评论
 */
function saveGameComments() {
  try {
    localStorage.setItem(GAME_COMMENTS_KEY, JSON.stringify(gameComments));
  } catch (error) {
    console.error("保存评论失败:", error);
  }
}

/**
 * 打开评论面板
 */
function openCommentPanel() {
  const panel = document.getElementById("replayCommentPanel");
  if (panel) {
    panel.classList.add("active");
    renderCommentList();
  }
}

/**
 * 关闭评论面板
 */
function closeCommentPanel() {
  const panel = document.getElementById("replayCommentPanel");
  if (panel) {
    panel.classList.remove("active");
  }
}

/**
 * 渲染评论列表
 */
function renderCommentList() {
  const listEl = document.getElementById("replayCommentList");
  if (!listEl) return;

  const comments = Object.entries(gameComments)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

  if (comments.length === 0) {
    listEl.innerHTML = `
      <div class="replay-comment-empty">
        <span>还没有评论</span>
        <p>为精彩的对局添加你的见解吧！</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = comments.map(([moveNum, comment]) => {
    const markIcons = {
      good: "✓",
      bad: "✗",
      question: "?",
      critical: "!"
    };
    const markClass = comment.mark || "";
    const markIcon = comment.mark ? markIcons[comment.mark] : "";

    return `
      <div class="replay-comment-item ${markClass}" data-move="${moveNum}">
        <div class="replay-comment-header-row">
          <span class="replay-comment-move">第 ${moveNum} 手</span>
          ${comment.mark ? `<span class="replay-comment-mark-icon">${markIcon}</span>` : ""}
          <button class="replay-comment-delete" data-move="${moveNum}">🗑</button>
        </div>
        <div class="replay-comment-text">${comment.text}</div>
        <div class="replay-comment-meta">
          <span class="replay-comment-time">${formatCommentTime(comment.timestamp)}</span>
          <button class="replay-comment-jump" data-move="${moveNum}">跳转到此手</button>
        </div>
      </div>
    `;
  }).join("");

  // 绑定删除和跳转事件
  listEl.querySelectorAll(".replay-comment-delete").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const moveNum = e.target.dataset.move;
      deleteComment(moveNum);
    });
  });

  listEl.querySelectorAll(".replay-comment-jump").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const moveNum = parseInt(e.target.dataset.move);
      replayGoTo(moveNum);
    });
  });
}

/**
 * 添加评论
 */
function addComment() {
  const inputEl = document.getElementById("replayCommentInput");
  const markEl = document.getElementById("replayCommentMark");

  const text = inputEl.value.trim();
  const mark = markEl.value;

  if (!text && !mark) {
    speak("请输入评论内容或选择标记");
    return;
  }

  const moveNum = replayState.currentStep;
  gameComments[moveNum] = {
    text: text || "",
    mark: mark || "",
    timestamp: Date.now()
  };

  saveGameComments();
  renderCommentList();

  // 清空输入
  inputEl.value = "";
  markEl.value = "";

  speak("评论已添加");

  // 在回放信息中显示评论提示
  updateReplayInfo();
}

/**
 * 删除评论
 */
function deleteComment(moveNum) {
  if (confirm(`确定要删除第 ${moveNum} 手的评论吗？`)) {
    delete gameComments[moveNum];
    saveGameComments();
    renderCommentList();
    updateReplayInfo();
    speak("评论已删除");
  }
}

/**
 * 格式化评论时间
 */
function formatCommentTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) {
    return "刚刚";
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`;
  } else {
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
}

/**
 * 检查当前步是否有评论
 */
function hasCommentAtMove(moveNum) {
  return gameComments[moveNum] !== undefined;
}

/**
 * 获取当前步的评论
 */
function getCommentAtMove(moveNum) {
  return gameComments[moveNum] || null;
}

/**
 * 修改 updateReplayInfo 函数以显示评论提示
 */
const originalUpdateReplayInfo = updateReplayInfo;
updateReplayInfo = function() {
  // 调用原函数
  originalUpdateReplayInfo();

  // 添加评论提示
  const playerEl = document.getElementById("replayPlayer");
  if (playerEl && hasCommentAtMove(replayState.currentStep)) {
    const comment = getCommentAtMove(replayState.currentStep);
    const markIcons = { good: "✓", bad: "✗", question: "?", critical: "!" };
    const markIcon = comment.mark ? markIcons[comment.mark] : "";
    playerEl.innerHTML = `
      ${playerEl.textContent}
      <span class="replay-has-comment" title="有评论: ${comment.text}">💬${markIcon}</span>
    `;
  }
};

function exportGameRecord() {
  if (state.moveHistory.length === 0) {
    speak("还没有下棋呢，先下一局吧！");
    return;
  }

  // Create SGF-like record
  const record = {
    date: new Date().toISOString(),
    boardSize: boardSize,
    moves: state.moveHistory,
    result: `${state.wins > 0 ? '黑胜' : '对局中'}`
  };

  // Convert to text format
  let sgf = "(;GM[1]FF[4]CA[UTF-8]\n";
  sgf += `AP[围棋乐园]\n`;
  sgf += `DT[${new Date().toLocaleDateString()}]\n`;
  sgf += `SZ[${boardSize}]\n`;

  state.moveHistory.forEach((move, index) => {
    const color = move.color === "black" ? "B" : "W";
    const col = String.fromCharCode(97 + move.col); // a, b, c...
    const row = String.fromCharCode(97 + move.row);
    sgf += `;${color}[${col}${row}]`;
  });

  sgf += ")";

  // Download as file
  const blob = new Blob([sgf], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `围棋棋谱_${new Date().toLocaleDateString().replace(/\//g, "-")}.sgf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  speak("棋谱已导出！");
}

// ========== SGF 棋谱导入系统 ==========

function importGameRecord() {
  DOM.sgfFileInput.click();
}

function parseSGF(sgfContent) {
  try {
    // 简单的 SGF 解析器
    const moves = [];
    const moveRegex = /;([BW])\[([a-z])([a-z])\]/g;
    let match;

    while ((match = moveRegex.exec(sgfContent)) !== null) {
      const color = match[1] === "B" ? "black" : "white";
      const col = match[2].charCodeAt(0) - 97; // 'a' = 0
      const row = match[3].charCodeAt(0) - 97;

      // 确保在棋盘范围内
      if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
        moves.push({ row, col, color });
      }
    }

    return moves;
  } catch (error) {
    console.error("SGF 解析错误:", error);
    return null;
  }
}

function loadGameFromSGF(moves) {
  if (!moves || moves.length === 0) {
    speak("棋谱文件中没有找到有效的棋步！");
    return false;
  }

  // 重置棋盘
  resetBoard();

  // 重新播放所有棋步
  moves.forEach((move) => {
    if (move.row >= 0 && move.row < boardSize && move.col >= 0 && move.col < boardSize) {
      state.board[move.row][move.col] = move.color;
      state.moveHistory.push(move);
    }
  });

  // 渲染所有棋子（无动画）
  moves.forEach((move) => {
    const stoneEl = document.createElement("div");
    stoneEl.className = `stone-piece ${move.color}`;
    stoneEl.setAttribute("aria-hidden", "true");
    stoneEl.dataset.row = move.row;
    stoneEl.dataset.col = move.col;
    stoneEl.style.animation = "none";
    stoneEl.style.transform = "translate(-50%, -50%) scale(1)";
    const cellSize = DOM.board.clientWidth / boardSize;
    stoneEl.style.left = `${cellSize * move.col + cellSize / 2}px`;
    stoneEl.style.top = `${cellSize * move.row + cellSize / 2}px`;
    DOM.board.appendChild(stoneEl);
  });

  // 标记最后一步
  if (moves.length > 0) {
    const lastMove = moves[moves.length - 1];
    markLastMove(lastMove.row, lastMove.col, lastMove.color);
  }

  updateScoreLine();
  return true;
}

function handleSGFFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const sgfContent = e.target.result;
    const moves = parseSGF(sgfContent);

    if (moves && moves.length > 0) {
      if (loadGameFromSGF(moves)) {
        speak(`成功导入 ${moves.length} 手棋谱！`);
        playWinSound();
      }
    } else {
      speak("棋谱文件格式不正确，无法导入。");
    }
  };

  reader.onerror = () => {
    speak("读取文件失败，请重试。");
  };

  reader.readAsText(file);

  // 清除文件选择，允许重复导入同一文件
  event.target.value = "";
}

// ========== 棋盘尺寸切换系统 ==========

function changeBoardSize(newSize) {
  const oldSize = boardSize;
  boardSize = parseInt(newSize);

  if (oldSize !== boardSize) {
    // 重建棋盘
    resetBoard();
    buildBoard();

    // 更新 CSS grid
    DOM.board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    DOM.board.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;

    speak(`棋盘已切换为 ${boardSize} × ${boardSize}！`);

    // 保存设置
    localStorage.setItem("foxai-board-size", boardSize);
  }
}

// ========== AI 形势分析系统 ==========

function openAnalyze() {
  if (state.moveHistory.length === 0) {
    speak("还没有下棋呢，先下一局吧！");
    return;
  }

  analyzePosition();
  DOM.analyzeModal.setAttribute("aria-hidden", "false");
  DOM.analyzeModal.style.display = "grid";
}

function closeAnalyze() {
  DOM.analyzeModal.setAttribute("aria-hidden", "true");
  DOM.analyzeModal.style.display = "none";
}

function analyzePosition() {
  const score = calculateScoreDetailed(state.board);
  const totalStones = score.totalBlack + score.totalWhite;
  const totalMoves = state.moveHistory.length;

  // 计算优势百分比
  const advantage = calculateAdvantage(score);
  const blackPercent = Math.max(0, Math.min(100, 50 + advantage * 50));
  const whitePercent = 100 - blackPercent;

  // 更新优势条
  setTimeout(() => {
    DOM.blackAdvantage.style.width = `${blackPercent}%`;
    DOM.whiteAdvantage.style.width = `${whitePercent}%`;
  }, 100);

  DOM.blackAdvantageValue.textContent = `${blackPercent.toFixed(1)}%`;
  DOM.whiteAdvantageValue.textContent = `${whitePercent.toFixed(1)}%`;

  // 更新详细指标
  DOM.blackStonesEl.textContent = score.blackStones;
  DOM.whiteStonesEl.textContent = score.whiteStones;
  DOM.blackTerritoryEl.textContent = score.blackTerritory;
  DOM.whiteTerritoryEl.textContent = score.whiteTerritory;
  DOM.totalMovesEl.textContent = totalMoves;

  // 生成 AI 建议
  const suggestion = generateAISuggestion(score, advantage);
  DOM.suggestionText.textContent = suggestion;
}

function calculateAdvantage(score) {
  // 简单的优势计算：考虑棋子数量和实地
  const blackTotal = score.blackStones + score.blackTerritory * 2;
  const whiteTotal = score.whiteStones + score.whiteTerritory * 2;
  const total = blackTotal + whiteTotal;

  if (total === 0) return 0;

  return (blackTotal - whiteTotal) / total;
}

function generateAISuggestion(score, advantage) {
  const totalMoves = state.moveHistory.length;
  const blackStones = score.blackStones;
  const whiteStones = score.whiteStones;

  let suggestion = "";

  if (totalMoves < 10) {
    suggestion = "对局刚刚开始，建议尽快占据角部和边上的星位，建立稳固的根基。注意保持棋子的连接，避免被对方分割。";
  } else if (Math.abs(advantage) < 0.1) {
    suggestion = "目前形势非常接近！双方都有机会。建议仔细观察对方的弱点，寻找可以扩大自己地盘或攻击对方薄弱棋子的机会。保持冷静，耐心等待最佳时机。";
  } else if (advantage > 0.3) {
    suggestion = "黑方目前优势明显！白方需要积极寻找反击机会，可以考虑打入黑方的实地，或者通过攻击黑方的薄弱棋子来扭转局势。";
  } else if (advantage < -0.3) {
    suggestion = "白方目前优势明显！黑方需要巩固防守，同时寻找白方的破绽。可以考虑在中腹进行战斗，或者尝试切断白方的联络。";
  } else if (advantage > 0) {
    suggestion = "黑方略占优势。继续保持稳健的下法，注意不要给白方反击的机会。可以考虑扩大优势，或者稳扎稳打巩固局面。";
  } else {
    suggestion = "白方略占优势。继续保持积极的下法，寻找进一步扩大优势的机会。同时注意防守，不要给黑方翻盘的机会。";
  }

  // 根据棋子数量添加具体建议
  if (blackStones > whiteStones + 3) {
    suggestion += " 黑方棋子较多，注意保持棋子的联络和活力。";
  } else if (whiteStones > blackStones + 3) {
    suggestion += " 白方棋子较多，利用兵力优势进行战斗。";
  }

  return suggestion;
}

function init() {
  // 加载保存的棋盘尺寸
  const savedBoardSize = localStorage.getItem("foxai-board-size");
  if (savedBoardSize) {
    boardSize = parseInt(savedBoardSize);
    DOM.boardSizeSelect.value = savedBoardSize;
  }

  buildBoard();
  loadState();
  state.currentBoardString = boardToString(state.board);

  // 初始化主题
  initTheme();

  // 初始化音效设置
  initSound();

  bindActions();
  loadPuzzleData().then(() => {
    document.querySelectorAll(".mode-chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.mode === state.currentMode);
    });
    setMode(state.currentMode);
  });

  // 启动自动保存
  startAutoSave();

  // 更新增强统计
  updateEnhancedStats();

  // 初始化每日挑战
  initDailyChallenges();

  // 初始化分享标签页
  initShareTabs();

  // 初始化学习路径推荐系统
  initLearningPathSystem();

  // 初始化棋谱评论系统
  loadGameComments();

  // Add loading indicator
  console.log("围棋乐园已启动 | Go Learning Garden initialized");
}

// ========== 主题切换系统 ==========

function initTheme() {
  // 从 localStorage 读取主题设置
  const savedTheme = localStorage.getItem("foxai-theme") || "light";
  setTheme(savedTheme);

  const themeToggleBtn = document.getElementById("themeToggle");
  if (themeToggleBtn && !themeToggleBtn.dataset.bound) {
    themeToggleBtn.addEventListener("click", toggleTheme);
    themeToggleBtn.dataset.bound = "true";
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("foxai-theme", theme);

  // 更新主题按钮图标
  const themeToggleBtn = document.getElementById("themeToggle");
  if (themeToggleBtn) {
    const icon = themeToggleBtn.querySelector("span");
    if (icon) {
      icon.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);

  // 添加过渡动画
  document.body.style.transition = "background 0.3s ease, color 0.3s ease";
  setTimeout(() => {
    document.body.style.transition = "";
  }, 300);
}

// ========== 音效控制系统 ==========

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem("foxai-sound-enabled", soundEnabled);

  // 更新按钮图标
  const icon = DOM.soundToggleBtn.querySelector("span");
  if (icon) {
    icon.textContent = soundEnabled ? "🔊" : "🔇";
  }

  speak(soundEnabled ? "音效已开启" : "音效已关闭");
}

function initSound() {
  // 从 localStorage 读取音效设置
  const savedSound = localStorage.getItem("foxai-sound-enabled");
  if (savedSound !== null) {
    soundEnabled = savedSound === "true";
  }

  // 更新按钮图标
  const icon = DOM.soundToggleBtn.querySelector("span");
  if (icon) {
    icon.textContent = soundEnabled ? "🔊" : "🔇";
  }
}

// ========== 快捷操作面板 ==========

let quickActionsOpen = false;

function toggleQuickActions() {
  quickActionsOpen = !quickActionsOpen;
  const menu = document.getElementById("quickActionsMenu");
  const toggle = document.getElementById("quickActionsToggle");

  if (quickActionsOpen) {
    menu.classList.add("active");
    toggle.classList.add("active");
    playSound("stone");
  } else {
    menu.classList.remove("active");
    toggle.classList.remove("active");
  }
}

// ========== 游戏进度保存系统 ==========

const GAME_HISTORY_KEY = "foxai-game-history";
const MAX_HISTORY_SIZE = 50;

function saveGameProgress() {
  const gameData = {
    id: Date.now(),
    date: new Date().toISOString(),
    mode: state.currentMode,
    boardSize: boardSize,
    moves: [...state.moveHistory],
    score: calculateScoreDetailed(state.board),
    aiLevel: state.aiLevel,
    puzzleLevel: state.puzzleLevel,
    puzzleIndex: state.puzzleIndex,
  };

  let history = getGameHistory();
  history.unshift(gameData);

  if (history.length > MAX_HISTORY_SIZE) {
    history = history.slice(0, MAX_HISTORY_SIZE);
  }

  try {
    localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(history));
    showSaveIndicator();
  } catch (error) {
    console.error("保存游戏失败:", error);
    speak("保存失败，存储空间不足");
  }
}

function getGameHistory() {
  try {
    const history = localStorage.getItem(GAME_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("读取历史记录失败:", error);
    return [];
  }
}

function showSaveIndicator() {
  const indicator = document.getElementById("saveIndicator");
  indicator.classList.add("show");

  setTimeout(() => {
    indicator.classList.remove("show");
  }, 2000);
}

function openGameHistory() {
  const history = getGameHistory();
  const grid = document.getElementById("gameHistoryGrid");

  if (history.length === 0) {
    grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--ink-soft);'>暂无游戏记录</p>";
  } else {
    grid.innerHTML = history
      .map((game) => {
        const date = new Date(game.date);
        const dateStr = `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
        const modeNames = {
          learn: "启蒙课",
          puzzle: "题库闯关",
          battle: "对战练习",
          local: "本地对战",
          story: "故事关卡",
          endgame: "残局挑战",
          reward: "奖励乐园",
        };
        const modeName = modeNames[game.mode] || game.mode;
        const resultText =
          game.score && game.score.totalBlack > game.score.totalWhite ? "黑胜" :
          game.score && game.score.totalWhite > game.score.totalBlack ? "白胜" :
          "进行中";

        return `
          <div class="game-history-item" data-game-id="${game.id}">
            <div class="game-history-date">${dateStr}</div>
            <div class="game-history-title">${modeName} - ${game.boardSize}×${game.boardSize}</div>
            <div class="game-history-info">
              <span>${game.moves.length}手</span>
              <span>${resultText}</span>
            </div>
          </div>
        `;
      })
      .join("");
  }

  const modal = document.getElementById("historyModal");
  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("active");

  grid.querySelectorAll(".game-history-item").forEach((item) => {
    item.addEventListener("click", () => {
      const gameId = parseInt(item.dataset.gameId);
      loadGameFromHistory(gameId);
    });
  });
}

function loadGameFromHistory(gameId) {
  const history = getGameHistory();
  const game = history.find((g) => g.id === gameId);

  if (!game) {
    speak("游戏记录不存在");
    return;
  }

  if (!confirm(`要复盘这局游戏吗？\n${new Date(game.date).toLocaleString()}`)) {
    return;
  }

  state.currentMode = game.mode;
  state.aiLevel = game.aiLevel || 3;
  state.puzzleLevel = game.puzzleLevel || 0;
  state.puzzleIndex = game.puzzleIndex || 0;

  if (game.boardSize !== boardSize) {
    boardSize = game.boardSize;
    DOM.boardSizeSelect.value = boardSize;
    buildBoard();
  }

  resetBoard();

  game.moves.forEach((move) => {
    if (move.row >= 0 && move.row < boardSize && move.col >= 0 && move.col < boardSize) {
      state.board[move.row][move.col] = move.color;
      state.moveHistory.push(move);
    }
  });

  game.moves.forEach((move) => {
    const stoneEl = document.createElement("div");
    stoneEl.className = `stone-piece ${move.color}`;
    stoneEl.style.animation = "none";
    stoneEl.style.transform = "translate(-50%, -50%) scale(1)";
    const cellSize = DOM.board.clientWidth / boardSize;
    stoneEl.style.left = `${cellSize * move.col + cellSize / 2}px`;
    stoneEl.style.top = `${cellSize * move.row + cellSize / 2}px`;
    DOM.board.appendChild(stoneEl);
  });

  if (game.moves.length > 0) {
    const lastMove = game.moves[game.moves.length - 1];
    markLastMove(lastMove.row, lastMove.col, lastMove.color);
  }

  updateScoreLine();

  const modal = document.getElementById("historyModal");
  modal.setAttribute("aria-hidden", "true");
  modal.classList.remove("active");

  setMode(state.currentMode);
  speak(`已加载游戏记录，共${game.moves.length}手`);
}

function closeGameHistory() {
  const modal = document.getElementById("historyModal");
  modal.setAttribute("aria-hidden", "true");
  modal.classList.remove("active");
}

// ========== 自动保存功能 ==========

let autoSaveTimer = null;
const AUTO_SAVE_INTERVAL = 30000; // 30秒自动保存

function startAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
  }

  autoSaveTimer = setInterval(() => {
    if (state.moveHistory.length > 0 && state.currentMode !== "puzzle" && state.currentMode !== "endgame") {
      saveGameProgress();
      console.log("自动保存完成");
    }
  }, AUTO_SAVE_INTERVAL);
}

function stopAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

// ========== 增强的游戏数据统计 ==========

function updateEnhancedStats() {
  const history = getGameHistory();
  const stats = calculateEnhancedStats(history);

  // 更新统计显示
  updateStatsDisplay(stats);
}

function calculateEnhancedStats(history) {
  const stats = {
    totalGames: history.length,
    totalPuzzles: 0,
    puzzleCorrect: 0,
    gamesByMode: {},
    gamesByBoardSize: {},
    totalMoves: 0,
    averageMoves: 0,
    winsByColor: { black: 0, white: 0 },
    longestGame: 0,
    shortestGame: Infinity,
    recentGames: history.slice(0, 10),
    favoriteMode: null,
    favoriteBoardSize: null,
    winRate: 0,
    puzzleAccuracy: 0,
  };

  history.forEach((game) => {
    // 按模式统计
    stats.gamesByMode[game.mode] = (stats.gamesByMode[game.mode] || 0) + 1;

    // 统计题库模式
    if (game.mode === "puzzle" || game.mode === "endgame") {
      stats.totalPuzzles++;
      if (game.result === "correct" || game.result === "won") {
        stats.puzzleCorrect++;
      }
    }

    // 按棋盘大小统计
    const sizeKey = `${game.boardSize}×${game.boardSize}`;
    stats.gamesByBoardSize[sizeKey] = (stats.gamesByBoardSize[sizeKey] || 0) + 1;

    // 手数统计
    const moves = game.moves.length;
    stats.totalMoves += moves;
    if (moves > stats.longestGame) stats.longestGame = moves;
    if (moves < stats.shortestGame) stats.shortestGame = moves;

    // 胜负统计
    if (game.score) {
      if (game.score.totalBlack > game.score.totalWhite) {
        stats.winsByColor.black++;
      } else if (game.score.totalWhite > game.score.totalBlack) {
        stats.winsByColor.white++;
      }
    }
  });

  if (history.length > 0) {
    stats.averageMoves = Math.round(stats.totalMoves / history.length);

    // 计算胜率（仅计算对局模式）
    const battleGames = (stats.gamesByMode.battle || 0) + (stats.gamesByMode.learn || 0) + (stats.gamesByMode.local || 0);
    if (battleGames > 0) {
      stats.winRate = Math.round((stats.winsByColor.black / battleGames) * 100);
    }

    // 计算题库正确率
    if (stats.totalPuzzles > 0) {
      stats.puzzleAccuracy = Math.round((stats.puzzleCorrect / stats.totalPuzzles) * 100);
    }

    // 找出最喜欢的模式和棋盘大小
    stats.favoriteMode = Object.entries(stats.gamesByMode).sort((a, b) => b[1] - a[1])[0][0];
    stats.favoriteBoardSize = Object.entries(stats.gamesByBoardSize).sort((a, b) => b[1] - a[1])[0][0];
  }

  return stats;
}

function updateStatsDisplay(stats) {
  // 更新现有统计元素
  document.getElementById("totalGames").textContent = stats.totalGames;

  const winRate = stats.totalGames > 0
    ? Math.round((stats.winsByColor.black / stats.totalGames) * 100)
    : 0;
  document.getElementById("winRate").textContent = `${winRate}%`;

  // 可以在侧边栏添加更多统计信息
  const statsCard = document.querySelector(".stats-card");
  if (statsCard && !statsCard.querySelector(".enhanced-stats")) {
    const enhancedStats = document.createElement("div");
    enhancedStats.className = "enhanced-stats";
    enhancedStats.innerHTML = `
      <div class="stat-row">
        <span class="stat-label">平均手数</span>
        <span class="stat-number" id="avgMoves">${stats.averageMoves}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">最长对局</span>
        <span class="stat-number" id="longestGame">${stats.longestGame}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">黑胜</span>
        <span class="stat-number" id="blackWins">${stats.winsByColor.black}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">白胜</span>
        <span class="stat-number" id="whiteWins">${stats.winsByColor.white}</span>
      </div>
    `;
    statsCard.appendChild(enhancedStats);
  } else {
    const avgMovesEl = document.getElementById("avgMoves");
    const longestGameEl = document.getElementById("longestGame");
    const blackWinsEl = document.getElementById("blackWins");
    const whiteWinsEl = document.getElementById("whiteWins");

    if (avgMovesEl) avgMovesEl.textContent = stats.averageMoves;
    if (longestGameEl) longestGameEl.textContent = stats.longestGame;
    if (blackWinsEl) blackWinsEl.textContent = stats.winsByColor.black;
    if (whiteWinsEl) whiteWinsEl.textContent = stats.winsByColor.white;
  }
}

// ========== 每日挑战任务系统 ==========

const DAILY_CHALLENGE_KEY = "foxai-daily-challenge";
const DAILY_CHALLENGES = [
  {
    id: "play_3_games",
    name: "对局练习",
    icon: "🎮",
    description: "完成3局对局",
    target: 3,
    reward: "⭐ 50",
    type: "games"
  },
  {
    id: "solve_5_puzzles",
    name: "题库闯关",
    icon: "🧩",
    description: "解答5道题目",
    target: 5,
    reward: "⭐ 30",
    type: "puzzles"
  },
  {
    id: "win_2_games",
    name: "连胜挑战",
    icon: "🏆",
    description: "赢得2局对局",
    target: 2,
    reward: "⭐ 40",
    type: "wins"
  },
  {
    id: "play_10_minutes",
    name: "持续学习",
    icon: "⏱️",
    description: "累计学习10分钟",
    target: 10,
    reward: "⭐ 20",
    type: "minutes"
  },
  {
    id: "use_hint_3_times",
    name: "勤学好问",
    icon: "💡",
    description: "使用提示3次",
    target: 3,
    reward: "⭐ 15",
    type: "hints"
  }
];

let dailyChallengeState = {
  date: null,
  progress: {},
  streak: 0,
  completed: [],
  sessionMinutes: 0
};

let sessionTimerInterval = null;

function initDailyChallenges() {
  loadDailyChallengeState();
  checkAndResetDailyChallenges();
  renderDailyChallenges();
  startChallengeTimer();
  startSessionTimer();
}

function startSessionTimer() {
  if (sessionTimerInterval) {
    clearInterval(sessionTimerInterval);
  }

  sessionTimerInterval = setInterval(() => {
    dailyChallengeState.sessionMinutes += 1;
    saveDailyChallengeState();

    // Update challenge progress every minute
    if (dailyChallengeState.sessionMinutes % 1 === 0) {
      updateChallengeProgress("minutes", 1);
    }
  }, 60000); // 60000ms = 1 minute
}

function loadDailyChallengeState() {
  try {
    const saved = localStorage.getItem(DAILY_CHALLENGE_KEY);
    if (saved) {
      dailyChallengeState = JSON.parse(saved);
    }
  } catch (error) {
    console.error("加载每日挑战失败:", error);
  }
}

function saveDailyChallengeState() {
  try {
    localStorage.setItem(DAILY_CHALLENGE_KEY, JSON.stringify(dailyChallengeState));
  } catch (error) {
    console.error("保存每日挑战失败:", error);
  }
}

function checkAndResetDailyChallenges() {
  const today = new Date().toDateString();
  if (dailyChallengeState.date !== today) {
    // Check if yesterday's challenges were all completed
    if (dailyChallengeState.date && isYesterday(new Date(dailyChallengeState.date))) {
      const allCompleted = DAILY_CHALLENGES.every(challenge =>
        dailyChallengeState.completed.includes(challenge.id)
      );
      if (allCompleted) {
        dailyChallengeState.streak++;
      } else {
        dailyChallengeState.streak = 0;
      }
    }

    // Reset for new day
    dailyChallengeState.date = today;
    dailyChallengeState.progress = {};
    dailyChallengeState.completed = [];
    saveDailyChallengeState();
  }
}

function isYesterday(date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

function updateChallengeProgress(type, amount = 1) {
  const challenges = DAILY_CHALLENGES.filter(c => c.type === type);

  challenges.forEach(challenge => {
    if (!dailyChallengeState.completed.includes(challenge.id)) {
      const current = dailyChallengeState.progress[challenge.id] || 0;
      const newValue = Math.min(current + amount, challenge.target);
      dailyChallengeState.progress[challenge.id] = newValue;

      if (newValue >= challenge.target) {
        completeChallenge(challenge);
      }

      saveDailyChallengeState();
      renderDailyChallenges();
    }
  });
}

function completeChallenge(challenge) {
  if (!dailyChallengeState.completed.includes(challenge.id)) {
    dailyChallengeState.completed.push(challenge.id);

    // Show achievement unlock
    showAchievementUnlock(
      challenge.icon,
      "每日挑战完成！",
      challenge.description,
      challenge.reward
    );

    // Award reward
    const starsMatch = challenge.reward.match(/⭐\s*(\d+)/);
    if (starsMatch) {
      const stars = parseInt(starsMatch[1]);
      state.stars += stars;
      state.save();
      speak(`恭喜！获得${stars}颗星星！`);
    }
  }
}

function renderDailyChallenges() {
  const list = document.getElementById("dailyChallengeList");

  list.innerHTML = DAILY_CHALLENGES.map(challenge => {
    const current = dailyChallengeState.progress[challenge.id] || 0;
    const isCompleted = dailyChallengeState.completed.includes(challenge.id);

    return `
      <div class="daily-challenge-item ${isCompleted ? 'completed' : ''}" data-challenge-id="${challenge.id}">
        <div class="daily-challenge-icon">${challenge.icon}</div>
        <div class="daily-challenge-content">
          <div class="daily-challenge-name">${challenge.name}</div>
          <div class="daily-challenge-progress">${current}/${challenge.target} ${challenge.description}</div>
        </div>
        <div class="daily-challenge-reward">${challenge.reward}</div>
      </div>
    `;
  }).join("");
}

let challengeTimerInterval = null;

function startChallengeTimer() {
  if (challengeTimerInterval) {
    clearInterval(challengeTimerInterval);
  }

  updateChallengeTimer();
  challengeTimerInterval = setInterval(updateChallengeTimer, 1000);
}

function updateChallengeTimer() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const timerEl = document.getElementById("dailyChallengeTimer");
  if (timerEl) {
    timerEl.textContent = `⏰ ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    // Add urgent class when less than 1 hour
    if (hours < 1) {
      timerEl.classList.add("urgent");
    } else {
      timerEl.classList.remove("urgent");
    }
  }

  // Update streak display
  const streakEl = document.getElementById("challengeStreak");
  if (streakEl) {
    streakEl.textContent = dailyChallengeState.streak;
  }
}

// ========== 成就解锁动画 ==========

function showAchievementUnlock(icon, title, description, reward) {
  const overlay = document.getElementById("achievementUnlockOverlay");
  const iconEl = document.getElementById("achievementUnlockIcon");
  const titleEl = document.getElementById("achievementUnlockTitle");
  const descEl = document.getElementById("achievementUnlockDescription");

  iconEl.textContent = icon || "🏆";
  titleEl.textContent = title || "成就解锁！";
  descEl.textContent = description || "恭喜你完成挑战";

  overlay.classList.add("show");

  // Play celebration sound
  playVictorySound();

  // Auto hide after 4 seconds
  setTimeout(() => {
    hideAchievementUnlock();
  }, 4000);
}

function hideAchievementUnlock() {
  const overlay = document.getElementById("achievementUnlockOverlay");
  overlay.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("achievementUnlockButton").addEventListener("click", hideAchievementUnlock);
});

// ========== 棋谱分享系统 ==========

function openShareModal() {
  if (state.moveHistory.length === 0) {
    speak("还没有棋步可以分享哦！先下一局棋吧！");
    return;
  }

  const modal = document.getElementById("shareModal");
  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("active");

  // Generate share URL
  const shareUrl = generateShareUrl();
  document.getElementById("shareUrlInput").value = shareUrl;

  // Generate share code
  const shareCode = generateShareCode();
  document.getElementById("shareCodeDisplay").textContent = shareCode;
}

function closeShareModal() {
  const modal = document.getElementById("shareModal");
  modal.setAttribute("aria-hidden", "true");
  modal.classList.remove("active");
}

function generateShareUrl() {
  // Compress the game moves into a base64 string
  const gameData = {
    b: boardSize,
    m: state.moveHistory.map(move => ({
      r: move.row,
      c: move.col,
      color: move.color === "black" ? "b" : "w"
    }))
  };

  const jsonStr = JSON.stringify(gameData);
  const compressed = btoa(jsonStr);

  // Generate shareable URL
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#game=${compressed.substring(0, 50)}`; // Limit to 50 chars for readability
}

function generateShareCode() {
  // Generate a 8-character share code
  const gameData = {
    b: boardSize,
    m: state.moveHistory.map(move => ({
      r: move.row,
      c: move.col,
      color: move.color === "black" ? "b" : "w"
    }))
  };

  const jsonStr = JSON.stringify(gameData);
  const hash = btoa(jsonStr).substring(0, 12);

  // Format as XXXX-XXXX
  return `${hash.substring(0, 4).toUpperCase()}-${hash.substring(4, 8).toUpperCase()}`;
}

function loadGameFromShareCode(code) {
  try {
    // Remove dashes and convert to uppercase
    const cleanCode = code.replace(/-/g, "").toUpperCase();

    // Try to find in localStorage first
    const sharedGames = JSON.parse(localStorage.getItem("foxai-shared-games") || "{}");
    if (sharedGames[cleanCode]) {
      loadGameFromSharedData(sharedGames[cleanCode]);
      return true;
    }

    // Try to decode directly (for backwards compatibility)
    const jsonStr = atob(cleanCode);
    const gameData = JSON.parse(jsonStr);

    if (gameData.b && gameData.m) {
      loadGameFromCompressedData(gameData);
      return true;
    }

    return false;
  } catch (error) {
    console.error("加载分享码失败:", error);
    return false;
  }
}

function loadGameFromCompressedData(gameData) {
  // Set board size
  if (gameData.b !== boardSize) {
    boardSize = gameData.b;
    DOM.boardSizeSelect.value = boardSize;
    buildBoard();
  }

  resetBoard();

  // Load moves
  gameData.m.forEach((move) => {
    const color = move.color === "b" ? "black" : "white";
    if (move.row >= 0 && move.row < boardSize && move.col >= 0 && move.col < boardSize) {
      state.board[move.row][move.col] = color;
      state.moveHistory.push({ row: move.row, col: move.col, color });
    }
  });

  // Render all stones
  gameData.m.forEach((move) => {
    const color = move.color === "b" ? "black" : "white";
    const stoneEl = document.createElement("div");
    stoneEl.className = `stone-piece ${color}`;
    stoneEl.style.animation = "none";
    stoneEl.style.transform = "translate(-50%, -50%) scale(1)";
    const cellSize = DOM.board.clientWidth / boardSize;
    stoneEl.style.left = `${cellSize * move.col + cellSize / 2}px`;
    stoneEl.style.top = `${cellSize * move.row + cellSize / 2}px`;
    DOM.board.appendChild(stoneEl);
  });

  if (gameData.m.length > 0) {
    const lastMove = gameData.m[gameData.m.length - 1];
    const color = lastMove.color === "b" ? "black" : "white";
    markLastMove(lastMove.row, lastMove.col, color);
  }

  updateScoreLine();
  speak(`已加载分享的棋谱，共${gameData.m.length}手`);
}

function copyShareUrl() {
  const shareUrlInput = document.getElementById("shareUrlInput");
  shareUrlInput.select();
  shareUrlInput.setSelectionRange(0, 99999); // For mobile

  try {
    navigator.clipboard.writeText(shareUrlInput.value).then(() => {
      showCopiedToast();
      speak("链接已复制到剪贴板");
    });
  } catch (err) {
    // Fallback for older browsers
    document.execCommand("copy");
    showCopiedToast();
    speak("链接已复制");
  }
}

function copyShareCode() {
  const shareCodeDisplay = document.getElementById("shareCodeDisplay");

  try {
    navigator.clipboard.writeText(shareCodeDisplay.textContent).then(() => {
      showCopiedToast();
      speak("分享码已复制到剪贴板");
    });
  } catch (err) {
    // Fallback
    const textarea = document.createElement("textarea");
    textarea.value = shareCodeDisplay.textContent;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showCopiedToast();
    speak("分享码已复制");
  }
}

function showCopiedToast() {
  const toast = document.getElementById("shareCopiedToast");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function initShareTabs() {
  const tabs = document.querySelectorAll(".share-tab");
  const contents = document.querySelectorAll(".share-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Update tabs
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // Update content
      const targetTab = tab.dataset.shareTab;
      contents.forEach(content => {
        content.classList.remove("active");
        if (content.id === `share${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}Content`) {
          content.classList.add("active");
        }
      });
    });
  });
}

// ========== 学习路径推荐系统 ==========

const LEARNING_PATH_KEY = "foxai-learning-path";

// 学习路径推荐状态
let learningPathState = {
  lastRecommendedMode: null,
  lastRecommendationTime: null,
  skillLevel: "beginner", // beginner, intermediate, advanced
  completedRecommendations: [],
  ignoredRecommendations: []
};

// 学习路径配置
const LEARNING_PATHS = {
  beginner: [
    {
      mode: "learn",
      priority: 1,
      minLevel: 1,
      maxLevel: 3,
      description: "从启蒙课开始，学习围棋基础知识",
      reason: "打好基础是关键！启蒙课将教你围棋的基本规则和技巧",
      condition: (stats) => stats.totalGames < 5
    },
    {
      mode: "puzzle",
      priority: 2,
      minLevel: 1,
      maxLevel: 3,
      description: "通过简单题目练习死活技巧",
      reason: "练习死活题可以帮助你更好地理解棋子的气",
      condition: (stats) => stats.totalPuzzles < 10
    },
    {
      mode: "battle",
      priority: 3,
      minLevel: 1,
      maxLevel: 3,
      description: "和AI进行实战练习",
      reason: "试试和AI对弈，把学到的东西应用到实战中吧！",
      condition: (stats) => stats.totalGames >= 3 && stats.winRate > 30
    }
  ],
  intermediate: [
    {
      mode: "puzzle",
      priority: 1,
      minLevel: 2,
      maxLevel: 5,
      description: "挑战更难的死活题",
      reason: "你的基础不错了，试试更难的题目吧！",
      condition: (stats) => stats.totalPuzzles >= 10 && stats.puzzleAccuracy > 60
    },
    {
      mode: "battle",
      priority: 2,
      minLevel: 3,
      maxLevel: 5,
      description: "提高AI难度进行对战",
      reason: "是时候提高AI难度，挑战更强的对手了！",
      condition: (stats) => stats.totalGames >= 10 && stats.winRate > 40
    },
    {
      mode: "endgame",
      priority: 3,
      minLevel: 1,
      maxLevel: 3,
      description: "学习残局技巧",
      reason: "残局能力很重要，来练习一下吧！",
      condition: (stats) => stats.totalGames >= 15
    }
  ],
  advanced: [
    {
      mode: "battle",
      priority: 1,
      minLevel: 4,
      maxLevel: 5,
      description: "和最强AI对战",
      reason: "你的水平已经很棒了，挑战最高难度吧！",
      condition: (stats) => stats.totalGames >= 30 && stats.winRate > 50
    },
    {
      mode: "endgame",
      priority: 2,
      minLevel: 3,
      maxLevel: 5,
      description: "挑战高难度残局",
      reason: "高级残局考验你的计算能力，试试看吧！",
      condition: (stats) => stats.totalPuzzles >= 30
    },
    {
      mode: "local",
      priority: 3,
      minLevel: 1,
      maxLevel: 5,
      description: "和朋友对弈",
      reason: "找个朋友一起下棋吧，互相学习进步更快！",
      condition: (stats) => stats.totalGames >= 20
    }
  ]
};

/**
 * 计算用户技能水平
 */
function calculateSkillLevel(stats) {
  const totalGames = stats.totalGames || 0;
  const totalPuzzles = stats.totalPuzzles || 0;
  const winRate = stats.winRate || 0;

  if (totalGames < 10 || totalPuzzles < 20) {
    return "beginner";
  } else if (totalGames < 30 || totalPuzzles < 50) {
    return winRate > 45 ? "intermediate" : "beginner";
  } else {
    return winRate > 50 ? "advanced" : "intermediate";
  }
}

/**
 * 获取推荐的学习活动
 */
function getRecommendedActivity() {
  const history = getGameHistory();
  const stats = calculateEnhancedStats(history);

  // 计算技能水平
  const skillLevel = calculateSkillLevel(stats);
  learningPathState.skillLevel = skillLevel;

  // 获取对应技能水平的学习路径
  const paths = LEARNING_PATHS[skillLevel];

  // 找到满足条件的推荐
  for (const path of paths) {
    if (path.condition(stats)) {
      // 检查是否被用户忽略过
      const isIgnored = learningPathState.ignoredRecommendations.some(
        ignored => ignored.mode === path.mode && ignored.time > Date.now() - 24 * 60 * 60 * 1000
      );

      if (!isIgnored) {
        learningPathState.lastRecommendedMode = path.mode;
        learningPathState.lastRecommendationTime = Date.now();
        saveLearningPathState();
        return path;
      }
    }
  }

  // 默认推荐
  return {
    mode: "battle",
    priority: 1,
    minLevel: 1,
    maxLevel: 5,
    description: "继续对战练习",
    reason: "多下棋是最好的进步方法！",
    condition: () => true
  };
}

/**
 * 显示学习路径推荐卡片
 */
function showLearningPathRecommendation() {
  const recommendation = getRecommendedActivity();
  if (!recommendation) return;

  // 检查是否已经显示过（24小时内只显示一次）
  const lastShown = learningPathState.lastRecommendationTime;
  if (lastShown && Date.now() - lastShown < 24 * 60 * 60 * 1000) {
    // 仍然高亮推荐的按钮
    highlightRecommendedMode(recommendation.mode);
    return;
  }

  // 创建推荐卡片
  const sidebar = document.querySelector(".side-zone");
  if (!sidebar) return;

  // 移除旧的推荐卡片
  const oldCard = document.getElementById("learningPathCard");
  if (oldCard) oldCard.remove();

  const card = document.createElement("div");
  card.className = "side-card learning-path-card";
  card.id = "learningPathCard";
  card.innerHTML = `
    <div class="learning-path-header">
      <span class="learning-path-icon">🎯</span>
      <h3>学习建议</h3>
    </div>
    <div class="learning-path-content">
      <p class="learning-path-description">${recommendation.description}</p>
      <p class="learning-path-reason">${recommendation.reason}</p>
    </div>
    <div class="learning-path-actions">
      <button class="learning-path-btn primary" id="acceptRecommendation">开始学习</button>
      <button class="learning-path-btn secondary" id="ignoreRecommendation">稍后再说</button>
    </div>
  `;

  // 插入到模式选择卡片之后
  const modeCard = sidebar.querySelector('.side-card h2');
  if (modeCard && modeCard.textContent === "模式选择") {
    const modeCardParent = modeCard.closest(".side-card");
    if (modeCardParent && modeCardParent.nextSibling) {
      sidebar.insertBefore(card, modeCardParent.nextSibling);
    } else {
      sidebar.appendChild(card);
    }
  } else {
    sidebar.appendChild(card);
  }

  // 绑定事件
  document.getElementById("acceptRecommendation").addEventListener("click", () => {
    acceptRecommendation(recommendation.mode);
  });

  document.getElementById("ignoreRecommendation").addEventListener("click", () => {
    ignoreRecommendation(recommendation.mode);
  });

  // 高亮推荐的按钮
  highlightRecommendedMode(recommendation.mode);
}

/**
 * 高亮推荐的模式按钮
 */
function highlightRecommendedMode(mode) {
  const modeButtons = document.querySelectorAll(".mode-chip");
  modeButtons.forEach(btn => {
    btn.classList.remove("recommended");
    if (btn.dataset.mode === mode) {
      btn.classList.add("recommended");
      // 添加推荐标记
      if (!btn.querySelector(".recommend-badge")) {
        const badge = document.createElement("span");
        badge.className = "recommend-badge";
        badge.textContent = "推荐";
        btn.appendChild(badge);
      }
    }
  });
}

/**
 * 接受推荐
 */
function acceptRecommendation(mode) {
  learningPathState.completedRecommendations.push({
    mode: mode,
    time: Date.now()
  });
  saveLearningPathState();

  // 切换到推荐的模式
  const modeButton = document.querySelector(`.mode-chip[data-mode="${mode}"]`);
  if (modeButton) {
    modeButton.click();
  }

  // 移除推荐卡片
  const card = document.getElementById("learningPathCard");
  if (card) {
    card.style.animation = "slideOutRight 0.3s ease-out forwards";
    setTimeout(() => card.remove(), 300);
  }

  speak("好的，开始" + (mode === "learn" ? "启蒙课" :
                          mode === "puzzle" ? "题库闯关" :
                          mode === "battle" ? "对战练习" :
                          mode === "endgame" ? "残局挑战" :
                          mode === "local" ? "本地对战" : "游戏"));
}

/**
 * 忽略推荐
 */
function ignoreRecommendation(mode) {
  learningPathState.ignoredRecommendations.push({
    mode: mode,
    time: Date.now()
  });
  saveLearningPathState();

  // 移除推荐卡片
  const card = document.getElementById("learningPathCard");
  if (card) {
    card.style.animation = "slideOutRight 0.3s ease-out forwards";
    setTimeout(() => card.remove(), 300);
  }

  speak("好的，稍后提醒");
}

/**
 * 保存学习路径状态
 */
function saveLearningPathState() {
  try {
    localStorage.setItem(LEARNING_PATH_KEY, JSON.stringify(learningPathState));
  } catch (error) {
    console.error("保存学习路径状态失败:", error);
  }
}

/**
 * 加载学习路径状态
 */
function loadLearningPathState() {
  try {
    const saved = localStorage.getItem(LEARNING_PATH_KEY);
    if (saved) {
      learningPathState = { ...learningPathState, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error("加载学习路径状态失败:", error);
  }
}

/**
 * 初始化学习路径推荐系统
 */
function initLearningPathSystem() {
  loadLearningPathState();

  // 延迟显示推荐（等待页面加载完成）
  setTimeout(() => {
    showLearningPathRecommendation();
  }, 1500);
}

// ========== 家长监控面板系统 ==========

/**
 * 打开家长监控面板
 */
function openParentDashboard() {
  const modal = document.getElementById("parentDashboardModal");
  if (!modal) return;

  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("active");

  // 更新数据
  updateParentDashboardData();

  speak("家长监控中心已打开");
}

/**
 * 关闭家长监控面板
 */
function closeParentDashboard() {
  const modal = document.getElementById("parentDashboardModal");
  if (!modal) return;

  modal.setAttribute("aria-hidden", "true");
  modal.classList.remove("active");
}

/**
 * 更新家长监控面板数据
 */
function updateParentDashboardData() {
  const history = getGameHistory();
  const stats = calculateEnhancedStats(history);

  // 更新基本统计
  document.getElementById("parentTotalGames").textContent = stats.totalGames;
  document.getElementById("parentTotalPuzzles").textContent = stats.totalPuzzles;

  // 计算学习时长（估算：每局约10分钟）
  const totalMinutes = stats.totalGames * 10 + stats.totalPuzzles * 3;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  document.getElementById("parentTotalTime").textContent =
    hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;

  // 更新连续打卡天数
  const challengeState = JSON.parse(localStorage.getItem("foxai-daily-challenge") || "{}");
  const streak = challengeState.streak || 0;
  document.getElementById("parentStreak").textContent = `${streak}天`;

  // 更新当前段位
  const levelIndex = Math.min(state.levelDone - 1, levels.length - 1);
  document.getElementById("parentLevel").textContent = levels[levelIndex];

  // 更新星星数
  document.getElementById("parentStars").textContent = state.stars;

  // 更新技能分析
  const battleSkill = Math.min(100, stats.winRate * 1.5);
  const puzzleSkill = Math.min(100, stats.puzzleAccuracy);
  const consistency = Math.min(100, (stats.totalGames + stats.totalPuzzles) / 2);

  document.getElementById("parentBattleSkill").textContent = `${battleSkill}%`;
  document.getElementById("parentBattleSkillBar").style.width = `${battleSkill}%`;

  document.getElementById("parentPuzzleSkill").textContent = `${puzzleSkill}%`;
  document.getElementById("parentPuzzleSkillBar").style.width = `${puzzleSkill}%`;

  document.getElementById("parentConsistency").textContent = `${consistency}%`;
  document.getElementById("parentConsistencyBar").style.width = `${consistency}%`;

  // 更新最近7天活动图表
  updateParentActivityChart(history);

  // 更新学习建议
  updateParentSuggestions(stats, streak);
}

/**
 * 更新最近7天活动图表
 */
function updateParentActivityChart(history) {
  const chart = document.getElementById("parentActivityChart");
  if (!chart) return;

  // 生成最近7天的日期
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push({
      date: date,
      dateStr: `${date.getMonth() + 1}/${date.getDate()}`,
      games: 0
    });
  }

  // 统计每天的游戏数
  history.forEach(game => {
    const gameDate = new Date(game.date);
    days.forEach(day => {
      if (
        gameDate.getDate() === day.date.getDate() &&
        gameDate.getMonth() === day.date.getMonth() &&
        gameDate.getFullYear() === day.date.getFullYear()
      ) {
        day.games++;
      }
    });
  });

  // 找出最大值用于计算高度
  const maxGames = Math.max(...days.map(d => d.games), 1);

  // 生成图表HTML
  chart.innerHTML = `
    <div class="parent-activity-bars">
      ${days.map(day => {
        const height = Math.max(5, (day.games / maxGames) * 100);
        return `
          <div class="parent-activity-bar-wrapper">
            <div class="parent-activity-bar" style="height: ${height}%"></div>
            <div class="parent-activity-label">${day.dateStr}</div>
            <div class="parent-activity-count">${day.games}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

/**
 * 更新学习建议
 */
function updateParentSuggestions(stats, streak) {
  const suggestionsEl = document.getElementById("parentSuggestions");
  if (!suggestionsEl) return;

  const suggestions = [];

  // 基于数据的建议
  if (stats.totalGames === 0) {
    suggestions.push({
      icon: "🎮",
      text: "鼓励孩子开始第一局对战，从启蒙课开始学习围棋基础知识"
    });
  }

  if (stats.totalPuzzles < 10 && stats.totalGames > 5) {
    suggestions.push({
      icon: "🧩",
      text: "可以尝试做一些死活题，帮助孩子更好地理解围棋技巧"
    });
  }

  if (stats.winRate > 60 && stats.totalGames > 10) {
    suggestions.push({
      icon: "🌟",
      text: "孩子的对局能力很棒！可以适当提高AI难度继续挑战"
    });
  }

  if (stats.puzzleAccuracy > 70 && stats.totalPuzzles > 20) {
    suggestions.push({
      icon: "🎯",
      text: "解题能力出色！可以尝试更高难度的残局挑战"
    });
  }

  if (streak >= 7) {
    suggestions.push({
      icon: "🔥",
      text: `连续打卡${streak}天，孩子的学习习惯非常好！请继续保持鼓励`
    });
  }

  if (streak === 0) {
    suggestions.push({
      icon: "⏰",
      text: "建议每天安排固定时间进行练习，建立良好的学习习惯"
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      icon: "✓",
      text: "继续保持良好的学习习惯！孩子的进步离不开您的鼓励和支持"
    });
  }

  // 渲染建议
  suggestionsEl.innerHTML = suggestions.slice(0, 4).map(s => `
    <div class="parent-suggestion-item">
      <span class="parent-suggestion-icon">${s.icon}</span>
      <span class="parent-suggestion-text">${s.text}</span>
    </div>
  `).join("");
}

init();
