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
    let gameSpeed = 1; // in milliseconds
    let gameInterval;

    function getRandomPosition() {
        return {
            x: Math.floor(Math.random() * gridCount),
            y: Math.floor(Math.random() * gridCount)
        };
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Рисуем змейку
        ctx.fillStyle = 'green';
        snake.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });

        // Рисуем еду
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

    // Проверка, если змейка съела еду
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        food = getRandomPosition();
        gameSpeed = Math.max(gameSpeed - 5, 50); // Уменьшаем скорость, но не ниже 50
    } else {
        snake.pop(); // Удаляем последний сегмент змейки
    }

    // Проверка, если игра окончена
    if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount || checkSelfCollision()) {
        alert(`Game over, score: ${score}`);
        playAgainButton.style.display = 'inline-block'; // Показываем кнопку "Играть снова"
        return;
    }

    draw();
    requestAnimationFrame(update); // Используем requestAnimationFrame для плавной анимации
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

    function handleKeyDown(event) {
        switch (event.key) {
            case 'ArrowUp':
                if (direction !== 'down') direction = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') direction = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') direction = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') direction = 'right';
                break;
        }
    }

    // Управление касанием
    let touchStartX;
    let touchStartY;

    canvas.addEventListener('touchstart', function(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    });

    canvas.addEventListener('touchmove', function(event) {
        event.preventDefault(); // Предотвращаем прокрутку страницы
    });

    canvas.addEventListener('touchend', function(event) {
        if (!touchStartX || !touchStartY) {
            return;
        }

        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;

        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && direction !== 'left') {
                direction = 'right';
            } else if (dx < 0 && direction !== 'right') {
                direction = 'left';
            }
        } else {
            if (dy > 0 && direction !== 'up') {
                direction = 'down';
            } else if (dy < 0 && direction !== 'down') {
                direction = 'up';
            }
        }

        touchStartX = null;
        touchStartY = null;
    });

    document.addEventListener('keydown', handleKeyDown);
    
    function startGame() {
        snake = [{ x: 10, y: 10 }];
        food = getRandomPosition();
        direction = 'right';
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        gameSpeed = 120;

        playAgainButton.style.display = 'none'; // Скрываем кнопку "Играть снова"

        requestAnimationFrame(update); // Начинаем игру с плавной анимацией
    }

    playAgainButton.onclick = startGame; // Назначаем обработчик клика для кнопки "Играть снова"
    startGame(); // Запускаем игру при загрузке
});
