const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

// ================= CONFIGURAÇÕES DE FÍSICA =================
const FRICTION = 0.96; 
const BALL_FRICTION = 0.985;
const PLAYER_ACC = 0.4;
const MAX_SPEED = 3.5;
const KICK_POWER = 5;
const KICK_RADIUS = 5; 

const GOAL_HEIGHT = 120;
const GOAL_TOP = canvas.height / 2 - GOAL_HEIGHT / 2;
const GOAL_BOTTOM = canvas.height / 2 + GOAL_HEIGHT / 2;

// ================= SCORE =================
let scoreLeft = 0;
let scoreRight = 0;

// ================= ENTIDADES =================
const player = {
    x: 200, y: 200,
    vx: 0, vy: 0,
    r: 15, 
    color: "#e56e56", 
    mass: 2,
    isKicking: false
};

const bot = {
    x: 600, y: 200,
    vx: 0, vy: 0,
    r: 15,
    color: "#5689e5", 
    speed: 0.3,
    mass: 2,
    isKicking: false
};
let botActive = true;

const ball = {
    x: 400, y: 200,
    vx: 0, vy: 0,
    r: 10,
    color: "white",
    mass: 0.5 
};

// ================= INPUT =================
const keys = {};

document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === "p") botActive = !botActive;
});

document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

// ================= UTILS =================
function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function reset() {
    ball.x = 400; ball.y = 200;
    ball.vx = 0; ball.vy = 0;

    player.x = 200; player.y = 200;
    player.vx = 0; player.vy = 0;

    bot.x = 600; bot.y = 200;
    bot.vx = 0; bot.vy = 0;
}

function resolveCollision(p, b) {
    const dx = b.x - p.x;
    const dy = b.y - p.y;
    const dist = Math.hypot(dx, dy);
    const minDist = p.r + b.r;

    if (dist < minDist && dist > 0) {
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDist - dist;
        
        b.x += nx * (overlap * 0.5);
        b.y += ny * (overlap * 0.5);
        p.x -= nx * (overlap * 0.5);
        p.y -= ny * (overlap * 0.5);

        const dvx = b.vx - p.vx;
        const dvy = b.vy - p.vy;
        const dotProduct = dvx * nx + dvy * ny;

        if (dotProduct > 0) return { nx, ny, dist };

        const restitution = 0.5; 
        const impulse = -(1 + restitution) * dotProduct / (1 / p.mass + 1 / b.mass);

        const impulseX = nx * impulse;
        const impulseY = ny * impulse;

        p.vx -= impulseX / p.mass;
        p.vy -= impulseY / p.mass;
        b.vx += impulseX / b.mass;
        b.vy += impulseY / b.mass;

        return { nx, ny, dist };
    }
    return null;
}

