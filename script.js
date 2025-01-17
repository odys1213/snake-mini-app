const tg = window.Telegram.WebApp;
tg.expand();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const leaderboardList = document.querySelector('#leaderboard ul');
const startButton = document.getElementById('startButton');
const explanationsDiv = document.getElementById('explanations');

const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let direction = 'right';
let score = 0;
let gameLoop;
let isGameOver = false;

let touchStartX = 0;
let touchStartY = 0;

const neonColors = {
    shield: 'mediumorchid',
    trampoline: 'yellow',
    speed: 'aqua',
};

const specialApples = [
    { type: '', description: 'Делает змейку неуязвимой и позволяет проходить сквозь стены на 5 секунд.', color: 'shield' },
    { type: '', description: 'Змейка прыгает на 2 клетки вперед.', color: 'trampoline' },
    { type: '', description: 'Увеличивает скорость змейки на 3 секунды.', color: 'speed' },
];

let currentApple = {};
let hasShield = false;
let speedBoostActive = false;
let currentSpeed = 100;

function generateFood() {
    const randomIndex = Math.floor(Math.random() * specialApples.length);
    currentApple = {
        type: specialApples[randomIndex].type,
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем "яблоко"
    if (currentApple.type) {
        ctx.fillStyle = neonColors[currentApple.type];
    } else {
        ctx.fillStyle = 'red'; // Цвет обычного яблока
    }
    ctx.fillRect(currentApple.x * gridSize, currentApple.y * gridSize, gridSize, gridSize);

    // Рисуем змейку
    ctx.fillStyle = hasShield ? 'lightgreen' : 'lime';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

function update() {
    if (isGameOver) return;

    const head = { ...snake[0] };
    let newHead = { ...head }; // Создаем копию головы для обработки обертывания

    switch (direction) {
        case 'up':
            newHead.y--;
            break;
        case 'down':
            newHead.y++;
            break;
        case 'left':
            newHead.x--;
            break;
        case 'right':
            newHead.x++;
            break;
    }

    // Проверка столкновения со стенами
    if (newHead.x < 0 && hasShield) {
        newHead.x = canvas.width / gridSize - 1;
    } else if (newHead.x >= canvas.width / gridSize && hasShield) {
        newHead.x = 0;
    } else if (newHead.y < 0 && hasShield) {
        newHead.y = canvas.height / gridSize - 1;
    } else if (newHead.y >= canvas.height / gridSize && hasShield) {
        newHead.y = 0;
    } else if (newHead.x < 0 || newHead.x >= canvas.width / gridSize || newHead.y < 0 || newHead.y >= canvas.height / gridSize) {
        gameOver();
        return;
    }

    // Проверка столкновения с собой (если нет щита)
    if (!hasShield && snake.slice(1).some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return;
    }

    snake.unshift(newHead);

    // Проверка съедания "яблока"
    if (newHead.x === currentApple.x && newHead.y === currentApple.y) {
        score++;
        scoreDisplay.textContent = score;
        applyAppleEffect(currentApple.type);
        generateFood();
    } else {
        snake.pop();
    }

    draw();
}

function applyAppleEffect(appleType) {
    switch (appleType) {
        case 'shield':
            hasShield = true;
            setTimeout(() => {
                hasShield = false;
            }, 5000); // Щит действует 5 секунд
            break;
        case 'trampoline':
            const head = { ...snake[0] };
            let newHead = { ...head };
            for (let i = 0; i < 2; i++) {
                switch (direction) {
                    case 'up': newHead.y--; break;
                    case 'down': newHead.y++; break;
                    case 'left': newHead.x--; break;
                    case 'right': newHead.x++; break;
                }
            }
            snake.unshift(newHead);
            snake.pop();
            break;
        case 'speed':
            if (!speedBoostActive) {
                speedBoostActive = true;
                clearInterval(gameLoop);
                currentSpeed = 50;
                gameLoop = setInterval(update, currentSpeed);
                setTimeout(() => {
                    speedBoostActive = false;
                    clearInterval(gameLoop);
                    currentSpeed = 100;
                    gameLoop = setInterval(update, currentSpeed);
                }, 3000); // Ускорение на 3 секунды
            }
            break;
    }
}

function changeDirection(newDirection) {
    if (newDirection === 'up' && direction !== 'down') direction = 'up';
    if (newDirection === 'down' && direction !== 'up') direction = 'down';
    if (newDirection === 'left' && direction !== 'right') direction = 'left';
    if (newDirection === 'right' && direction !== 'left') direction = 'right';
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    alert(`Игра окончена! Ваш счет: ${score}`);
    submitScore(score);
    startButton.style.display = 'block';
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    scoreDisplay.textContent = score;
    isGameOver = false;
    hasShield = false;
    speedBoostActive = false;
    currentSpeed = 100;
    clearInterval(gameLoop);
    gameLoop = setInterval(update, currentSpeed);
    generateFood();
    draw();
}

function startGame() {
    resetGame();
    startButton.style.display = 'none';
}

async function submitScore(finalScore) {
    const initData = tg.initDataUnsafe;
    const userId = initData.user.id;
    const username = initData.user.username || initData.user.first_name || 'Игрок';

    try {
        const response = await fetch('/submit_score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                username: username,
                score: finalScore
            })
        });
        if (!response.ok) {
            console.error('Ошибка отправки счета:', response.status);
        }
        fetchLeaderboard();
    } catch (error) {
        console.error('Ошибка отправки счета:', error);
    }
}

async function fetchLeaderboard() {
    try {
        const response = await fetch('/leaderboard');
        if (!response.ok) {
            console.error('Ошибка получения лидеров:', response.status);
            return;
        }
        const data = await response.json();
        leaderboardList.innerHTML = '';
        data.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.username}: ${item.score}`;
            leaderboardList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Ошибка получения лидеров:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    specialApples.forEach(apple => {
        const explanationItem = document.createElement('div');
        explanationItem.classList.add('explanation-item');

        const colorIndicator = document.createElement('div');
        colorIndicator.classList.add('apple-color-indicator');
        colorIndicator.style.backgroundColor = neonColors[apple.color];

        const text = document.createTextNode(`${apple.type}: ${apple.description}`);

        explanationItem.appendChild(colorIndicator);
        explanationItem.appendChild(text);
        explanationsDiv.appendChild(explanationItem);
    });
});

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            changeDirection('up');
            break;
        case 'ArrowDown':
            changeDirection('down');
            break;
        case 'ArrowLeft':
            changeDirection('left');
            break;
        case 'ArrowRight':
            changeDirection('right');
            break;
    }
});

startButton.addEventListener('click', startGame);

canvas.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

canvas.addEventListener('touchend', (event) => {
    if (!touchStartX || !touchStartY) {
        return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            changeDirection('right');
        } else {
            changeDirection('left');
        }
    } else {
        if (deltaY > 0) {
            changeDirection('down');
        } else {
            changeDirection('up');
        }
    }

    touchStartX = 0;
    touchStartY = 0;
});

generateFood();
draw();
fetchLeaderboard();