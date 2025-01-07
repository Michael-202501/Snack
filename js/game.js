class Game {
    constructor(playerId, controls) {
        this.playerId = playerId;
        this.canvas = document.getElementById(`game-canvas-${playerId}`);
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.ctx = this.canvas.getContext('2d');
        
        this.snake = new Snake(this.canvas);
        this.food = null;
        this.score = 0;
        this.highScore = localStorage.getItem(`snakeHighScore${playerId}`) || 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.controls = controls;
        this.targetScore = 100;

        this.initializeControls();
        this.generateFood();
        this.updateScore();
    }

    initializeControls() {
        document.addEventListener('keydown', (e) => {
            if (this.controls[e.key]) {
                e.preventDefault();
                this.snake.changeDirection(this.controls[e.key]);
            }
        });
    }

    generateFood() {
        const gridSize = this.snake.gridSize;
        let x, y;
        do {
            x = Math.floor(Math.random() * (this.canvas.width / gridSize)) * gridSize;
            y = Math.floor(Math.random() * (this.canvas.height / gridSize)) * gridSize;
        } while (this.snake.body.some(segment => segment.x === x && segment.y === y));

        this.food = { x, y };
    }

    update() {
        if (this.isPaused) return;

        const tail = this.snake.update();

        if (this.snake.checkCollision()) {
            this.gameOver();
            return;
        }

        const head = this.snake.body[0];
        if (head.x === this.food.x && head.y === this.food.y) {
            this.snake.grow();
            this.generateFood();
            this.score += 10;
            this.updateScore();
        }

        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制紫色三角形食物
        this.ctx.beginPath();
        const centerX = this.food.x + this.snake.gridSize / 2;
        const centerY = this.food.y + this.snake.gridSize / 2;
        const size = this.snake.gridSize - 2;
        
        this.ctx.moveTo(centerX, centerY - size/2); // 顶点
        this.ctx.lineTo(centerX - size/2, centerY + size/2); // 左下
        this.ctx.lineTo(centerX + size/2, centerY + size/2); // 右下
        this.ctx.closePath();
        
        this.ctx.fillStyle = '#8A2BE2'; // 紫色
        this.ctx.fill();
        
        // 绘制蛇
        this.snake.draw();
    }

    start() {
        if (!this.gameLoop) {
            this.gameLoop = setInterval(() => this.update(), 100);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById(`pause-btn-${this.playerId}`).textContent = this.isPaused ? '继续' : '暂停';
    }

    restart() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.score = 0;
        this.isPaused = false;
        this.snake.reset();
        this.generateFood();
        this.updateScore();
        document.getElementById(`game-over-${this.playerId}`).classList.add('hidden');
        this.start();
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(`snakeHighScore${this.playerId}`, this.highScore);
            document.getElementById(`high-score-${this.playerId}`).textContent = this.highScore;
        }

        // 只在对应玩家的游戏区域显示游戏结束信息
        const gameOverElement = document.getElementById(`game-over-${this.playerId}`);
        gameOverElement.style.width = '80%';
        gameOverElement.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        document.getElementById(`final-score-${this.playerId}`).textContent = this.score;
        gameOverElement.classList.remove('hidden');
    }

    updateScore() {
        document.getElementById(`current-score-${this.playerId}`).textContent = this.score;
        document.getElementById(`high-score-${this.playerId}`).textContent = this.highScore;
        
        if (this.score >= this.targetScore) {
            this.announceWinner();
        }
    }

    announceWinner() {
        // 在获胜者的游戏区域显示获胜信息
        const winnerAnnouncement = document.getElementById('winner-announcement');
        const winnerText = document.getElementById('winner-text');
        winnerText.textContent = `玩家${this.playerId}获胜！得分：${this.score}`;
        
        // 停止所有游戏
        games.forEach(game => {
            if (game.gameLoop) {
                clearInterval(game.gameLoop);
                game.gameLoop = null;
            }
        });

        // 显示获胜信息
        const gameOverElement = document.getElementById(`game-over-${this.playerId}`);
        gameOverElement.innerHTML = `
            <h2>恭喜获胜!</h2>
            <p>最终得分: ${this.score}</p>
        `;
        gameOverElement.classList.remove('hidden');
    }
}

// 初始化两个游戏实例和共用控制
let games = [];
let isCountingDown = false;

window.onload = () => {
    const player1Controls = {
        'w': 'up',
        's': 'down',
        'a': 'left',
        'd': 'right'
    };

    const player2Controls = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
    };

    games.push(new Game('1', player1Controls));
    games.push(new Game('2', player2Controls));

    // 共用控制按钮事件监听
    document.getElementById('start-btn').addEventListener('click', startBothGames);
    document.getElementById('pause-btn').addEventListener('click', togglePauseBothGames);
    document.getElementById('restart-btn').addEventListener('click', restartBothGames);
    document.getElementById('restart-both-btn').addEventListener('click', () => {
        document.getElementById('winner-announcement').classList.add('hidden');
        restartBothGames();
    });
};

function startBothGames() {
    if (isCountingDown) return;
    isCountingDown = true;

    const countdownElement = document.getElementById('countdown');
    const countdownNumber = document.getElementById('countdown-number');
    let count = 3;

    countdownElement.classList.remove('hidden');
    
    const countdownInterval = setInterval(() => {
        countdownNumber.textContent = count;
        count--;

        if (count < 0) {
            clearInterval(countdownInterval);
            countdownElement.classList.add('hidden');
            games.forEach(game => game.start());
            isCountingDown = false;
        }
    }, 1000);
}

function togglePauseBothGames() {
    const pauseBtn = document.getElementById('pause-btn');
    const isPaused = games[0].isPaused;
    
    games.forEach(game => game.togglePause());
    pauseBtn.textContent = !isPaused ? '继续' : '暂停';
}

function restartBothGames() {
    games.forEach(game => {
        if (game.gameLoop) {
            clearInterval(game.gameLoop);
            game.gameLoop = null;
        }
        game.score = 0;
        game.isPaused = false;
        game.snake.reset();
        game.generateFood();
        game.updateScore();
        document.getElementById(`game-over-${game.playerId}`).classList.add('hidden');
    });
    
    document.getElementById('pause-btn').textContent = '暂停';
    startBothGames();
} 