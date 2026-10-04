const SIZE = 9;
const SCORES_KEY = 'sudoku-studio-scores';
const THEME_KEY = 'sudoku-studio-dark';
let puzzle = [];
let locked = new Set();
let hinted = new Set();
let startedAt = null;
let elapsedSeconds = 0;
let timerHandle = null;
let hintsUsed = 0;
let solved = false;

const boardElement = document.getElementById('sudoku-board');
const messageElement = document.getElementById('message');

function cellIndex(row, col) { return row * SIZE + col; }
function getCells() { return [...boardElement.querySelectorAll('.sudoku-cell')]; }
function getBoard() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  getCells().forEach((cell) => { board[Number(cell.dataset.row)][Number(cell.dataset.col)] = Number(cell.value) || 0; });
  return board;
}

function createBoard() {
  boardElement.replaceChildren();
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const input = document.createElement('input');
      input.className = 'sudoku-cell'; input.type = 'text'; input.inputMode = 'numeric';
      input.maxLength = 1; input.autocomplete = 'off'; input.dataset.row = row; input.dataset.col = col;
      input.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}, editable Sudoku cell`);
      input.setAttribute('aria-invalid', 'false');
      const square = Math.floor(row / 3) + Math.floor(col / 3);
      input.classList.add(square % 2 ? 'block-b' : 'block-a');
      boardElement.append(input);
    }
  }
}

function renderPuzzle(nextPuzzle) {
  puzzle = nextPuzzle; locked = new Set(); hinted = new Set(); hintsUsed = 0; solved = false;
  createBoard();
  getCells().forEach((cell) => {
    const row = Number(cell.dataset.row); const col = Number(cell.dataset.col); const value = puzzle[row][col];
    if (value) {
      cell.value = value;
      cell.disabled = true;
      cell.classList.add('prefilled');
      cell.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}, given ${value}, not editable`);
      locked.add(cellIndex(row, col));
    }
  });
}

function showMessage(text, success = false) {
  messageElement.textContent = text;
  messageElement.classList.toggle('success', success);
}

function formatTime(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
function updateTimer() {
  elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
  document.getElementById('timer').textContent = formatTime(elapsedSeconds);
}
function startTimer() {
  clearInterval(timerHandle); startedAt = Date.now(); elapsedSeconds = 0;
  document.getElementById('timer').textContent = '00:00';
  timerHandle = setInterval(updateTimer, 1000);
}

async function newGame() {
  showMessage('Creating a unique puzzle…');
  const difficulty = document.getElementById('difficulty').value;
  try {
    const response = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not create a puzzle.');
    renderPuzzle(data.puzzle); showMessage(''); startTimer();
  } catch (error) { showMessage(error.message); }
}

function hasLocalConflict(row, col, value) {
  return getCells().some((other) => {
    if (!other.value || other === getCells()[cellIndex(row, col)]) return false;
    const r = Number(other.dataset.row); const c = Number(other.dataset.col);
    return Number(other.value) === value && (r === row || c === col || (Math.floor(r / 3) === Math.floor(row / 3) && Math.floor(c / 3) === Math.floor(col / 3)));
  });
}

function handleInput(event) {
  const cell = event.target;
  if (!cell.matches('.sudoku-cell') || cell.disabled) return;
  cell.value = cell.value.replace(/[^1-9]/g, '').slice(-1);
  const row = Number(cell.dataset.row); const col = Number(cell.dataset.col);
  const conflict = cell.value && hasLocalConflict(row, col, Number(cell.value));
  cell.classList.toggle('invalid', Boolean(conflict));
  cell.setAttribute('aria-invalid', conflict ? 'true' : 'false');
  if (conflict) showMessage('That number conflicts with its row, column, or square.');
  else if (!solved) showMessage('');
}

function handleCellKeydown(event) {
  const cell = event.target;
  if (!cell.matches('.sudoku-cell')) return;
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  const offsets = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
  };
  const offset = offsets[event.key];
  if (!offset) return;

  let nextRow = row + offset[0];
  let nextCol = col + offset[1];
  while (nextRow >= 0 && nextRow < SIZE && nextCol >= 0 && nextCol < SIZE) {
    const nextCell = boardElement.querySelector(
      `.sudoku-cell[data-row="${nextRow}"][data-col="${nextCol}"]`,
    );
    if (nextCell && !nextCell.disabled) {
      event.preventDefault();
      nextCell.focus();
      return;
    }
    nextRow += offset[0];
    nextCol += offset[1];
  }
}

