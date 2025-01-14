let clickCount = 0;

const clickerButton = document.getElementById('clicker');
const clickCountDisplay = document.getElementById('clickCount');

clickerButton.addEventListener('click', () => {
    clickCount++;
    clickCountDisplay.textContent = `Количество кликов: ${clickCount}`;
    sendClickData(clickCount);
});

// Функция для отправки кликов на сервер
function sendClickData(count) {
    fetch('http://localhost:5000/click', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clickCount: count })
    })
    .then(response => response.json())
    .then(data => console.log('Данные отправлены на сервер:', data))
    .catch(error => console.error('Ошибка при отправке данных:', error));
}
