class Snake {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20;
        this.reset();
    }

    reset() {
        // 初始化蛇的位置在画布中心
        const startX = Math.floor(this.canvas.width / (2 * this.gridSize)) * this.gridSize;
        const startY = Math.floor(this.canvas.height / (2 * this.gridSize)) * this.gridSize;
        
        this.body = [
            { x: startX, y: startY },
            { x: startX - this.gridSize, y: startY },
            { x: startX - this.gridSize * 2, y: startY }
        ];
        
        this.direction = 'right';
        this.nextDirection = 'right';
    }

    update() {
        this.direction = this.nextDirection;
        const head = { x: this.body[0].x, y: this.body[0].y };

        switch (this.direction) {
            case 'up': head.y -= this.gridSize; break;
            case 'down': head.y += this.gridSize; break;
            case 'left': head.x -= this.gridSize; break;
            case 'right': head.x += this.gridSize; break;
        }

        this.body.unshift(head);
        return this.body.pop(); // 返回尾部，用于在吃到食物时添加回来
    }

    grow() {
        const tail = this.body[this.body.length - 1];
        this.body.push({ ...tail });
    }

    draw() {
        const isPlayer1 = this.canvas.id === 'game-canvas-1';
        const radius = this.gridSize / 2 - 1;

        this.body.forEach((segment, index) => {
            this.ctx.beginPath();
            this.ctx.arc(
                segment.x + this.gridSize / 2,
                segment.y + this.gridSize / 2,
                radius,
                0,
                Math.PI * 2
            );
            
            if (isPlayer1) {
                // 玩家1的蛇是黄色
                this.ctx.fillStyle = index === 0 ? '#FFD700' : '#FFA500';
            } else {
                // 玩家2的蛇是绿色
                this.ctx.fillStyle = index === 0 ? '#32CD32' : '#228B22';
            }
            
            this.ctx.fill();
            this.ctx.closePath();
        });
    }

    checkCollision() {
        const head = this.body[0];
        
        // 检查是否撞墙
        if (head.x < 0 || head.x >= this.canvas.width ||
            head.y < 0 || head.y >= this.canvas.height) {
            return true;
        }

        // 检查是否撞到自己
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }

        return false;
    }

    changeDirection(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[newDirection] !== this.direction) {
            this.nextDirection = newDirection;
        }
    }
} 