var GRID_SIZE = 10;
var MEMORIZE_TIME = 10;
var MOVE_TIME = 20;
var MAX_LIVES = 5;

var walls = [];
var startRow, startCol, finishRow, finishCol;
var playerRow, playerCol;
var stageNumber = 1;
var lives = MAX_LIVES;
var username = '';
var gameState = 'welcome';
var timeLeft = 0;
var timerInterval = null;
var hintUsed = false;
var hintTimer = null;
var canMove = false;

var savedWalls = [];
var savedStartRow, savedStartCol, savedFinishRow, savedFinishCol;

var welcomeScreen, gameScreen, playerElement, hintButton;
var stageDisplay, timerDisplay, livesDisplay, phaseDisplay, playerNameDisplay;
var gameOverName, gameOverStage, leaderboardBody, leaderboardEmpty;

function getElement(id) {
    return document.getElementById(id);
}

function init() {
    welcomeScreen = getElement('welcome');
    gameScreen = getElement('game');
    playerElement = getElement('pawn');
    stageDisplay = getElement('barStage');
    timerDisplay = getElement('barTime');
    livesDisplay = getElement('barLives');
    phaseDisplay = getElement('barPhase');
    playerNameDisplay = getElement('barName');
    gameOverName = getElement('overName');
    gameOverStage = getElement('overStage');
    leaderboardBody = getElement('leadBody');
    leaderboardEmpty = getElement('leadEmpty');
    hintButton = getElement('hintBtn');

    getElement('nameInput').oninput = function () {
        getElement('playBtn').disabled = this.value.trim() === '';
    };

    getElement('playBtn').onclick = startGame;
    getElement('instrBtn').onclick = function () {
        getElement('modalInstr').style.display = 'flex';
    };
    getElement('leadBtn').onclick = function () {
        refreshLeaderboard();
        getElement('modalLead').style.display = 'flex';
    };
    hintButton.onclick = useHint;
    getElement('saveBtn').onclick = saveScore;

    var closeButtons = document.querySelectorAll('.x');
    for (var i = 0; i < closeButtons.length; i++) {
        closeButtons[i].onclick = function () {
            getElement(this.getAttribute('data-close')).style.display = 'none';
        };
    }

    var modals = document.querySelectorAll('.modal');
    for (var i = 0; i < modals.length; i++) {
        modals[i].onclick = function (event) {
            if (event.target === this) {
                this.style.display = 'none';
                if (this === getElement('modalOver')) {
                    goToWelcome();
                }
            }
        };
    }

    document.onkeydown = function (event) {
        if (!canMove) return;
        var direction = null;
        if (event.key === 'ArrowUp') {
            direction = 'up';
            event.preventDefault();
        } else if (event.key === 'ArrowDown') {
            direction = 'down';
            event.preventDefault();
        } else if (event.key === 'ArrowLeft') {
            direction = 'left';
            event.preventDefault();
        } else if (event.key === 'ArrowRight') {
            direction = 'right';
            event.preventDefault();
        }
        if (direction) {
            movePlayer(direction);
        }
    };
}

function goToWelcome() {
    gameScreen.style.display = 'none';
    welcomeScreen.style.display = 'block';
    gameState = 'welcome';
    clearInterval(timerInterval);
}

function startGame() {
    username = getElement('nameInput').value.trim();
    if (!username) return;

    stageNumber = 1;
    lives = MAX_LIVES;
    gameState = 'memorizing';

    welcomeScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    playerNameDisplay.textContent = 'Player: ' + username;

    generateNewStage();
}

function generateNewStage() {
    generateWalls();

    savedWalls = [];
    for (var row = 0; row < GRID_SIZE; row++) {
        savedWalls[row] = [];
        for (var col = 0; col < GRID_SIZE; col++) {
            savedWalls[row][col] = walls[row][col];
        }
    }
    savedStartRow = startRow;
    savedStartCol = startCol;
    savedFinishRow = finishRow;
    savedFinishCol = finishCol;

    renderGrid();
    startMemorizing();
}

function restartStage() {
    walls = [];
    for (var row = 0; row < GRID_SIZE; row++) {
        walls[row] = [];
        for (var col = 0; col < GRID_SIZE; col++) {
            walls[row][col] = savedWalls[row][col];
        }
    }
    startRow = savedStartRow;
    startCol = savedStartCol;
    finishRow = savedFinishRow;
    finishCol = savedFinishCol;

    renderGrid();
    startMemorizing();
}

function isStartOrFinish(row, col) {
    return (row === startRow && col === startCol) ||
           (row === finishRow && col === finishCol);
}

