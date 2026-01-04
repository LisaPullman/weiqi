const boardSize = 9;
const board = document.getElementById("board");
const winCountEl = document.getElementById("winCount");
const starCountEl = document.getElementById("starCount");
const levelDoneEl = document.getElementById("levelDone");
const rewardModal = document.getElementById("rewardModal");
const rewardGame = document.getElementById("rewardGame");
const coachLine = document.getElementById("coachLine");
const puzzlePanel = document.getElementById("puzzlePanel");
const puzzleText = document.getElementById("puzzleText");
const aiLevelSelect = document.getElementById("aiLevel");
const rewardTitle = document.querySelector(".reward-header h2");
const rewardSubtitle = document.querySelector(".reward-header p");
const scoreLine = document.getElementById("scoreLine");
const puzzleLevelSelect = document.getElementById("puzzleLevelSelect");
const puzzleFileInput = document.getElementById("puzzleFile");
const reviewModal = document.getElementById("reviewModal");
const reviewBoard = document.getElementById("reviewBoard");
const reviewSummary = document.getElementById("reviewSummary");
const reviewDetail = document.getElementById("reviewDetail");

const storageKey = "foxai-go-progress";
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
  board: Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => null)
  ),
};

const coachLines = [
  "歪歪，试试在白子旁边下黑子，让它喘不过气。",
  "这步可以先连起来，别让小狐狸把你分开哦。",
  "先占住角落更稳，歪歪做得很棒！",
  "点亮星星就能解锁奖励，我们继续加油！",
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
  aiLevelSelect.value = String(state.aiLevel || 3);
  updateProgress();
  renderLevels();
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function updateProgress() {
  winCountEl.textContent = state.wins;
  starCountEl.textContent = state.stars;
  levelDoneEl.textContent = state.levelDone;
  const headerPill = document.querySelector(".header-meta .pill:last-child");
  const levelIndex = Math.min(state.levelDone - 1, levels.length - 1);
  if (headerPill) {
    headerPill.textContent = `段位：${levels[levelIndex]}`;
  }
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
  board.innerHTML = "";
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      const cell = document.createElement("button");
      cell.className = "intersection";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", handlePlayerMove);
      board.appendChild(cell);
    }
  }
}

function placeStone(row, col, color, animate = true) {
  const stone = document.createElement("div");
  stone.className = `stone-piece ${color}`;
  if (!animate) {
    stone.style.animation = "none";
    stone.style.transform = "translate(-50%, -50%) scale(1)";
  }
  const cellSize = board.clientWidth / boardSize;
  stone.style.left = `${cellSize * col + cellSize / 2}px`;
  stone.style.top = `${cellSize * row + cellSize / 2}px`;
  board.appendChild(stone);
  state.board[row][col] = color;
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
    return;
  }
  const result = applyMove(state.board, row, col, "black");
  if (!result) {
    speak("这一步不能下哦。");
    return;
  }
  const nextString = boardToString(result.nextBoard);
  if (isKo(nextString)) {
    speak("打劫啦！这步不行。");
    return;
  }
  commitBoard(result.nextBoard);
  if (result.captured > 0) {
    handleCaptures();
  } else {
    placeStone(row, col, "black");
    updateScoreLine();
  }
  state.passCount = 0;
  if (state.currentMode === "puzzle") {
    checkPuzzleAnswer(row, col);
    return;
  }
  window.setTimeout(() => makeAiMove(state.aiLevel), 520);
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
  if (pick.result.captured > 0) {
    handleCaptures();
  } else {
    placeStone(pick.row, pick.col, "white");
    updateScoreLine();
  }
  state.passCount = 0;
}

function handleWin() {
  state.wins += 1;
  state.stars += 2;
  state.levelDone = Math.min(10, state.levelDone + 1);
  resetBoard();
  updateProgress();
  renderLevels();
  saveState();
  speak("歪歪太棒了！你完成了这一关！");
}

function resetBoard() {
  state.board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => null)
  );
  state.currentBoardString = boardToString(state.board);
  state.lastBoardString = "";
  state.passCount = 0;
  board.querySelectorAll(".stone-piece").forEach((node) => node.remove());
  updateScoreLine();
}

