export class UIManager {
    setFinalScore(score) {
       document.getElementById('final-score').innerText = score;
   }
   showGameOver() {
       document.getElementById('game-over-overlay').style.display = 'flex';
   }
  hideGameOver() {
       document.getElementById('game-over-overlay').style.display = 'none';
   }
    saveScore(playerName, score) {
       const newScore = { name: playerName, score: score };
       let leaderboard = this.loadLeaderboard();
       leaderboard.push(newScore);
       leaderboard.sort((a, b) => b.score - a.score);
       if (leaderboard.length > 10) {
           leaderboard.pop();
       }
       localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
   }
   showLeaderboard() {
       this.loadLeaderboard();
       const leaderboardList = document.getElementById('leaderboard-list');
       leaderboardList.innerHTML = '';
       this.leaderboard.forEach((entry, index) => {
           const listItem = document.createElement('li');
           listItem.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
           leaderboardList.appendChild(listItem);
       });
      document.getElementById('leaderboard-overlay').style.display = 'flex';
   }
   closeLeaderboard() {
      document.getElementById('leaderboard-overlay').style.display = 'none';
   }
      showSettings() {
      document.getElementById('settings-overlay').style.display = 'flex';
   }
     closeSettings() {
     document.getElementById('settings-overlay').style.display = 'none';
   }
   loadLeaderboard() {
     const storedLeaderboard = localStorage.getItem('leaderboard');
     this.leaderboard = storedLeaderboard ? JSON.parse(storedLeaderboard) : [];
       return this.leaderboard;
  }
     disableButtons() {
        document.querySelectorAll('#controls-container button').forEach(button => {
               button.disabled = true;
             button.style.opacity =0.5;
        });
   }
   enableButtons() {
       document.querySelectorAll('#controls-container button').forEach(button => {
               button.disabled = false;
              button.style.opacity =1;
         });
   }
}