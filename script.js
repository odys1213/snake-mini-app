const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 40;
const gridSize = 10;

let dragon = [{ x: 5, y: 5 }];
let egg = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
let score = 0;
let direction = { x: 1, y: 0 };
let isGameOver = false;
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dragon.forEach(segment => drawCell(segment.x, segment.y, 'blue'));
    drawCell(egg.x, egg.y, 'yellow');
}

function updateGame() {
    if (isGameOver) return;
    const head = { x: dragon[0].x + direction.x, y: dragon[0].y + direction.y };
    if (head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize ||
        dragon.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }
    dragon.unshift(head);
    if (head.x === egg.x && head.y === egg.y) {
        score++;
        document.getElementById('score').innerText = `Score: ${score}`;
        egg = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
    } else {
        dragon.pop();
    }
    drawGame();
}

function changeDirection(newDirection) {
    const directions = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
    if (directions[newDirection] && opposite[newDirection] !== direction) {
        direction = directions[newDirection];
    }
}

function endGame() {
    isGameOver = true;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').style.display = 'block';
    saveScore();
}

function restartGame() {
    dragon = [{ x: 5, y: 5 }];
    direction = { x: 1, y: 0 };
    score = 0;
    isGameOver = false;
    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('game-over').style.display = 'none';
    drawGame();
}

function saveScore() {
    const name = prompt('Enter your name:') || 'Anonymous';
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    updateLeaderboard();
}

function updateLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score}`;
        list.appendChild(li);
    });
    document.getElementById('leaderboard').style.display = 'block';
}

setInterval(updateGame, 200);
drawGame();
