document.addEventListener("DOMContentLoaded", function() {
    const Telegram = window.Telegram;
    if (Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready(); // Уведомляем Telegram, что Mini App готов

        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreDisplay = document.getElementById('score');
        const controls = document.querySelectorAll('.controls button');

        const gridSize = 20; // Размер ячейки
        let snake = [{ x: 10, y: 10 }]; // Начальное положение змейки
        let food = generateFood(); // Начальное положение еды
        let direction = 'right'; // Начальное направление
        let score = 0; // Счет
        let gameSpeed = 150; // Скорость игры (в миллисекундах)
        let gameRunning = true;

        function generateFood() {
            let foodPosition;
            while (!foodPosition || snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y)) {
                foodPosition = {
                    x: Math.floor(Math.random() * (canvas.width / gridSize)),
                    y: Math.floor(Math.random() * (canvas.height / gridSize))
                };
            }
            return foodPosition;
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Рисуем еду
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
            ctx.fill();

            // Рисуем змейку
            ctx.fillStyle = 'green';
            snake.forEach(segment => {
                ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            });
        }

        function moveSnake() {
            const head = { x: snake[0].x, y: snake[0].y };

            switch (direction) {
                case 'up': head.y--; break;
                case 'down': head.y++; break;
                case 'left': head.x--; break;
                case 'right': head.x++; break;
            }

            if (checkCollision(head)) {
                gameOver();
                return;
            }

            snake.unshift(head); // Добавляем новую голову

            if (head.x === food.x && head.y === food.y) {
                score++;
                scoreDisplay.textContent = 'Счет: ' + score;
                food = generateFood(); // Генерируем новую еду
            } else {
                snake.pop(); // Убираем хвост, если не съели еду
            }
        }

        function checkCollision(head) {
            // Столкновение со стенами
            if (head.x < 0 || head.x * gridSize >= canvas.width || head.y < 0 || head.y * gridSize >= canvas.height) {
                return true;
            }

            // Столкновение с собой
            for (let i = 1; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    return true;
                }
            }
            return false;
        }

        function gameOver() {
            gameRunning = false;
            alert('Игра окончена! Ваш счет: ' + score);
             // Здесь можно добавить логику перезапуска игры или отправки данных в бот
        }

        function gameLoop() {
            if (!gameRunning) return;

            moveSnake();
            draw();
            setTimeout(gameLoop, gameSpeed);
        }

        controls.forEach(button => {
            button.addEventListener('click', function() {
                const control = this.id;
                if (control === 'up' && direction !== 'down') direction = 'up';
                if (control === 'down' && direction !== 'up') direction = 'down';
                if (control === 'left' && direction !== 'right') direction = 'left';
                if (control === 'right' && direction !== 'left') direction = 'right';
            });
        });

        // Запуск игры при загрузке страницы
        gameLoop();
    } else {
        console.error("Telegram Web App API не найден.");
        alert("Telegram Web App API не найден. Запустите Mini App в Telegram.");
    }
});
