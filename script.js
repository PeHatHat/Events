const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fireworks = [];
const particles = [];
const colorPalettes = [
    ["255,255,255", "255,240,0", "255,100,0"], // Vàng & Trắng
    ["255,105,180", "255,255,255"],           // Hồng & Trắng
    ["72,209,204", "255,255,255"],             // Xanh Teal & Trắng
    ["147,112,219", "255,255,255"],           // Tím & Trắng
];

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomColorPalette() {
    return colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
}

class Firework {
    constructor(startX, startY, targetX, targetY) {
        this.startX = startX;
        this.startY = startY;
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.trail = [];
        this.trailLength = 10;
        this.timeAlive = 0;
        this.colorPalette = getRandomColorPalette();
        this.decayRate = random(0.015, 0.03);
        this.speed = random(10, 15);
        this.acceleration = 0.05;
        this.explode = false;
        this.explosionShape = Math.random() < 0.5 ? 'star' : 'circle'; // Ngẫu nhiên sao hoặc tròn (BÌNH THƯỜNG HƠN)
        this.fireworkSize = random(0.8, 1.2); // Kích thước nhỏ hơn một chút
        for (let i = 0; i < this.trailLength; i++) {
            this.trail.push({ x: this.x, y: this.y });
        }
    }

    update() {
        this.timeAlive++;
        this.trail.unshift({ x: this.x, y: this.y });
        this.trail.pop();

        if (!this.explode) {
            const dx = this.targetX - this.startX;
            const dy = this.targetY - this.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            this.speed += this.acceleration;
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;

            const currentDistance = Math.sqrt(Math.pow(this.x - this.startX, 2) + Math.pow(this.y - this.startY, 2));
            if (currentDistance >= distance * 0.8 || this.timeAlive > 100) {
                this.explode = true;
                this.explodeParticles();
            }
        } else {
            this.explodeParticles();
        }
    }

    explodeParticles() {
        if (this.particlesCreated) return;
        this.particlesCreated = true;

        const explosionRadius = random(80, 150) * this.fireworkSize; // Bán kính nổ nhỏ hơn
        const particleCount = 150 * this.fireworkSize;             // Ít hạt hơn

        if (this.explosionShape === 'star') {
            this.explodeStar(particleCount, explosionRadius);
        } else if (this.explosionShape === 'circle') {
            this.explodeCircle(particleCount, explosionRadius); // Nổ tròn
        }

        if (Math.random() < 0.2) { // Giảm xác suất nổ thứ cấp
            setTimeout(() => {
                this.explodeCircle(particleCount / 3, explosionRadius / 3); // Nổ tròn nhỏ hơn nữa và ít hạt hơn
            }, random(100, 300));
        }
    }


    explodeCircle(particleCount, explosionRadius) { // Hàm nổ tròn (BÌNH THƯỜNG)
        for (let i = 0; i < particleCount; i++) {
            const angle = random(0, Math.PI * 2);
            const speed = random(0.5, 3); // Tốc độ hạt chậm hơn
            const color = this.colorPalette[i % this.colorPalette.length];

            particles.push(new Particle(
                this.x,
                this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                random(60, 90),
                this.decayRate
            ));
        }
    }


    explodeStar(particleCount, explosionRadius) {
        const starPoints = 5;
        for (let i = 0; i < particleCount; i++) {
            const pointIndex = i % starPoints;
            const angle = ((Math.PI * 2) / starPoints) * pointIndex + random(-0.2, 0.2);
            const speed = random(1, 5);
            const distance = pointIndex % 2 === 0 ? explosionRadius : explosionRadius * 0.5;
            const color = this.colorPalette[i % this.colorPalette.length];

            particles.push(new Particle(
                this.x + Math.cos(angle) * distance,
                this.y + Math.sin(angle) * distance,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                random(80, 100),
                this.decayRate
            ));
        }
    }


    draw() {
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(255,255,255,0.5)`; // Vệt trắng đơn giản
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.stroke();
    }
}


class Particle {
    constructor(x, y, speedX, speedY, color, brightness, decayRate) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
        this.brightness = brightness;
        this.alpha = 1;
        this.decayRate = decayRate;
        this.gravity = 0.03;
        this.friction = 0.98;
        this.size = random(2, 4); // Hạt nhỏ hơn một chút
    }

    update() {
        this.speedY += this.gravity;
        this.speedX *= this.friction;
        this.speedY *= this.friction;
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decayRate;
        if (this.alpha < 0) this.alpha = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.shadowColor = `rgba(${this.color}, ${Math.min(this.alpha + 0.5, 1)})`;
        ctx.shadowBlur = this.size + 3; // Bóng đổ nhỏ hơn
        ctx.fill();
    }
}


function createFirework() {
    const startX = random(canvas.width * 0.2, canvas.width * 0.8);
    const startY = canvas.height;
    const targetX = random(canvas.width * 0.2, canvas.width * 0.8);
    const targetY = random(canvas.height * 0.1, canvas.height * 0.3);

    fireworks.push(new Firework(startX, startY, targetX, targetY));
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; // Nền trong suốt hơn
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworks.forEach((firework, index) => {
        firework.update();
        firework.draw();
        if (firework.explode && firework.particlesCreated) {
            if (particles.every(particle => particle.alpha <= 0) && firework.particlesCreated) {
                fireworks.splice(index, 1);
            }
        }
    });

    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw();
        if (particle.alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

setInterval(createFirework, 300); // Tần suất pháo hoa chậm hơn một chút
animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

canvas.addEventListener('click', (event) => {
    const targetX = event.clientX;
    const targetY = event.clientY;
    const startX = canvas.width / 2;
    const startY = canvas.height;
    fireworks.push(new Firework(startX, startY, targetX, targetY));
});