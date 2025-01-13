document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');

    const gridSize = 15;
    const gridCount = canvas.width / gridSize;
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 5, y: 5 };
    let direction = 'right';
    let score = 0;
    let gameSpeed = 150; // in milliseconds
    let gameInterval;

    function getRandomPosition() {
        return {
            x: Math.floor(Math.random() * gridCount),
            y: Math.floor(Math.random() * gridCount)
        };
    }
     
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //draw snake
        ctx.fillStyle = 'green';
         snake.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });

         //draw food
        ctx.fillStyle = 'red';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    }

    function update() {
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

       
       //check if snake eat food
        if (head.x === food.x && head.y === food.y) {
             score++;
             scoreDisplay.textContent = `Score: ${score}`;
            food = getRandomPosition();
            gameSpeed = Math.max(gameSpeed - 5, 20);
            clearInterval(gameInterval);
             gameInterval = setInterval(update, gameSpeed);

         } else {
            snake.pop(); //remove the last section of the snake
        }

        //check if game is over
        if(head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount || checkSelfCollision()) {
            clearInterval(gameInterval);
            alert(`Game over, score: ${score}`);
             Telegram.WebApp.sendData(`score=${score}`);
             //add "play again" button
              const playAgainButton = document.createElement('button');
            playAgainButton.textContent = 'Играть снова';
            playAgainButton.onclick = startGame;
            document.body.appendChild(playAgainButton);
           return;
        }
        
         draw();
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
                if(direction !== 'down')
                    direction = 'up';
                break;
            case 'ArrowDown':
               if(direction !== 'up')
                  direction = 'down';
                break;
            case 'ArrowLeft':
               if(direction !== 'right')
                 direction = 'left';
                break;
            case 'ArrowRight':
                if(direction !== 'left')
                    direction = 'right';
                break;
        }
    }

    // touch controls
    let touchStartX;
    let touchStartY;
    canvas.addEventListener('touchstart', function(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
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
            } else if(dx < 0 && direction !== 'right'){
                direction = 'left';
            }
        } else {
           if(dy > 0 && direction !== 'up'){
               direction = 'down'
           }
             else if(dy < 0 && direction !== 'down'){
               direction = 'up';
           }
        }
    
        touchStartX = null;
        touchStartY = null;
    });

    document.addEventListener('keydown', handleKeyDown);
    startGame();
    
    function startGame(){
        snake = [{ x: 10, y: 10 }];
        food = { x: 5, y: 5 };
        direction = 'right';
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        gameSpeed = 150;
        clearInterval(gameInterval);

        const playAgainButton = document.querySelector('button');
        if(playAgainButton){
             playAgainButton.remove();
        }
       
        gameInterval = setInterval(update, gameSpeed);
    }
 });
