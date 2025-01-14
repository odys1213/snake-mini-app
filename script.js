import { UIManager } from "./ui/ui.js";
const tg = window.Telegram.WebApp;
tg.ready();

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const cellSize = 20;
const initialSpeed = 150;
const speedIncrement = 5; 
const minSpeed = 50;
let snake = [{x: 10, y: 10}];
let direction = 'right';
let food = {x: 15, y: 15};
let score = 0;
let gameInterval;
let currentSpeed = initialSpeed;
let uim = new UIManager()


function drawBackground(){
    ctx.fillStyle = '#153411';
    ctx.fillRect(0,0, canvas.width, canvas.height);
}
function drawSnake() {
    ctx.fillStyle = '#3399ff';
     const head = snake[0];
   // Нарисуйте контур головы дракона
        ctx.beginPath();
        ctx.moveTo(head.x * cellSize + cellSize / 2, head.y * cellSize);
        ctx.lineTo(head.x * cellSize, head.y * cellSize + cellSize / 4);
         ctx.lineTo(head.x * cellSize + cellSize/3, head.y * cellSize + cellSize / 4);

        ctx.lineTo(head.x * cellSize + cellSize / 5, head.y * cellSize + cellSize / 2);
          ctx.lineTo(head.x * cellSize + cellSize / 3, head.y * cellSize + 3* cellSize /4);
        ctx.lineTo(head.x * cellSize , head.y * cellSize +  3* cellSize /4);
        ctx.lineTo(head.x * cellSize + cellSize / 2, head.y * cellSize + cellSize);
          ctx.lineTo(head.x * cellSize +  cellSize , head.y * cellSize +  3*cellSize / 4);
        ctx.lineTo(head.x * cellSize +  2*cellSize /3, head.y * cellSize +  3*cellSize / 4);
            ctx.lineTo(head.x * cellSize + 4*cellSize / 5, head.y * cellSize +  cellSize /2 );

        ctx.lineTo(head.x * cellSize +  2*cellSize/3 , head.y * cellSize + cellSize/4 );
        ctx.lineTo(head.x * cellSize +  cellSize , head.y * cellSize +  cellSize / 4);


    ctx.closePath();
    ctx.fill();
    snake.slice(1).forEach(segment => {
         ctx.fillStyle = '#66b3ff';
        ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
    });
}
function drawFood(){
    ctx.fillStyle = '#ff6666';
        ctx.beginPath();
        ctx.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
        ctx.fill();
    
}
function draw() {
    drawBackground();
    drawFood();
    drawSnake();
}
function update(){
    let head = {x: snake[0].x, y: snake[0].y};
    switch(direction){
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
        case 'left': head.x -= 1; break;
        case 'right': head.x += 1; break;
    }
    snake.unshift(head);
     if (head.x === food.x && head.y === food.y) {
            score++;
            generateFood();
             if (currentSpeed > minSpeed) {
                 currentSpeed -= speedIncrement;
             clearInterval(gameInterval); // Очистить старый интервал
             gameInterval = setInterval(gameLoop, currentSpeed); // Запустить новый интервал
            }
        } else {
            snake.pop();
        }
      if(isGameOver()){
         endGame();
     }

}
function isGameOver(){
     let head = snake[0];
    if (head.x < 0 || head.y < 0 || head.x >= canvas.width / cellSize || head.y >= canvas.height / cellSize) {
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}
window.changeDirection = function(newDirection) {
      if (
        (direction === 'up' && newDirection === 'down') ||
        (direction === 'down' && newDirection === 'up') ||
        (direction === 'left' && newDirection === 'right') ||
        (direction === 'right' && newDirection === 'left')
    ) {
        return; 
    }
    direction = newDirection;
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / cellSize)),
        y: Math.floor(Math.random() * (canvas.height / cellSize))
    };
      let foodOnSnake = false;
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            foodOnSnake = true;
            break;
        }
    }

    if (foodOnSnake) {
        generateFood(); 
    }
}
function gameLoop() {
    update();
    draw();
}
function startGame(){
    gameInterval = setInterval(gameLoop, currentSpeed);
      generateFood();
      draw();
    
}
window.restartGame = function(){
     snake = [{x: 10, y: 10}];
     direction = 'right';
     score = 0;
    currentSpeed = initialSpeed
    clearInterval(gameInterval);
      uim.hideGameOver()
         startGame();

}
function endGame() {
     clearInterval(gameInterval);
    uim.setFinalScore(score);
    uim.showGameOver()

}
window.submitScore = function(){
    let playerName = document.getElementById('playerName').value || "Без имени";
     uim.saveScore(playerName,score);
    uim.hideGameOver();
    uim.showLeaderboard();

}
window.showLeaderboard=function(){
    uim.loadLeaderboard();
   uim.showLeaderboard();
}
window.closeLeaderboard = function(){
  uim.closeLeaderboard()
}


startGame();
 //  Create background clouds
const gameContainer = document.getElementById('game-container');

for(let i=1; i<=4; i++){
   const cloud = document.createElement('div');
    cloud.className=`cloud cloud${i}`
  gameContainer.insertBefore(cloud, gameContainer.firstChild);
}