// ================= UPDATE =================
function update() {
    // ===== PLAYER =====
    if (keys["w"]) player.vy -= PLAYER_ACC;
    if (keys["s"]) player.vy += PLAYER_ACC;
    if (keys["a"]) player.vx -= PLAYER_ACC;
    if (keys["d"]) player.vx += PLAYER_ACC;
    
    player.isKicking = keys[" "]; 

    player.vx *= FRICTION;
    player.vy *= FRICTION;
    
    const playerSpeed = Math.hypot(player.vx, player.vy);
    if (playerSpeed > MAX_SPEED) {
        player.vx = (player.vx / playerSpeed) * MAX_SPEED;
        player.vy = (player.vy / playerSpeed) * MAX_SPEED;
    }

    player.x += player.vx;
    player.y += player.vy;

    resolveCollision(player, ball);

    if (player.isKicking) {
        const dx = ball.x - player.x;
        const dy = ball.y - player.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < player.r + ball.r + KICK_RADIUS) {
            const nx = dx / dist;
            const ny = dy / dist;
            ball.vx += nx * KICK_POWER;
            ball.vy += ny * KICK_POWER;
        }
    }

    // ===== BOT INTELIGENTE (DRIBLADOR E ARTILHEIRO) =====
    if (botActive) {
        const targetGoalX = 0; 
        const targetGoalY = canvas.height / 2;
        const myGoalX = canvas.width; 

        const lookAhead = 10; 
        const futureBallX = ball.x + (ball.vx * lookAhead);
        const futureBallY = ball.y + (ball.vy * lookAhead);

        let targetX, targetY; 

        if (ball.x > bot.x + 15) {
            // DEFESA
            targetX = myGoalX - 50; 
            targetY = futureBallY;  
        } else {
            // POSICIONAMENTO ATRÁS DA BOLA
            let toGoalX = targetGoalX - futureBallX;
            let toGoalY = targetGoalY - futureBallY;
            let distToGoal = Math.hypot(toGoalX, toGoalY);

            let offset = bot.r + ball.r + 5; 
            targetX = futureBallX - (toGoalX / distToGoal) * offset;
            targetY = futureBallY - (toGoalY / distToGoal) * offset;
        }

        let dx = targetX - bot.x;
        let dy = targetY - bot.y;
        let distToTarget = Math.hypot(dx, dy);

        if (distToTarget > 3) {
            bot.vx += (dx / distToTarget) * bot.speed;
            bot.vy += (dy / distToTarget) * bot.speed;
        }

        bot.vx *= FRICTION;
        bot.vy *= FRICTION;

        const botSpeed = Math.hypot(bot.vx, bot.vy);
        if (botSpeed > MAX_SPEED * 0.8) { 
            bot.vx = (bot.vx / botSpeed) * (MAX_SPEED * 0.8);
            bot.vy = (bot.vy / botSpeed) * (MAX_SPEED * 0.8);
        }

        bot.x += bot.vx;
        bot.y += bot.vy;

        resolveCollision(bot, ball);

        // --- NOVA LÓGICA DE DECISÃO DE CHUTE ---
        let distToBall = Math.hypot(ball.x - bot.x, ball.y - bot.y);
        let botToBallX = ball.x - bot.x;
        let botToBallY = ball.y - bot.y;
        let ballToGoalX = targetGoalX - ball.x;
        let ballToGoalY = targetGoalY - ball.y;

        let lenB2B = distToBall;
        let lenB2G = Math.hypot(ballToGoalX, ballToGoalY);

        // 1. Está mirando no gol?
        let isFacingGoal = false;
        if (lenB2B > 0 && lenB2G > 0) {
            let dot = ((botToBallX / lenB2B) * (ballToGoalX / lenB2G)) + ((botToBallY / lenB2B) * (ballToGoalY / lenB2G));
            isFacingGoal = dot > 0.95;
        }
        
        // 2. ZONA DE CHUTE: O bot está do meio de campo pra frente?
        // A largura do canvas é 800. O gol alvo é no x=0. Então consideramos ataque se x < 450.
        let inShootingZone = bot.x < 450; 
        
        // Ele só vai acionar o anel branco se estiver PERTO, MIRANDO e NA ZONA DE ATAQUE!
        bot.isKicking = distToBall < bot.r + ball.r + KICK_RADIUS + 10 && isFacingGoal && inShootingZone;
        
        // Aplica a força do chute
        if (bot.isKicking && distToBall < bot.r + ball.r + KICK_RADIUS) {
            ball.vx += (botToBallX / lenB2B) * KICK_POWER;
            ball.vy += (botToBallY / lenB2B) * KICK_POWER;
        }
    }

    // ===== BALL =====
    ball.vx *= BALL_FRICTION;
    ball.vy *= BALL_FRICTION;

    ball.x += ball.vx;
    ball.y += ball.vy;

    // ===== GOLS E PAREDES =====
    if (ball.x < ball.r) {
        if (ball.y > GOAL_TOP && ball.y < GOAL_BOTTOM) {
            scoreRight++; reset();
        } else {
            ball.x = ball.r; ball.vx *= -0.5;
        }
    }

    if (ball.x > canvas.width - ball.r) {
        if (ball.y > GOAL_TOP && ball.y < GOAL_BOTTOM) {
            scoreLeft++; reset();
        } else {
            ball.x = canvas.width - ball.r; ball.vx *= -0.5;
        }
    }

    if (ball.y < ball.r) { ball.y = ball.r; ball.vy *= -0.5; }
    if (ball.y > canvas.height - ball.r) { ball.y = canvas.height - ball.r; ball.vy *= -0.5; }

    // Limites player/bot
    [player, bot].forEach(p => {
        p.x = clamp(p.x, p.r, canvas.width - p.r);
        p.y = clamp(p.y, p.r, canvas.height - p.r);
    });
}

// ================= DRAW =================
function drawPlayer(p) {
    ctx.lineWidth = 3;
    
    ctx.strokeStyle = "black";
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = p.isKicking ? "white" : "rgba(0,0,0,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r - 4, 0, Math.PI * 2);
    ctx.stroke();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#718c5a"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(0, GOAL_TOP);
    ctx.lineTo(0, GOAL_BOTTOM);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width, GOAL_TOP);
    ctx.lineTo(canvas.width, GOAL_BOTTOM);
    ctx.stroke();

    drawPlayer(player);
    if (botActive) drawPlayer(bot);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${scoreLeft} - ${scoreRight}`, canvas.width / 2, 40);

    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Bot: ${botActive ? "ON" : "OFF"} (P)`, 10, 20);
}

// ================= LOOP =================
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function handleCommand(cmdStr) {
    const args = cmdStr.split(" ");
    const command = args[0].toLowerCase();

    switch(command) {
        case "/comandos":
        case "/help":
            writeToChat("--- Lista de Comandos ---");
            writeToChat("/clear - Limpa as mensagens do chat");
            writeToChat("/reset - Reinicia o placar e as posições");
            writeToChat("/zoom [valor] - Ajusta o zoom (ex: /zoom 0.8)");
            writeToChat("/p - Liga/Desliga os bots");
            writeToChat("--- --- --- --- --- ---");
            break;
        case "/clear":
            if (typeof chatMessages !== 'undefined') chatMessages.innerHTML = "";
            writeToChat("Chat limpo.");
            break;
        case "/reset":
            scoreLeft = 0;
            scoreRight = 0;
            if (typeof gameTime !== 'undefined') gameTime = 0; 
            reset(); 
            writeToChat("A partida e o placar foram reiniciados.");
            break;
        case "/zoom": 
            let val = parseFloat(args[1]);
            if (!isNaN(val) && val >= 0.3 && val <= 2) {
                if (typeof ZOOM !== 'undefined') ZOOM = val;
                writeToChat(`Zoom ajustado para ${val}.`);
            } else {
                writeToChat("Uso correto: /zoom [0.4 a 1.8]");
            }
            break;
        default:
            writeToChat("Comando desconhecido. Digite /comandos para ajuda.");
    }
}

function writeToChat(msg) {
    console.log("[CHAT]:", msg);
}

loop();