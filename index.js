const COLS = 15;
const ROWS = 15;
const CELL_SIZE = 35;

let maze = [];
let playerRow = 0;
let playerCol = 0;
const exitRow = ROWS - 1;
const exitCol = COLS - 1;
let timerInterval = null;
let seconds = 0;
let gameOver = false;

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.walls = { top: true, right: true, bottom: true, left: true };
        this.visited = false;
    }
}

function generateMaze() {
    maze = [];
    for (let r = 0; r < ROWS; r++) {
        maze[r] = [];
        for (let c = 0; c < COLS; c++) {
            maze[r][c] = new Cell(r, c);
        }
    }

    const stack = [];
    const start = maze[0][0];
    start.visited = true;
    stack.push(start);

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = getUnvisitedNeighbors(current);

        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWalls(current, next);
            next.visited = true;
            stack.push(next);
        } else {
            stack.pop();
        }
    }
}

function getUnvisitedNeighbors(cell) {
    const neighbors = [];
    const { row, col } = cell;

    if (row > 0 && !maze[row - 1][col].visited) neighbors.push(maze[row - 1][col]);
    if (row < ROWS - 1 && !maze[row + 1][col].visited) neighbors.push(maze[row + 1][col]);
    if (col > 0 && !maze[row][col - 1].visited) neighbors.push(maze[row][col - 1]);
    if (col < COLS - 1 && !maze[row][col + 1].visited) neighbors.push(maze[row][col + 1]);

    return neighbors;
}

function removeWalls(a, b) {
    const dr = a.row - b.row;
    const dc = a.col - b.col;

    if (dr === 1) { a.walls.top = false; b.walls.bottom = false; }
    if (dr === -1) { a.walls.bottom = false; b.walls.top = false; }
    if (dc === 1) { a.walls.left = false; b.walls.right = false; }
    if (dc === -1) { a.walls.right = false; b.walls.left = false; }
}

function renderMaze() {
    const mazeEl = document.getElementById('maze');
    mazeEl.innerHTML = '';
    mazeEl.style.gridTemplateColumns = `repeat(${COLS}, ${CELL_SIZE}px)`;
    mazeEl.style.gridTemplateRows = `repeat(${ROWS}, ${CELL_SIZE}px)`;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = maze[r][c];
            const cellEl = document.createElement('div');
            cellEl.className = 'cell';

            if (r === exitRow && c === exitCol) {
                cellEl.classList.add('exit');
            }

            for (const dir of ['top', 'right', 'bottom', 'left']) {
                if (cell.walls[dir]) {
                    const wallEl = document.createElement('div');
                    wallEl.className = `wall ${dir}`;
                    cellEl.appendChild(wallEl);
                }
            }

            mazeEl.appendChild(cellEl);
        }
    }
}

function updatePlayerPosition() {
    const playerEl = document.getElementById('player');
    playerEl.style.width = `${CELL_SIZE - 6}px`;
    playerEl.style.height = `${CELL_SIZE - 6}px`;
    playerEl.style.left = `${playerCol * CELL_SIZE + 3}px`;
    playerEl.style.top = `${playerRow * CELL_SIZE + 3}px`;
}

function movePlayer(direction) {
    if (gameOver) return;

    const cell = maze[playerRow][playerCol];
    let newRow = playerRow;
    let newCol = playerCol;

    switch (direction) {
        case 'up':
            if (cell.walls.top) return;
            newRow--;
            break;
        case 'down':
            if (cell.walls.bottom) return;
            newRow++;
            break;
        case 'left':
            if (cell.walls.left) return;
            newCol--;
            break;
        case 'right':
            if (cell.walls.right) return;
            newCol++;
            break;
    }

    playerRow = newRow;
    playerCol = newCol;
    updatePlayerPosition();

    if (playerRow === exitRow && playerCol === exitCol) {
        gameOver = true;
        stopTimer();
        showMessage(`You escaped! Time: ${formatTime(seconds)}`);
    }
}

function startTimer() {
    seconds = 0;
    document.getElementById('timer').textContent = formatTime(0);
    timerInterval = setInterval(() => {
        seconds++;
        document.getElementById('timer').textContent = formatTime(seconds);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function showMessage(text) {
    document.getElementById('message-text').textContent = text;
    document.getElementById('message').style.display = 'block';
}

function hideMessage() {
    document.getElementById('message').style.display = 'none';
}

function initGame() {
    hideMessage();
    stopTimer();
    gameOver = false;
    playerRow = 0;
    playerCol = 0;

    generateMaze();
    renderMaze();
    updatePlayerPosition();
    startTimer();
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); movePlayer('up'); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); movePlayer('down'); break;
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); movePlayer('left'); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); movePlayer('right'); break;
    }
});

initGame();