async function checkPuzzle() {
  try {
    const response = await fetch('/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ board: getBoard() }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not check this puzzle.');
    const incorrect = new Set(data.incorrect.map(([r, c]) => cellIndex(r, c)));
    getCells().forEach((cell, index) => {
      const isIncorrect = incorrect.has(index);
      if (!locked.has(index)) {
        cell.classList.toggle('invalid', isIncorrect);
        cell.setAttribute('aria-invalid', isIncorrect ? 'true' : 'false');
      }
    });
    if (data.complete) completeGame();
    else showMessage(incorrect.size ? 'Some entries need another look.' : 'So far, every filled number is correct.', !incorrect.size);
  } catch (error) { showMessage(error.message); }
}

async function giveHint() {
  try {
    const response = await fetch('/hint', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ board: getBoard() }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not provide a hint.');
    const index = cellIndex(data.row, data.col); const cell = getCells()[index];
    if (!cell || cell.disabled) return;
    cell.value = String(data.value);
    cell.disabled = true;
    cell.classList.add('prefilled', 'hinted');
    cell.classList.remove('invalid');
    cell.setAttribute('aria-invalid', 'false');
    cell.setAttribute('aria-label', `Row ${data.row + 1}, column ${data.col + 1}, hinted value ${data.value}, not editable`);
    locked.add(index);
    hinted.add(index);
    hintsUsed += 1;
    showMessage('A correct number has been added and locked in.', true);
  } catch (error) { showMessage(error.message); }
}

function readScores() {
  try {
    const scores = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    if (!Array.isArray(scores)) return [];
    return scores.filter((score) => score
      && typeof score.name === 'string'
      && Number.isFinite(score.time) && score.time >= 0
      && ['easy', 'medium', 'hard'].includes(score.difficulty)
      && Number.isInteger(score.hints) && score.hints >= 0)
      .sort((a, b) => a.time - b.time)
      .slice(0, 10);
  } catch {
    return [];
  }
}
function renderScores() {
  const scores = readScores(); const list = document.getElementById('score-list'); const empty = document.getElementById('empty-scores');
  list.replaceChildren(); empty.hidden = scores.length > 0;
  scores.slice(0, 10).forEach((score, index) => {
    const item = document.createElement('li');
    const rank = document.createElement('span'); rank.className = 'score-rank'; rank.textContent = String(index + 1).padStart(2, '0');
    const details = document.createElement('span'); details.textContent = score.name;
    const sub = document.createElement('small'); sub.className = 'score-detail'; sub.textContent = `${score.difficulty} · ${score.hints} hints`;
    details.append(document.createElement('br'), sub);
    const time = document.createElement('span'); time.className = 'score-time'; time.textContent = formatTime(score.time);
    item.append(rank, details, time); list.append(item);
  });
}
function completeGame() {
  if (solved) return;
  solved = true; clearInterval(timerHandle); updateTimer();
  showMessage(`Puzzle solved in ${formatTime(elapsedSeconds)}. Great work!`, true);
  const name = (document.getElementById('player-name').value.trim() || 'Player').slice(0, 24);
  const difficulty = document.getElementById('difficulty').value;
  const scores = [...readScores(), { name, time: elapsedSeconds, difficulty, hints: hintsUsed, date: new Date().toISOString() }]
    .sort((a, b) => a.time - b.time).slice(0, 10);
  try { localStorage.setItem(SCORES_KEY, JSON.stringify(scores)); } catch { showMessage('Solved! Browser storage is unavailable, so this score could not be saved.', true); }
  renderScores();
}

function initTheme() {
  const button = document.getElementById('theme-toggle');
  try {
    const enabled = localStorage.getItem(THEME_KEY) === 'true';
    document.body.classList.toggle('dark', enabled);
    if (button) {
      button.setAttribute('aria-pressed', String(enabled));
      button.querySelector('span').textContent = enabled ? 'Light mode' : 'Dark mode';
    }
  } catch {
    document.body.classList.remove('dark');
    if (button) {
      button.setAttribute('aria-pressed', 'false');
      button.querySelector('span').textContent = 'Dark mode';
    }
  }
}

document.getElementById('new-game').addEventListener('click', newGame);
document.getElementById('difficulty').addEventListener('change', newGame);
document.getElementById('check-solution').addEventListener('click', checkPuzzle);
document.getElementById('hint-button').addEventListener('click', giveHint);
boardElement.addEventListener('input', handleInput);
boardElement.addEventListener('keydown', handleCellKeydown);
document.getElementById('theme-toggle').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const enabled = !document.body.classList.contains('dark');
  document.body.classList.toggle('dark', enabled);
  try {
    localStorage.setItem(THEME_KEY, String(enabled));
  } catch {
    // Leave the current theme in the page if storage is unavailable.
  }
  button.setAttribute('aria-pressed', String(enabled));
  button.querySelector('span').textContent = enabled ? 'Light mode' : 'Dark mode';
});
document.getElementById('player-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('player-name').value.trim();
  if (name) localStorage.setItem('sudoku-studio-player', name.slice(0, 24));
});

initTheme();
document.getElementById('player-name').value = localStorage.getItem('sudoku-studio-player') || '';
renderScores();
newGame();
