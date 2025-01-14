document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const playAgainButton = document.getElementById('playAgainButton');

    const gridSize = 15;
    const gridCount = canvas.width / gridSize;
    let snake = [{ x: 10, y: 10 }];
    let food = getRandomPosition();
    let direction = 'right';
    let score = 0;
    let gameSpeed = 120; // Установим начальную скорость
    let gameInterval;

    function getRandomPosition() {
        return {
            x: Math.floor(Math.random() * gridCount),
            y: Math.floor(Math.random() * gridCount)
        };
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'green';
        snake.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });

        ctx.fillStyle = 'red';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    }

    let lastUpdateTime = 0;

    function update(timestamp) {
        if (timestamp - lastUpdateTime < gameSpeed) {
            requestAnimationFrame(update);
            return;
        }
        lastUpdateTime = timestamp;

        const head = { ...snake[0] };

        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
            food = getRandomPosition();
            gameSpeed = Math.max(gameSpeed - 5, 50);
        } else {
            snake.pop();
        }

        if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount || checkSelfCollision()) {
            alert(`Game over, score: ${score}`);
            playAgainButton.style.display = 'inline-block';
            return;
        }

        draw();
        requestAnimationFrame(update);
    }

    function checkSelfCollision() {
        const head = snake[0];
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        return false;
    }

    // Обработчики событий для кнопок управления
    document.getElementById('upButton').addEventListener('mousedown', () => {
        if (direction !== 'down') direction = 'up';
    });

    document.getElementById('downButton').addEventListener('mousedown', () => {
        if (direction !== 'up') direction = 'down';
    });

    document.getElementById('leftButton').addEventListener('mousedown', () => {
        if (direction !== 'right') direction = 'left';
    });

    document.getElementById('rightButton').addEventListener('mousedown', () => {
        if (direction !== 'left') direction = 'right';
    });

    function startGame() {
        snake = [{ x: 10, y: 10 }];
        food = getRandomPosition();
        direction = 'right';
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        gameSpeed = 120;

        playAgainButton.style.display = 'none';

        requestAnimationFrame(update);
    }

    playAgainButton.onclick = startGame;
    document.addEventListener('keydown', handleKeyDown);
    startGame();
});
