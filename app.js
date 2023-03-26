window.addEventListener('load', () => {

    const btnFullscreen = document.getElementById('fullscreen')

    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1600;
    canvas.height = 800;

    //VARIABLES
    let startGame = false;
    let gameOver = false;
    let scorePlayerLeft = 0;
    let scorePlayerRight = 0;

    window.addEventListener("keydown", startingGame);
    window.addEventListener("touchstart", startingGame);

    function startingGame(e) {
        if (e.key === 'Enter') {
            startGame = true;
        };
        if (gameOver && (e.key === 'Enter')) {
            restartGame();
        };
    };

    //MIDDLE LINE
    function middleLine() {
        ctx.beginPath();
        ctx.setLineDash([30, 40]);
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.closePath();
    };

    //DISPLAY SCORE
    function score() {
        ctx.beginPath();
        ctx.font = "80px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(scorePlayerLeft, canvas.width / 2 - 100, 100);
        ctx.fillText(scorePlayerRight, canvas.width / 2 + 100, 100);
    };

    //INFO START GAME
    function gameInfo() {
        ctx.font = "60px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        if (!startGame) {
            ctx.fillText("For move, Player Left use Z & S", canvas.width / 2, canvas.height / 3.8);
            ctx.fillText("Player Right use Arrow Up & Down", canvas.width / 2, canvas.height / 2.6);
            ctx.fillText("Press Enter to start", canvas.width / 2, canvas.height / 1.6);
        } else if (gameOver) {
            ctx.fillText("Press Enter to restart", canvas.width / 2, canvas.height / 1.6);
            ctx.font = "120px Arial";
            if (scorePlayerLeft === 3) {
                ctx.fillText("Player Left win !", canvas.width / 2, canvas.height / 2);
            } else if (scorePlayerRight === 3) {
                ctx.fillText("Player Right win ! ", canvas.width / 2, canvas.height / 2);
            };
        };
    };

    //BACKGROUND
    class Background {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.width = canvas.width;
            this.height = canvas.height;
        };
        draw() {
            ctx.beginPath();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 5;
            ctx.setLineDash([]);
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.stroke();
            ctx.closePath();
        };
    };

    //PADDLE PARENT CLASS
    class Paddle {
        constructor(x) {
            this.width = 20;
            this.height = 150;
            this.x = x;
            this.y = canvas.height / 2 - this.height / 2;
            this.moveUp = false;
            this.moveDown = false;
            this.speed = 5;
            this.keys = [];
        }
        update() {
            // KEYBOARD MOVEMENT
            if (this.keys.includes("z")) {
                leftPaddle.y -= this.speed;
            } else if (this.keys.includes("s")) {
                leftPaddle.y += this.speed;
            } else if (this.keys.includes("ArrowUp")) {
                rightPaddle.y -= this.speed;
            } else if (this.keys.includes("ArrowDown")) {
                rightPaddle.y += this.speed;
            };

            //OUT OF BOUNDS
            if (this.y < 0) this.y = 0;       
            else if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
        };
        draw() {
            ctx.beginPath();
            ctx.fillStyle = "#fff";
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.fill();
        };
    };

    //PADDLE CHILD CLASSES
    class LeftPaddle extends Paddle {
        constructor() {
            super(50);
            this.isTouching = false;
            this.touchY = '';
            document.addEventListener("keydown", e => {
                if ((e.key === "z" ||
                    e.key === "s") && !this.keys.includes(e.key)) {
                    this.keys.push(e.key);
                }
            });
            document.addEventListener("keyup", e => {
                if (e.key === "z" ||
                    e.key === "s") {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                };
            });
        };
        reset() {
            this.y = canvas.height / 2 - this.height / 2;
        };
    };

    class RightPaddle extends Paddle {
        constructor() {
            super(canvas.width - 50 - 20);
            this.isTouching = false;
            this.touchY = '';
            document.addEventListener("keydown", e => {
                if ((e.key === "ArrowUp" ||
                    e.key === "ArrowDown") && !this.keys.includes(e.key)) {
                    this.keys.push(e.key);
                }
            });
            document.addEventListener("keyup", e => {
                if (e.key === "ArrowUp" ||
                    e.key === "ArrowDown") {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
        };
        reset() {
            this.y = canvas.height / 2 - this.height / 2;
        };
    };

    class Ball {
        constructor() {
            this.radius = 10;
            this.x = canvas.width / 2 - this.radius / 2 + 5;
            this.y = canvas.height / 2 - this.radius / 2 + 4;
            this.dx = Math.floor(Math.random() * 2) === 0 ? 5 : -5;
            this.dy = Math.floor(Math.random() * 2) === 0 ? 5 : -5;
            this.velocity = 7;
        }
        update(deltaTime) {
            if (startGame) {
                this.x += this.dx * (deltaTime / 6);
                this.y += this.dy * (deltaTime / 6);
            };

            //COLLISION WALL
            if (this.y + this.radius > canvas.height) {
                this.dy *= -1;
                this.y = canvas.height - this.radius;
            } else if (this.y - this.radius < 0) {
                this.dy *= -1;
                this.y = this.radius;
            };

            //COLLISION RIGHT PADDLE
            if (this.x + this.radius > rightPaddle.x &&
                this.y + this.radius > rightPaddle.y &&
                this.y - this.radius < rightPaddle.y + rightPaddle.height &&
                this.x + this.radius < rightPaddle.x + rightPaddle.width) {

                //CALCUL ANGLE COLLISION PADDLE RIGHT
                let collidePoint = this.y - (rightPaddle.y + rightPaddle.height / 2);
                collidePoint = collidePoint / (rightPaddle.height / 2);
                let angle = (collidePoint * Math.PI) / 3;

                //CHANGE BALL DIRECTION 
                this.dx = -this.velocity * Math.cos(angle);
                this.dy = this.velocity * Math.sin(angle);

                //UPDATE BALL POSITION
                this.x = rightPaddle.x - this.radius;
            }

            //COLLISION LEFT PADDLE
            else if (this.x - this.radius < leftPaddle.x + leftPaddle.width &&
                this.y + this.radius > leftPaddle.y &&
                this.y - this.radius < leftPaddle.y + leftPaddle.height &&
                this.x - this.radius > leftPaddle.x) {

                //CALCUL ANGLE COLLISION PADDLE LEFT
                let collidePoint = this.y - (leftPaddle.y + leftPaddle.height / 2);
                collidePoint = collidePoint / (leftPaddle.height / 2);
                let angle = (collidePoint * Math.PI) / 3;

                //CHANGE BALL DIRECTION
                this.dx = this.velocity * Math.cos(angle);
                this.dy = this.velocity * Math.sin(angle);

                //UPDATE BALL POSITION
                this.x = leftPaddle.x + leftPaddle.width + this.radius;
            };

            //SCORE
            if (this.x < 0) {
                scorePlayerRight++;
                this.reset();
            } else if (this.x + this.radius > canvas.width) {
                scorePlayerLeft++;
                this.reset();
            };

            //GAME OVER
            if (scorePlayerLeft === 3 || scorePlayerRight === 3) gameOver = true;
        };
        draw() {
            ctx.beginPath();
            ctx.fillStyle = "#fff";
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fill();
        };
        reset() {
            this.x = canvas.width / 2 - this.radius / 2 + 5;
            this.y = canvas.height / 2 - this.radius / 2;
            this.dx = Math.floor(Math.random() * 2) === 0 ? 5 : -5;
            this.dy = Math.floor(Math.random() * 2) === 0 ? 5 : -5;
        };
    };

    const leftPaddle = new LeftPaddle();
    const rightPaddle = new RightPaddle();
    const ball = new Ball();
    const background = new Background();

    function restartGame() {
        scorePlayerLeft = 0;
        scorePlayerRight = 0;
        gameOver = false;
        startGame = false;
        rightPaddle.reset();
        leftPaddle.reset();
        gameLoop();
    };

    function update(deltaTime) {
        rightPaddle.update();
        leftPaddle.update();
        ball.update(deltaTime);
    };

    function draw() {
        gameInfo();
        background.draw();
        rightPaddle.draw();
        leftPaddle.draw();
        ball.draw();
        middleLine();
        score();
    }

    //FULLSCREEN
    function fullscreen() {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        }
    };
    btnFullscreen.addEventListener('click', fullscreen);

    let lastTime = 0;
    function gameLoop(timeStamp) {

        let deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        update(deltaTime);
        draw();

        if (!gameOver) requestAnimationFrame(gameLoop);
    }
    gameLoop(0);

});