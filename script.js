document.addEventListener("DOMContentLoaded", function() {
    const tg = window.Telegram ? window.Telegram.WebApp : null;
    let authToken = localStorage.getItem('authToken');
    let telegramId = localStorage.getItem('telegramId');
    const BACKEND_BASE_URL = 'https://your-game-backend.example.com';

    async function verifyTelegramData(initData) {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/verify_telegram_data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ init_data: initData })
            });

            if (!response.ok) {
                console.error(`Ошибка проверки данных Telegram. Статус: ${response.status}`);
                return { success: false };
            }
            const data = await response.json();
            if (data.success) {
                return { success: true, telegram_id: data.telegram_id, auth_token: data.auth_token };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Ошибка сети при проверке данных Telegram:', error);
            return { success: false, error: 'Сетевая ошибка при проверке данных Telegram.' };
        }
    }

    if (tg) {
        tg.expand();
        document.body.classList.add('telegram-webapp');

        const initData = tg.initData;

        async function initializeWebApp() {
            if (initData) {
                const verificationResult = await verifyTelegramData(initData);
                if (verificationResult.success) {
                    authToken = verificationResult.auth_token;
                    telegramId = verificationResult.telegram_id;
                    localStorage.setItem('authToken', authToken);
                    localStorage.setItem('telegramId', telegramId);
                    console.log('Данные Telegram подтверждены. Telegram ID:', telegramId);
                    fetchProfile();
                } else {
                    console.error('Ошибка проверки данных Telegram:', verificationResult.error);
                    alert(`Ошибка авторизации: ${verificationResult.error || 'Не удалось подтвердить данные Telegram.'}`);
                }
            } else {
                console.warn('initData отсутствует. Вы запущено не в Telegram Mini App?');
                if (telegramId) {
                    fetchProfile();
                }
            }
        }

        initializeWebApp();

    } else {
        console.log('Запущено не в Telegram Mini App.');
        if (authToken && telegramId) {
            fetchProfile();
        } else {
            console.warn('Запущено не в Telegram и не найден токен авторизации/telegramId. Некоторые функции могут быть ограничены.');
        }
    }

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const leaderboardList = document.querySelector('#leaderboardList');
    const prizesList = document.querySelector('#prizes > ul');
    const startButton = document.getElementById('startButton');
    const explanationsDiv = document.getElementById('explanations');
    const settingsButton = document.getElementById('settingsButton');
    const historyButton = document.getElementById('historyButton');
    const settingsModal = document.getElementById('settingsModal');
    const telegramInfoDiv = document.getElementById('telegramInfo');
    const telegramUsernameDisplay = document.getElementById('telegramUsername');
    const highScoreDiv = document.getElementById('highScore');
    const logoutButton = document.getElementById('logoutButton');
    const closeSettingsModalButton = document.getElementById('closeSettingsModal');
    const telegramAvatar = document.getElementById('telegramAvatar');

    const totalCellsDisplay = document.createElement('p');
    const totalApplesDisplay = document.createElement('p');
    const shieldsCollectedDisplay = document.createElement('p');
    const trampolinesCollectedDisplay = document.createElement('p');
    const speedBoostsCollectedDisplay = document.createElement('p');

    telegramInfoDiv.appendChild(totalCellsDisplay);
    telegramInfoDiv.appendChild(totalApplesDisplay);
    telegramInfoDiv.appendChild(shieldsCollectedDisplay);
    telegramInfoDiv.appendChild(trampolinesCollectedDisplay);
    telegramInfoDiv.appendChild(speedBoostsCollectedDisplay);

    const historyModal = document.createElement('div');
    historyModal.id = 'historyModal';
    historyModal.style.display = 'none';
    historyModal.style.position = 'fixed';
    historyModal.style.top = '50%';
    historyModal.style.left = '50%';
    historyModal.style.transform = 'translate(-50%, -50%)';
    historyModal.style.backgroundColor = '#444';
    historyModal.style.padding = '20px';
    historyModal.style.borderRadius = '8px';
    historyModal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    historyModal.style.zIndex = '1001';
    historyModal.style.color = '#eee';
    historyModal.style.maxHeight = '70vh';
    historyModal.style.overflowY = 'auto';
    const closeHistoryModalButton = document.createElement('span');
    closeHistoryModalButton.textContent = 'X';
    closeHistoryModalButton.style.position = 'absolute';
    closeHistoryModalButton.style.top = '10px';
    closeHistoryModalButton.style.right = '10px';
    closeHistoryModalButton.style.cursor = 'pointer';
    closeHistoryModalButton.style.color = 'red';
    closeHistoryModalButton.style.fontSize = '1.2em';
    closeHistoryModalButton.addEventListener('click', () => {
        historyModal.style.display = 'none';
    });
    const historyList = document.createElement('div');
    historyModal.appendChild(closeHistoryModalButton);
    historyModal.appendChild(document.createElement('h3')).textContent = 'История игр';
    historyModal.appendChild(historyList);
    document.body.appendChild(historyModal);

    let gameActive = false;
    let highScore = localStorage.getItem('highScore') || 0;

    displayHighScore();
    fetchPrizes();
    fetchLeaderboard();

    settingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'block';
        fetchProfile();
    });

    closeSettingsModalButton.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('telegramId');
        authToken = null;
        telegramId = null;
        window.location.reload();
    });

    historyButton.addEventListener('click', () => {
        historyModal.style.display = 'block';
        fetchGameHistory();
    });

    function displayHighScore() {
        highScoreDiv.textContent = `Рекорд: ${highScore}`;
    }

    async function fetchProfile() {
        if (!telegramId || !authToken) {
            console.warn('Telegram ID или Auth Token отсутствуют, пропуск запроса профиля.');
            return;
        }
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/profile/${telegramId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                telegramUsernameDisplay.textContent = `Имя пользователя: ${data.telegram_username}`;
                highScoreDiv.textContent = `Рекорд: ${data.high_score}`;
                telegramAvatar.src = `https://t.me/i/userpic/320/${data.telegram_username}.jpg`;
                telegramAvatar.onerror = () => { telegramAvatar.src = ''; };

                totalCellsDisplay.textContent = `Пройдено клеток: ${data.total_cells_traveled}`;
                totalApplesDisplay.textContent = `Яблоки: ${data.total_apples_collected}`;
                shieldsCollectedDisplay.innerHTML = `Щиты: <span class="glowing-square" style="color: mediumorchid;">■</span> ${data.shields_collected}`;
                trampolinesCollectedDisplay.innerHTML = `Батуты: <span class="glowing-square" style="color: yellow;">■</span> ${data.trampolines_collected}`;
                speedBoostsCollectedDisplay.innerHTML = `Ускорения: <span class="glowing-square" style="color: aqua;">■</span> ${data.speed_boosts_collected}`;

            } else {
                console.error('Ошибка при получении профиля:', response.status);
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('telegramId');
                    authToken = null;
                    telegramId = null;
                    alert('Сессия авторизации истекла. Пожалуйста, перезапустите Mini App.');
                }
            }
        } catch (error) {
            console.error('Ошибка сети при получении профиля:', error);
        }
    }

    async function fetchGameHistory() {
        if (!telegramId || !authToken) {
            console.warn('Telegram ID или Auth Token отсутствуют, не могу загрузить историю игр.');
            return;
        }
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/game_history/${telegramId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const historyData = await response.json();
                historyList.innerHTML = '';
                historyData.forEach(game => {
                    const gameDiv = document.createElement('div');
                    gameDiv.style.borderBottom = '1px solid #ccc';
                    gameDiv.style.padding = '10px 0';

                    const date = new Date(game.timestamp);
                    const timeOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                    const formattedTime = date.toLocaleDateString('ru-RU', timeOptions);

                    let snakeLengthDisplay = '';
                    for (let i = 0; i < game.snake_length; i++) {
                        snakeLengthDisplay += '■';
                    }

                    gameDiv.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: flex-start;">
                            <div>${formattedTime}</div>
                            <div>Игра №${game.id}</div>
                            <div>Яблоки: ${game.score}</div>
                            <div>Длина: ${snakeLengthDisplay}</div>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span style="color: mediumorchid;">■</span> Щиты: ${game.shields},
                            <span style="color: yellow;">■</span> Батуты: ${game.trampolines},
                            <span style="color: aqua;">■</span> Ускорения: ${game.speed_boosts}
                        </div>
                    `;
                    historyList.appendChild(gameDiv);
                });
            } else {
                console.error('Ошибка при получении истории игр:', response.status);
            }
        } catch (error) {
            console.error('Ошибка сети при получении истории игр:', error);
        }
    }

    async function fetchLeaderboard() {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/leaderboard`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                console.error('Ошибка получения лидеров:', response.status, response.statusText);
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

    async function fetchPrizes() {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/prizes`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                console.error('Ошибка получения призов:', response.status);
                return;
            }
            const data = await response.json();
            prizesList.innerHTML = '';
            data.forEach(prize => {
                const listItem = document.createElement('li');
                listItem.textContent = `Топ ${prize.rank}: ${prize.description}`;
                prizesList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Ошибка получения призов:', error);
        }
    }

    async function submitScore(finalScore) {
        if (!authToken) {
            console.error('Не авторизован. Счет не будет отправлен.');
            return;
        }

        if (finalScore > 10000) {
            console.warn('Подозрительно высокий счет, возможно, читинг.');
        }

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/submit_score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    score: finalScore,
                    auth_token: authToken,
                    cells_traveled: cellsTraveled,
                    apples_collected: applesCollected,
                    shields_collected: shieldsCollected,
                    trampolines_collected: trampolinesCollected,
                    speed_boosts_collected: speedBoostsCollected,
                    snake_positions: snakePositions
                })
            });
            if (!response.ok) {
                console.error('Ошибка отправки счета:', response.status, response.statusText);
            } else {
                console.log('Счет успешно отправлен на сервер.');
            }
            fetchLeaderboard();
        } catch (error) {
            console.error('Ошибка сети при отправке счета:', error);
        }
    }

    const gridSize = 20;
    let snake = [{ x: 10, y: 10 }];
    let direction = 'right';
    let score = 0;
    let gameLoop;
    let isGameOver = false;
    let cellsTraveled = 0;
    let applesCollected = 0;
    let shieldsCollected = 0;
    let trampolinesCollected = 0;
    let speedBoostsCollected = 0;
    let snakePositions = [];

    let touchStartX = 0;
    let touchStartY = 0;

    const neonColors = {
        shield: 'mediumorchid',
        trampoline: 'yellow',
        speed: 'aqua',
    };

    const specialApples = [
        { type: 'shield', description: 'Делает змейку неуязвимой и позволяет проходить сквозь стены на 5 секунд.' },
        { type: 'trampoline', description: 'Змейка прыгает на 2 клетки вперед.' },
        { type: 'speed', description: 'Увеличивает скорость змейки на 3 секунды.' },
    ];

    specialApples.forEach(apple => {
        const explanationItem = document.createElement('div');
        explanationItem.classList.add('explanation-item');

        const colorIndicator = document.createElement('span');
        colorIndicator.classList.add('apple-color-indicator');
        colorIndicator.style.backgroundColor = neonColors[apple.type];

        const description = document.createElement('span');
        description.textContent = apple.description;

        explanationItem.appendChild(colorIndicator);
        explanationItem.appendChild(description);
        explanationsDiv.appendChild(explanationItem);
    });

    let currentApple = {};
    let hasShield = false;
    let speedBoostActive = false;
    let currentSpeed = 60;

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

        ctx.fillStyle = neonColors[currentApple.type];
        ctx.fillRect(currentApple.x * gridSize, currentApple.y * gridSize, gridSize, gridSize);

        ctx.fillStyle = hasShield ? 'lightgreen' : 'lime';
        snake.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
    }

    function update() {
        if (!gameActive) return;

        const head = { ...snake[0] };
        let newHead = { ...head };

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

        if (!hasShield && snake.slice(1).some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            gameOver();
            return;
        }

        snake.unshift(newHead);
        snakePositions = snake.map(segment => ({ ...segment }));
        cellsTraveled++;

        if (newHead.x === currentApple.x && newHead.y === currentApple.y) {
            score++;
            scoreDisplay.textContent = score;
            applesCollected++;
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
                shieldsCollected++;
                setTimeout(() => {
                    hasShield = false;
                }, 5000);
                break;
            case 'trampoline':
                trampolinesCollected++;
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
                speedBoostsCollected++;
                if (!speedBoostActive) {
                    speedBoostActive = true;
                    clearInterval(gameLoop);
                    currentSpeed = 30;
                    gameLoop = setInterval(update, currentSpeed);
                    setTimeout(() => {
                        speedBoostActive = false;
                        clearInterval(gameLoop);
                        currentSpeed = 60;
                        gameLoop = setInterval(update, currentSpeed);
                    }, 3000);
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
        startButton.style.display = 'block';
        gameActive = false;

        submitScore(score);
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        direction = 'right';
        score = 0;
        scoreDisplay.textContent = score;
        isGameOver = false;
        hasShield = false;
        speedBoostActive = false;
        currentSpeed = 60;
        clearInterval(gameLoop);
        gameLoop = setInterval(update, currentSpeed);
        generateFood();
        draw();
        cellsTraveled = 0;
        applesCollected = 0;
        shieldsCollected = 0;
        trampolinesCollected = 0;
        speedBoostsCollected = 0;
    }

    function startGame() {
        if (!authToken) {
            alert('Не авторизован. Перезапустите Mini App.');
            return;
        }
        resetGame();
        startButton.style.display = 'none';
        gameActive = true;
        if (!gameLoop) {
            gameLoop = setInterval(update, currentSpeed);
        }
    }


    document.addEventListener('keydown', (event) => {
        if (!gameActive) return;
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
        event.preventDefault();
        if (!gameActive) return;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    });


    canvas.addEventListener('touchend', (event) => {
        event.preventDefault();
        if (!gameActive) return;
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
});
