import { UIManager } from "./ui.js";
const tg = window.Telegram.WebApp;
tg.ready();
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const cellSize = 20;
const initialSpeed = 150;
const speedIncrement = 5;
const minSpeed = 50;
let snake = [{x: 10, y: 10, type: 'head'}];
let direction = 'right';
let food = {x: 15, y: 15};
let score = 0;
let gameInterval;
let currentSpeed = initialSpeed;
let uim;
const snakeHeadSprite = new Image();
const foodSprite = new Image();
let useSensor = false;
let lastDirectionChange = 0;
let controlType = 'button';
snakeHeadSprite.src = 'dragon.png';
foodSprite.src = 'apple.png'

snakeHeadSprite.onload = () => {
    uim = new UIManager();
     loadSavedSettings()
    startGame();
};
function drawBackground(){
    ctx.fillStyle = '#153411';
    ctx.fillRect(0,0, canvas.width, canvas.height);
}
function drawSnake() {
    snake.forEach((segment, index) => {
        if(segment.type === 'head'){
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
            ctx.translate(segment.x * cellSize + cellSize / 2, segment.y * cellSize + cellSize / 2);
            ctx.rotate(rotation);
             ctx.drawImage(snakeHeadSprite, -cellSize/2 , -cellSize /2, cellSize, cellSize);
            ctx.restore();
        }else {
            ctx.fillStyle = '#66b3ff';
            ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
        }
    });
}
function drawFood(){
        ctx.drawImage(foodSprite, food.x * cellSize, food.y*cellSize, cellSize, cellSize )
}
function draw() {
    drawBackground();
    drawFood();
    drawSnake();
}
function update(){
    let head = {x: snake[0].x, y: snake[0].y, type: 'head'};
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
            snake[1].type = 'body'
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
      if(controlType === 'button'){
          uim.enableButtons()
        }

}
window.restartGame = function(){
     snake = [{x: 10, y: 10, type: 'head'}];
     direction = 'right';
     score = 0;
       clearInterval(gameInterval);
     uim.hideGameOver();
    if(controlType === 'button'){
        uim.enableButtons();
        }
        startGame();
}
function endGame() {
     clearInterval(gameInterval);
    uim.setFinalScore(score);
    uim.showGameOver();
       uim.disableButtons();
}
window.submitScore = function(){
    let playerName = tg.initDataUnsafe?.user?.username || "Без имени";
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
    if(controlType === 'sensor'){
           uim.disableButtons();
        }else{
        uim.enableButtons();
       }
}
window.closeSettings = function() {
    uim.closeSettings();
}

window.setControlType=function(controlElement) {
  controlType = controlElement.value;
        if (controlType === 'sensor') {
            uim.disableButtons()
            setupMotionSensor();
             useSensor = true;
        }else{
           if (motionSensor) motionSensor.stop();
            uim.enableButtons()
             useSensor = false;
        }
       saveSettings()
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
        uim.disableButtons();
    }
}
function loadSavedSettings(){
  const savedControl=   localStorage.getItem('controlType')
 if(savedControl){
      controlType = savedControl
        const radio =  document.querySelector(`input[name="controlType"][value="${controlType}"]`);
     if(radio){
         radio.checked = true;
        }

   }
}
function saveSettings(){
        localStorage.setItem('controlType',controlType);
}
 //  Create background clouds
const gameContainer = document.getElementById('game-container');
for(let i=1; i<=4; i++){
   const cloud = document.createElement('div');
    cloud.className=`cloud cloud${i}`;
    gameContainer.insertBefore(cloud, gameContainer.firstChild);
}