function placeWallSegment() {
    var row = Math.floor(Math.random() * GRID_SIZE);
    var col = Math.floor(Math.random() * GRID_SIZE);
    if (isStartOrFinish(row, col)) return;

    var type = Math.floor(Math.random() * 4);
    var length = 2 + Math.floor(Math.random() * 3);

    if (type === 0) {
        for (var i = 0; i < length; i++) {
            var nc = col + i;
            if (nc < GRID_SIZE && !isStartOrFinish(row, nc)) {
                walls[row][nc] = true;
            } else break;
        }
    } else if (type === 1) {
        for (var i = 0; i < length; i++) {
            var nr = row + i;
            if (nr < GRID_SIZE && !isStartOrFinish(nr, col)) {
                walls[nr][col] = true;
            } else break;
        }
    } else if (type === 2) {
        var hlen = 1 + Math.floor(Math.random() * 2);
        var vlen = 1 + Math.floor(Math.random() * 2);
        for (var i = 0; i < hlen; i++) {
            var nc = col + i;
            if (nc < GRID_SIZE && !isStartOrFinish(row, nc)) {
                walls[row][nc] = true;
            } else break;
        }
        for (var i = 1; i <= vlen; i++) {
            var nr = row + i;
            if (nr < GRID_SIZE && !isStartOrFinish(nr, col)) {
                walls[nr][col] = true;
            } else break;
        }
    } else {
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < 2; j++) {
                var nr = row + i;
                var nc = col + j;
                if (nr < GRID_SIZE && nc < GRID_SIZE && !isStartOrFinish(nr, nc)) {
                    walls[nr][nc] = true;
                }
            }
        }
    }
}

function generateWalls() {
    startRow = Math.floor(Math.random() * GRID_SIZE);
    startCol = 0;
    finishRow = Math.floor(Math.random() * GRID_SIZE);
    finishCol = GRID_SIZE - 1;

    walls = [];
    for (var row = 0; row < GRID_SIZE; row++) {
        walls[row] = [];
        for (var col = 0; col < GRID_SIZE; col++) {
            walls[row][col] = false;
        }
    }

    var segmentCount = 6 + Math.floor(Math.random() * 4);
    for (var i = 0; i < segmentCount; i++) {
        placeWallSegment();
    }

    ensurePathExists();
}

function runBfs(startRowBfs, startColBfs) {
    var visited = [];
    for (var row = 0; row < GRID_SIZE; row++) {
        visited[row] = [];
        for (var col = 0; col < GRID_SIZE; col++) {
            visited[row][col] = false;
        }
    }

    var queue = [{ row: startRowBfs, col: startColBfs }];
    visited[startRowBfs][startColBfs] = true;
    var head = 0;
    var directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (head < queue.length) {
        var current = queue[head++];
        for (var d = 0; d < directions.length; d++) {
            var nextRow = current.row + directions[d][0];
            var nextCol = current.col + directions[d][1];
            if (nextRow >= 0 && nextRow < GRID_SIZE &&
                nextCol >= 0 && nextCol < GRID_SIZE &&
                !visited[nextRow][nextCol] &&
                !walls[nextRow][nextCol]) {
                visited[nextRow][nextCol] = true;
                queue.push({ row: nextRow, col: nextCol });
            }
        }
    }
    return visited;
}

function ensurePathExists() {
    var reachable = runBfs(startRow, startCol);

    while (!reachable[finishRow][finishCol]) {
        var candidates = [];
        var directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (var row = 0; row < GRID_SIZE; row++) {
            for (var col = 0; col < GRID_SIZE; col++) {
                if (!walls[row][col]) continue;
                var adjacentToReachable = false;
                for (var d = 0; d < directions.length; d++) {
                    var neighborRow = row + directions[d][0];
                    var neighborCol = col + directions[d][1];
                    if (neighborRow >= 0 && neighborRow < GRID_SIZE &&
                        neighborCol >= 0 && neighborCol < GRID_SIZE &&
                        reachable[neighborRow][neighborCol]) {
                        adjacentToReachable = true;
                        break;
                    }
                }
                if (adjacentToReachable) {
                    candidates.push({ row: row, col: col });
                }
            }
        }

        if (candidates.length > 0) {
            var pick = Math.floor(Math.random() * candidates.length);
            walls[candidates[pick].row][candidates[pick].col] = false;
        } else {
            for (var row = 0; row < GRID_SIZE; row++) {
                for (var col = 0; col < GRID_SIZE; col++) {
                    walls[row][col] = false;
                }
            }
            break;
        }
        reachable = runBfs(startRow, startCol);
    }
}

function renderGrid() {
    getElement('grid').innerHTML = '';
    for (var row = 0; row < GRID_SIZE; row++) {
        for (var col = 0; col < GRID_SIZE; col++) {
            var cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = 'cell_' + row + '_' + col;

            if (row === startRow && col === startCol) {
                cell.classList.add('s');
            } else if (row === finishRow && col === finishCol) {
                cell.classList.add('f');
            } else if (walls[row][col]) {
                cell.classList.add('w');
            }
            getElement('grid').appendChild(cell);
        }
    }
    playerRow = startRow;
    playerCol = startCol;
    updatePlayerPosition();
}

