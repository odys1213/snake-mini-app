import { UIManager } from "./ui.js";
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
let uim = new UIManager();
const snakeSprite = new Image();
let useSensor = false;
snakeSprite.src = 'dragon.png';
let lastDirectionChange = 0;
snakeSprite.onload=()=>{
    startGame();
};
function drawBackground(){
    ctx.fillStyle = '#153411';
    ctx.fillRect(0,0, canvas.width, canvas.height);
}
function drawSnake() {
    const head = snake[0];
    let rotation =0;
        switch (direction) {
        case 'up':
              rotation = -Math.PI / 2;
            break;
        case 'down':
           rotation = Math.PI / 2;
            break;
        case 'left':
              rotation =  Math.PI;
            break;
        case 'right':
            rotation = 0;
            break;
        default:
           rotation = 0;
    }
    ctx.save();
    ctx.translate(head.x * cellSize + cellSize / 2, head.y * cellSize + cellSize / 2);
    ctx.rotate(rotation);
    ctx.drawImage(snakeSprite, -cellSize/2 , -cellSize /2, cellSize, cellSize);
    ctx.restore();
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
             clearInterval(gameInterval);
             gameInterval = setInterval(gameLoop, currentSpeed);
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
};
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
     currentSpeed = initialSpeed;
     gameInterval = setInterval(gameLoop, currentSpeed);
     generateFood();
     draw();
}
window.restartGame = function(){
     snake = [{x: 10, y: 10}];
     direction = 'right';
     score = 0;
       clearInterval(gameInterval);
     uim.hideGameOver();
     if(!useSensor){
     enableButtons();
      }
        startGame();
}
function endGame() {
     clearInterval(gameInterval);
    uim.setFinalScore(score);
    uim.showGameOver();
    disableButtons();
}
window.submitScore = function(){
    let playerName = document.getElementById('playerName').value || "Без имени";
     uim.saveScore(playerName,score);
    uim.hideGameOver();
    uim.showLeaderboard();
}
window.showLeaderboard = function(){
    uim.loadLeaderboard();
   uim.showLeaderboard();
}
window.closeLeaderboard = function(){
  uim.closeLeaderboard()
}
window.showSettings = function(){
       uim.showSettings();
        if(useSensor){
           disableButtons();
        }else{
            enableButtons();
        }
}
window.closeSettings = function() {
    uim.closeSettings();
}
function disableButtons() {
     document.querySelectorAll('#controls-container button').forEach(button => {
            button.disabled = true;
          button.style.opacity =0.5;
     });
}
function enableButtons() {
         document.querySelectorAll('#controls-container button').forEach(button => {
            button.disabled = false;
           button.style.opacity =1;
      });
}
window.toggleSensorControl = function () {
    useSensor = document.getElementById('sensor-control').checked;
      if(useSensor){
         disableButtons()
        setupMotionSensor()
      }else{
         enableButtons();
            if(motionSensor) motionSensor.stop();
      }
};
let motionSensor;
function setupMotionSensor() {
    try {
         motionSensor = new DeviceOrientationSensor({ frequency: 20 });
        motionSensor.addEventListener('reading', () => {
               const  threshold=0.2;
           const alpha = motionSensor.alpha;
            const beta = motionSensor.beta;
               const gamma = motionSensor.gamma;
             if (alpha == null || beta == null || gamma == null){
                  return
             }
                const timeNow = Date.now();
                if (timeNow - lastDirectionChange < 500) return
    let newDirection = direction;
     if (Math.abs(beta) > threshold &&  Math.abs(gamma)< threshold )
    {
       newDirection= beta > 0 ? "down" : "up";
           }
        if ( Math.abs(gamma) > threshold && Math.abs(beta) < threshold)
        {
               newDirection = gamma >0 ? "right":"left";
             }
  if(newDirection!==direction){
         window.changeDirection(newDirection);
         lastDirectionChange = Date.now();
           }
        });
        motionSensor.start();
    } catch (error) {
        console.error('Accelerometer/gyroscope not supported:', error);
         document.getElementById('sensor-control').checked = false;
     disableButtons();
     }
}
 //  Create background clouds
const gameContainer = document.getElementById('game-container');
for(let i=1; i<=4; i++){
   const cloud = document.createElement('div');
    cloud.className=`cloud cloud${i}`;
    gameContainer.insertBefore(cloud, gameContainer.firstChild);
}