function speak(text) {
  if (!window.speechSynthesis) {
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "zh-CN";
  utter.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function openRewardGame() {
  rewardModal.classList.add("active");
  rewardModal.setAttribute("aria-hidden", "false");
  rewardTitle.textContent = "星星捕捉";
  rewardSubtitle.textContent = "点亮 5 颗星星，解锁小狐狸贴纸！";
  document
    .querySelectorAll(".tab-btn")
    .forEach((node) => node.classList.remove("active"));
  document
    .querySelector('.tab-btn[data-game="stars"]')
    .classList.add("active");
  buildStarGame();
}

function closeRewardGame() {
  rewardModal.classList.remove("active");
  rewardModal.setAttribute("aria-hidden", "true");
}

function buildStarGame() {
  rewardGame.innerHTML = "";
  for (let i = 0; i < 6; i += 1) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = `${10 + Math.random() * 80}%`;
    star.style.top = `${10 + Math.random() * 70}%`;
    star.addEventListener("click", () => {
      star.remove();
      state.stars += 1;
      updateProgress();
      saveState();
      if (rewardGame.querySelectorAll(".star").length === 0) {
        speak("奖励完成！歪歪获得了小狐狸贴纸！");
      }
    });
    rewardGame.appendChild(star);
  }
}

function buildMemoryGame() {
  rewardGame.innerHTML = "";
  const emojis = ["🦊", "🌟", "🍎", "🎈", "🐼", "🎵"];
  const deck = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  const grid = document.createElement("div");
  grid.className = "memory-grid";
  rewardGame.appendChild(grid);
  let firstCard = null;
  let lock = false;
  deck.forEach((emoji) => {
    const card = document.createElement("button");
    card.className = "memory-card";
    card.textContent = "❓";
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
        }, 600);
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
  const stones = board.querySelectorAll(".stone-piece");
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
    1: { capture: 4, liberty: 1, center: 0.5, random: 3 },
    2: { capture: 6, liberty: 1.5, center: 0.7, random: 2 },
    3: { capture: 8, liberty: 2, center: 1, random: 1.5 },
    4: { capture: 10, liberty: 2.5, center: 1.2, random: 1 },
    5: { capture: 14, liberty: 3, center: 1.5, random: 0.5 },
  };
  const weight = weights[level] || weights[3];
  let best = candidates[0];
  let bestScore = -Infinity;
  candidates.forEach((candidate) => {
    const { row, col, result } = candidate;
    const centerDist =
      Math.abs(row - (boardSize - 1) / 2) + Math.abs(col - (boardSize - 1) / 2);
    const group = getGroup(result.nextBoard, row, col);
    const liberties = getLiberties(result.nextBoard, group).size;
    const score =
      result.captured * weight.capture +
      liberties * weight.liberty -
      centerDist * weight.center +
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
  scoreLine.textContent = `黑 ${score.totalBlack} · 白 ${score.totalWhite}`;
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
  coachLine.textContent = `歪歪，${message}`;
  speak(message);
  state.reviewData = score;
  openReview();
  if (result === "黑胜") {
    handleWin();
  } else {
    resetBoard();
  }
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
  puzzleText.textContent = `第 ${index + 1} 题：${puzzle.title}`;
  speak(`歪歪，${puzzle.title}`);
}

function checkPuzzleAnswer(row, col) {
  const level = puzzleData.levels[state.puzzleLevel] || puzzleData.levels[0];
  const puzzle = level.puzzles[state.puzzleIndex % level.puzzles.length];
  if (puzzle.answer.row === row && puzzle.answer.col === col) {
    state.stars += 2;
    state.wins += 1;
    state.levelDone = Math.min(10, state.levelDone + 1);
    updateProgress();
    renderLevels();
    saveState();
    speak("答对啦！歪歪太棒了！");
    state.puzzleIndex = (state.puzzleIndex + 1) % level.puzzles.length;
    window.setTimeout(() => loadPuzzle(state.puzzleIndex), 600);
  } else {
    speak("再想一想，歪歪一定可以的！");
  }
}

function setMode(mode) {
  state.currentMode = mode;
  const modeText = {
    learn: "启蒙课：学习吃子和连接",
    puzzle: "题库闯关：挑战数气与死活",
    battle: "对战练习：和小狐狸较量",
    story: "故事关卡：守护围棋森林",
    reward: "奖励乐园：收集贴纸与徽章",
  };
  coachLine.textContent = `歪歪，进入${modeText[mode] || "新的模式"}！`;
  speak(coachLine.textContent);
  puzzlePanel.style.display = mode === "puzzle" ? "flex" : "none";
  if (mode === "puzzle") {
    loadPuzzle(state.puzzleIndex);
  } else {
    resetBoard();
    updateScoreLine();
  }
  saveState();
}

function updatePuzzleLevels() {
  puzzleLevelSelect.innerHTML = "";
  puzzleData.levels.forEach((level, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${level.name}（${level.puzzles.length}题）`;
    puzzleLevelSelect.appendChild(option);
  });
  puzzleLevelSelect.value = String(state.puzzleLevel || 0);
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
  reviewModal.classList.add("active");
  reviewModal.setAttribute("aria-hidden", "false");
  const score = state.reviewData;
  reviewSummary.textContent = `黑 ${score.totalBlack} · 白 ${score.totalWhite}`;
  reviewDetail.textContent = `黑子 ${score.blackStones} + 黑地 ${score.blackTerritory} | 白子 ${score.whiteStones} + 白地 ${score.whiteTerritory}`;
  renderReviewBoard(score.map, score.board);
}

function closeReview() {
  reviewModal.classList.remove("active");
  reviewModal.setAttribute("aria-hidden", "true");
}

function renderReviewBoard(map, boardData) {
  reviewBoard.innerHTML = "";
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      const cell = document.createElement("div");
      cell.className = `review-cell territory-${map[row][col]}`;
      const stone = boardData[row][col];
      if (stone) {
        const piece = document.createElement("div");
        piece.className = `review-stone ${stone}`;
        cell.appendChild(piece);
      }
      reviewBoard.appendChild(cell);
    }
  }
}

function bindActions() {
  document.getElementById("hintBtn").addEventListener("click", () => {
    const line = coachLines[Math.floor(Math.random() * coachLines.length)];
    speak(line);
  });

  document.getElementById("coachBtn").addEventListener("click", () => {
    const line = coachLines[Math.floor(Math.random() * coachLines.length)];
    coachLine.textContent = line;
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
        rewardTitle.textContent = "连连乐";
        rewardSubtitle.textContent = "翻开两张一样的牌，收集星星奖励。";
        buildMemoryGame();
      } else {
        rewardTitle.textContent = "星星捕捉";
        rewardSubtitle.textContent = "点亮 5 颗星星，解锁小狐狸贴纸！";
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

  puzzleLevelSelect.addEventListener("change", (event) => {
    state.puzzleLevel = Number(event.target.value);
    state.puzzleIndex = 0;
    saveState();
    if (state.currentMode === "puzzle") {
      loadPuzzle(state.puzzleIndex);
    }
  });

  puzzleFileInput.addEventListener("change", (event) => {
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

  aiLevelSelect.addEventListener("change", (event) => {
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
}

init();