function showWalls(visible) {
    for (var row = 0; row < GRID_SIZE; row++) {
        for (var col = 0; col < GRID_SIZE; col++) {
            if (!walls[row][col]) continue;
            var cell = getElement('cell_' + row + '_' + col);
            if (visible) {
                cell.classList.remove('h');
                cell.classList.add('w');
            } else {
                cell.classList.remove('w');
                cell.classList.add('h');
            }
        }
    }
}

function updatePlayerPosition() {
    playerElement.style.left = (playerCol * 48 + 5) + 'px';
    playerElement.style.top = (playerRow * 48 + 5) + 'px';
}

function updateLivesDisplay() {
    var text = '';
    for (var i = 0; i < lives; i++) {
        text += '\u2665';
    }
    for (var i = lives; i < MAX_LIVES; i++) {
        text += '\u2661';
    }
    livesDisplay.textContent = text;
}

function startMemorizing() {
    gameState = 'memorizing';
    canMove = false;
    hintUsed = false;
    hintButton.disabled = true;

    if (hintTimer) {
        clearTimeout(hintTimer);
        hintTimer = null;
    }

    phaseDisplay.textContent = 'MEMORIZE';
    stageDisplay.textContent = stageNumber;
    updateLivesDisplay();

    showWalls(true);

    timeLeft = MEMORIZE_TIME;
    timerDisplay.textContent = timeLeft;

    clearInterval(timerInterval);
    timerInterval = setInterval(function () {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            startMoving();
        }
    }, 1000);
}

function startMoving() {
    gameState = 'moving';
    canMove = true;
    hintButton.disabled = false;

    phaseDisplay.textContent = 'MOVE!';

    showWalls(false);

    timeLeft = MOVE_TIME;
    timerDisplay.textContent = timeLeft;

    clearInterval(timerInterval);
    timerInterval = setInterval(function () {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            onTimeUp();
        }
    }, 1000);
}

function movePlayer(direction) {
    if (!canMove || gameState === 'gameover') return;

    var newRow = playerRow;
    var newCol = playerCol;

    if (direction === 'up') newRow--;
    else if (direction === 'down') newRow++;
    else if (direction === 'left') newCol--;
    else if (direction === 'right') newCol++;

    if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) return;

    if (walls[newRow][newCol]) {
        canMove = false;
        clearInterval(timerInterval);
        alert('Hit a wall!');
        loseLife();
        return;
    }

    playerRow = newRow;
    playerCol = newCol;
    updatePlayerPosition();

    if (playerRow === finishRow && playerCol === finishCol) {
        canMove = false;
        clearInterval(timerInterval);
        alert('Stage ' + stageNumber + ' Complete!');
        stageNumber++;
        generateNewStage();
    }
}

function loseLife() {
    lives--;
    updateLivesDisplay();
    if (lives <= 0) {
        gameOver();
    } else {
        restartStage();
    }
}

function onTimeUp() {
    canMove = false;
    alert('Time is up!');
    loseLife();
}

function useHint() {
    if (hintUsed || gameState !== 'moving') return;
    hintUsed = true;
    hintButton.disabled = true;

    showWalls(true);

    if (hintTimer) clearTimeout(hintTimer);
    hintTimer = setTimeout(function () {
        showWalls(false);
        hintTimer = null;
    }, 1000);
}

function gameOver() {
    gameState = 'gameover';
    canMove = false;
    clearInterval(timerInterval);

    if (hintTimer) {
        clearTimeout(hintTimer);
        hintTimer = null;
    }

    gameOverName.textContent = username;
    gameOverStage.textContent = stageNumber;
    getElement('modalOver').style.display = 'flex';
    gameScreen.style.display = 'none';
    welcomeScreen.style.display = 'none';
}

function saveScore() {
    var scores = JSON.parse(localStorage.getItem('blindmaze_scores') || '[]');
    scores.push({
        username: username,
        stage: stageNumber,
        date: new Date().toISOString()
    });
    scores.sort(function (a, b) { return b.stage - a.stage; });
    localStorage.setItem('blindmaze_scores', JSON.stringify(scores));

    getElement('modalOver').style.display = 'none';
    refreshLeaderboard();
    getElement('modalLead').style.display = 'flex';
    goToWelcome();
}

function refreshLeaderboard() {
    var scores = JSON.parse(localStorage.getItem('blindmaze_scores') || '[]');
    scores.sort(function (a, b) { return b.stage - a.stage; });

    leaderboardBody.innerHTML = '';
    if (scores.length === 0) {
        leaderboardEmpty.style.display = 'block';
        return;
    }
    leaderboardEmpty.style.display = 'none';

    for (var i = 0; i < scores.length; i++) {
        var row = document.createElement('tr');
        row.innerHTML = '<td>' + (i + 1) + '</td><td>' +
            escapeHtml(scores[i].username) + '</td><td>' +
            scores[i].stage + '</td>';
        leaderboardBody.appendChild(row);
    }
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

init();
