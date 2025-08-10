document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.getElementById('game-container');
  const player = document.getElementById('player');
  const scoreElement = document.getElementById('score');
  const startScreen = document.getElementById('start-screen');
  const gameOverScreen = document.getElementById('game-over-screen');
  const finalScoreElement = document.getElementById('final-score');
  const restartButton = document.getElementById('restart-button');

  const obstaclesData = [
    { url: 'wine_red.png',     width: 40, height: 80 },
    { url: 'wine_white.png',   width: 40, height: 80 },
    { url: 'cocktail.png',     width: 50, height: 70 },
    { url: 'vodka.png',        width: 40, height: 80 },
    { url: 'coke_zero.png',    width: 50, height: 60 },
    { url: 'vape.png',         width: 55, height: 55 },
    { url: 'syringe.png',      width: 80, height: 30 },
    { url: 'breathalyzer.png', width: 60, height: 60 },
    { url: 'credit_card.png',  width: 70, height: 45 }
  ];

  let isJumping = false;
  let isGameOver = true;
  let score = 0;
  let gameSpeed = 6;
  let spawnMin = 950;  // ms
  let spawnMax = 1600; // ms
  let scoreTimer = null;
  let nextSpawnTimeout = null;

  function startGame() {
    isGameOver = false;
    score = 0;
    gameSpeed = 6;
    scoreElement.textContent = '0';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    document.querySelectorAll('.obstacle').forEach(o => o.remove());
    document.querySelectorAll('.cloud').forEach(c => c.remove());

    createClouds();
    scheduleNextObstacle();
    scoreTimer = setInterval(updateScore, 100);

    document.addEventListener('keydown', handleJump);
    gameContainer.addEventListener('touchstart', handleJump, { passive: true });

    requestAnimationFrame(gameLoop);
  }

  function gameLoop() {
    if (isGameOver) return;
    checkCollision();
    requestAnimationFrame(gameLoop);
  }

  function updateScore() {
    if (isGameOver) return;
    score++;
    scoreElement.textContent = String(score);

    if (score % 50 === 0) gameSpeed += 0.4;
    if (score % 120 === 0) {
      spawnMin = Math.max(600, spawnMin - 50);
      spawnMax = Math.max(1000, spawnMax - 80);
    }
  }

  function handleJump(e) {
    if ((e.code === 'Space' || e.type === 'touchstart') && !isJumping && !isGameOver) {
      isJumping = true;
      player.style.animation = 'jump 0.7s ease-out';
      setTimeout(() => {
        player.style.animation = '';
        isJumping = false;
      }, 700);
    }
  }

  function scheduleNextObstacle() {
    if (isGameOver) return;
    const wait = Math.random() * (spawnMax - spawnMin) + spawnMin;
    nextSpawnTimeout = setTimeout(() => {
      createObstacle();
      scheduleNextObstacle();
    }, wait);
  }

  function createObstacle() {
    if (isGameOver) return;

    const data = obstaclesData[Math.floor(Math.random() * obstaclesData.length)];
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    obstacle.style.backgroundImage = `url('${data.url}')`;
    obstacle.style.width = `${data.width}px`;
    obstacle.style.height = `${data.height}px`;
    obstacle.style.left = `${gameContainer.offsetWidth}px`;
    gameContainer.appendChild(obstacle);

    let x = gameContainer.offsetWidth;
    const move = () => {
      if (isGameOver) {
        obstacle.remove();
        return;
      }
      x -= gameSpeed;
      obstacle.style.left = `${x}px`;

      if (x + data.width < 0) {
        obstacle.remove();
      } else {
        requestAnimationFrame(move);
      }
    };
    requestAnimationFrame(move);
  }

  function checkCollision() {
    const playerRect = player.getBoundingClientRect();
    document.querySelectorAll('.obstacle').forEach(obstacle => {
      const r = obstacle.getBoundingClientRect();
      const pad = 8;
      if (
        playerRect.left < r.right - pad &&
        playerRect.right - pad > r.left &&
        playerRect.top < r.bottom - pad &&
        playerRect.bottom - pad > r.top
      ) {
        endGame();
      }
    });
  }

  function endGame() {
    if (isGameOver) return;
    isGameOver = true;

    clearInterval(scoreTimer);
    clearTimeout(nextSpawnTimeout);

    document.querySelectorAll('.obstacle, .ground').forEach(el => {
      el.style.animationPlayState = 'paused';
    });

    finalScoreElement.textContent = `Your Score: ${score}`;
    gameOverScreen.classList.remove('hidden');

    document.removeEventListener('keydown', handleJump);
    gameContainer.removeEventListener('touchstart', handleJump);
  }

  function restartGame() {
    document.querySelectorAll('.obstacle, .ground').forEach(el => {
      el.style.animationPlayState = 'running';
    });
    startGame();
  }

  function createClouds() {
    for (let i = 0; i < 5; i++) {
      const cloud = document.createElement('div');
      cloud.classList.add('cloud');
      const top = Math.random() * (gameContainer.offsetHeight / 2);
      const initialLeft = Math.random() * gameContainer.offsetWidth;
      cloud.style.top = `${top}px`;
      cloud.style.left = `${initialLeft}px`;
      gameContainer.insertBefore(cloud, player);

      let x = initialLeft;
      const move = () => {
        if (isGameOver) return;
        x -= 0.5;
        if (x < -100) x = gameContainer.offsetWidth + 50;
        cloud.style.left = `${x}px`;
        requestAnimationFrame(move);
      };
      move();
    }
  }

  const startHandler = () => {
    if (isGameOver) {
      startGame();
      document.removeEventListener('keydown', startHandler);
      document.removeEventListener('touchstart', startHandler);
    }
  };
  document.addEventListener('keydown', startHandler);
  document.addEventListener('touchstart', startHandler, { passive: true });
  restartButton.addEventListener('click', restartGame);
});