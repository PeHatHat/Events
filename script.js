const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fireworks = []; // Mảng chứa các đối tượng pháo hoa
const particles = []; // Mảng chứa các đối tượng hạt pháo hoa
const colorPalettes = [ // Mảng các bảng màu pháo hoa đa dạng và rực rỡ
    ["255,255,255", "255,240,0", "255,100,0"], // Vàng cổ điển & Trắng
    ["255,105,180", "255,0,0", "255,255,255"], // Hồng & Đỏ rực rỡ
    ["72,209,204", "0,255,0", "255,255,255"],   // Xanh Teal & Xanh lá cây mát mẻ
    ["147,112,219", "255,255,0", "255,255,255"], // Tím hoàng gia & Vàng
    ["255,192,203", "255,255,255", "255,182,193"], // Hồng phấn & Ngọc trai
    ["255,69,0", "255,255,255", "255,215,0"],   // Cam lửa & Vàng
    ["50,205,50", "255,255,255", "173,255,47"],  // Xanh lá cây tươi tốt & Xanh chanh
    ["211,211,211", "255,255,255", "169,169,169"], // Bạc & Thang xám
    ["255,223,0", "205,127,50", "255,248,220"], // Vàng đậm & Trắng ngà
    ["192,192,192", "255,255,255", "245,245,245"], // Bạc kim loại & Trắng
    ["205,127,50", "244,164,96", "255,235,205"]   // Đồng & Hồng đào nhạt
];


/**
 * Hàm tạo số ngẫu nhiên trong khoảng [min, max)
 * @param {number} min Giá trị nhỏ nhất (bao gồm)
 * @param {number} max Giá trị lớn nhất (không bao gồm)
 * @returns {number} Số ngẫu nhiên
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Hàm chọn ngẫu nhiên một bảng màu từ mảng colorPalettes
 * @returns {string[]} Một bảng màu ngẫu nhiên (mảng các mã màu RGB)
 */
function getRandomColorPalette() {
    return colorPalettes[Math.floor(Math.random() * colorPalettes.length)]; // Sử dụng bảng màu mặc định
}


class Firework {
    /**
     * Khởi tạo một đối tượng pháo hoa
     * @param {number} startX Vị trí X bắt đầu
     * @param {number} startY Vị trí Y bắt đầu
     * @param {number} targetX Vị trí X mục tiêu
     * @param {number} targetY Vị trí Y mục tiêu
     */
    constructor(startX, startY, targetX, targetY) {
        this.startX = startX;
        this.startY = startY;
        this.x = startX;       // Vị trí X hiện tại
        this.y = startY;       // Vị trí Y hiện tại
        this.targetX = targetX;
        this.targetY = targetY;
        this.trail = [];        // Mảng lưu trữ các điểm của vệt pháo hoa
        this.trailLength = 10;  // Độ dài vệt pháo hoa
        this.timeAlive = 0;     // Thời gian tồn tại của pháo hoa
        this.colorPalette = getRandomColorPalette(); // Bảng màu ngẫu nhiên cho pháo hoa
        this.hue = random(0, 360);         // Màu sắc ngẫu nhiên (Hue)
        this.brightness = random(50, 80);   // Độ sáng ngẫu nhiên
        this.decayRate = random(0.015, 0.03); // Tốc độ mờ dần của hạt pháo hoa
        this.speed = random(10, 15);        // Tốc độ bay lên ban đầu
        this.acceleration = 0.05;          // Gia tốc tăng tốc
        this.explode = false;              // Trạng thái đã nổ hay chưa
        this.explosionShape = Math.random() < 0.2 ? 'star' : (Math.random() < 0.5 ? 'burst' : (Math.random() < 0.8 ? 'spiral' : 'circle')); // Hình dạng nổ ngẫu nhiên (sao, burst, xoắn ốc, tròn)
        this.fireworkSize = random(0.8, 1.5); // Kích thước pháo hoa ngẫu nhiên

        // Khởi tạo vệt pháo hoa
        for (let i = 0; i < this.trailLength; i++) {
            this.trail.push({ x: this.x, y: this.y });
        }
    }

    /**
     * Cập nhật trạng thái pháo hoa (vị trí, vệt, kiểm tra nổ)
     */
    update() {
        this.timeAlive++;

        // Cập nhật vệt pháo hoa (thêm điểm mới ở đầu, xóa điểm cũ ở cuối)
        this.trail.unshift({ x: this.x, y: this.y });
        this.trail.pop();

        if (!this.explode) {
            // Tính toán hướng bay đến mục tiêu
            const dx = this.targetX - this.startX;
            const dy = this.targetY - this.startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            // Tăng tốc độ và di chuyển pháo hoa
            this.speed += this.acceleration;
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;

            // Kiểm tra xem pháo hoa đã đến gần mục tiêu hoặc thời gian tồn tại quá lâu để nổ
            const currentDistance = Math.sqrt(Math.pow(this.x - this.startX, 2) + Math.pow(this.y - this.startY, 2));
            if (currentDistance >= distance * 0.8 || this.timeAlive > 100) {
                this.explode = true;
                this.explodeParticles(); // Gọi hàm tạo hạt pháo hoa khi nổ
            }
        } else {
            this.explodeParticles(); // Đảm bảo hạt pháo hoa vẫn được tạo nếu explode = true
        }
    }

    /**
     * Tạo các hạt pháo hoa khi pháo hoa nổ
     */
    explodeParticles() {
        if (this.particlesCreated) return; // Ngăn tạo hạt nhiều lần
        this.particlesCreated = true;

        const explosionRadius = random(100, 200) * this.fireworkSize; // Bán kính nổ ngẫu nhiên
        const particleCount = 200 * this.fireworkSize;             // Số lượng hạt pháo hoa

        // Phát âm thanh pháo hoa khi nổ
        const sound = document.getElementById('fireworkSound');
        if (sound) {
            sound.currentTime = 0; // Reset thời gian phát về 0 để có thể phát lại nhanh chóng
            sound.play();
        }

        // Chọn hình dạng nổ và tạo hạt tương ứng
        if (this.explosionShape === 'star') {
            this.explodeStar(particleCount, explosionRadius);
        } else if (this.explosionShape === 'burst') {
            this.explodeBurst(particleCount, explosionRadius);
        } else if (this.explosionShape === 'spiral') {
            this.explodeSpiral(particleCount, explosionRadius);
        }
        else { // Mặc định là hình tròn
            this.explodeCircle(particleCount, explosionRadius);
        }

        // Tạo hiệu ứng nổ thứ cấp nhỏ hơn (tăng độ phức tạp)
        if (Math.random() < 0.3) {
            setTimeout(() => {
                this.explodeCircle(particleCount / 2, explosionRadius / 2); // Nổ tròn thứ cấp nhỏ hơn
            }, random(100, 300)); // Thời gian trễ ngẫu nhiên
        }
    }

    /**
     * Tạo hạt pháo hoa hình tròn
     * @param {number} particleCount Số lượng hạt
     * @param {number} explosionRadius Bán kính nổ
     */
    explodeCircle(particleCount, explosionRadius) {
        for (let i = 0; i < particleCount; i++) {
            const angle = random(0, Math.PI * 2); // Góc ngẫu nhiên 360 độ
            const speed = random(1, 7);           // Tốc độ hạt ngẫu nhiên
            const color = this.colorPalette[i % this.colorPalette.length]; // Màu từ bảng màu

            particles.push(new Particle(
                this.x,
                this.y,
                Math.cos(angle) * speed, // Tốc độ X
                Math.sin(angle) * speed, // Tốc độ Y
                color,
                random(70, 100),        // Độ sáng hạt
                this.decayRate           // Tốc độ mờ dần
            ));
        }
    }

    /**
     * Tạo hạt pháo hoa hình burst (nổ tung tóe)
     * @param {number} particleCount Số lượng hạt
     * @param {number} explosionRadius Bán kính nổ
     */
    explodeBurst(particleCount, explosionRadius) {
        for (let i = 0; i < particleCount; i++) {
            const angle = random(0, Math.PI * 2);
            const speed = random(0.5, 4);
            const distanceOffset = random(0, explosionRadius); // Độ lệch khoảng cách từ tâm
            const color = this.colorPalette[i % this.colorPalette.length];

            particles.push(new Particle(
                this.x + Math.cos(angle) * distanceOffset, // Vị trí X lệch tâm
                this.y + Math.sin(angle) * distanceOffset, // Vị trí Y lệch tâm
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                random(70, 100),
                this.decayRate
            ));
        }
    }


    /**
     * Tạo hạt pháo hoa hình sao
     * @param {number} particleCount Số lượng hạt
     * @param {number} explosionRadius Bán kính nổ
     */
    explodeStar(particleCount, explosionRadius) {
        const starPoints = 5; // Số cánh sao
        for (let i = 0; i < particleCount; i++) {
            const pointIndex = i % starPoints;
            const angle = ((Math.PI * 2) / starPoints) * pointIndex + random(-0.2, 0.2); // Góc tạo hình sao
            const speed = random(1, 6);
            const distance = pointIndex % 2 === 0 ? explosionRadius : explosionRadius * 0.5; // Khoảng cách khác nhau cho các đỉnh sao
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

    /**
     * Tạo hạt pháo hoa hình xoắn ốc 
     * @param {number} particleCount Số lượng hạt
     * @param {number} explosionRadius Bán kính nổ
     */
    explodeSpiral(particleCount, explosionRadius) {
        for (let i = 0; i < particleCount; i++) {
            const angle = i * 0.2 + random(-0.5, 0.5); // Góc tạo hình xoắn ốc
            const speed = random(1, 5);
            const distance = (i / particleCount) * explosionRadius; // Khoảng cách tăng dần theo chỉ số hạt
            const color = this.colorPalette[i % this.colorPalette.length];

            particles.push(new Particle(
                this.x + Math.cos(angle) * distance,
                this.y + Math.sin(angle) * distance,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                random(70, 100),
                this.decayRate
            ));
        }
    }


    /**
     * Vẽ vệt pháo hoa
     */
    draw() {
        ctx.lineWidth = 2;
        ctx.strokeStyle = `var(--firework-trail-color)`; // Sử dụng biến CSS cho màu vệt
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.stroke();
    }
}


class Particle {
    /**
     * Khởi tạo một hạt pháo hoa
     * @param {number} x Vị trí X
     * @param {number} y Vị trí Y
     * @param {number} speedX Tốc độ X
     * @param {number} speedY Tốc độ Y
     * @param {string} color Màu sắc (RGB string)
     * @param {number} brightness Độ sáng
     * @param {number} decayRate Tốc độ mờ dần
     */
    constructor(x, y, speedX, speedY, color, brightness, decayRate) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
        this.brightness = brightness;
        this.alpha = 1;              // Độ trong suốt (alpha)
        this.decayRate = decayRate;    // Tốc độ mờ dần
        this.gravity = 0.03;         // Gia tốc trọng lực
        this.friction = 0.98;        // Ma sát (giảm tốc độ)
        this.size = random(2, 5);     // Kích thước hạt ngẫu nhiên
        this.hueShift = random(-10, 10); // Thay đổi màu sắc nhẹ nhàng
    }

    /**
     * Cập nhật trạng thái hạt pháo hoa (vị trí, tốc độ, độ trong suốt)
     */
    update() {
        this.speedY += this.gravity;
        this.speedX *= this.friction;
        this.speedY *= this.friction;
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decayRate;

        if (this.alpha < 0) this.alpha = 0; // Đảm bảo alpha không âm
    }

    /**
     * Vẽ hạt pháo hoa
     */
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); // Vẽ hình tròn
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`; // Màu sắc và độ trong suốt
        ctx.shadowColor = `rgba(${this.color}, ${Math.min(this.alpha + 0.5, 1)})`; // Màu bóng đổ (glow)
        ctx.shadowBlur = this.size + 5; // Độ mờ bóng đổ
        ctx.fill();
    }
}


/**
 * Hàm tạo pháo hoa mới tại vị trí ngẫu nhiên trên màn hình
 */
function createFirework() {
    const startX = random(canvas.width * 0.2, canvas.width * 0.8); // Vị trí X bắt đầu ngẫu nhiên (giữa màn hình)
    const startY = canvas.height;                                  // Vị trí Y bắt đầu (dưới cùng màn hình)
    const targetX = random(canvas.width * 0.2, canvas.width * 0.8); // Vị trí X mục tiêu ngẫu nhiên
    const targetY = random(canvas.height * 0.1, canvas.height * 0.3); // Vị trí Y mục tiêu ngẫu nhiên (phía trên)

    fireworks.push(new Firework(startX, startY, targetX, targetY)); // Thêm pháo hoa mới vào mảng
}

/**
 * Hàm hoạt hình, được gọi liên tục để cập nhật và vẽ khung hình
 */
function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Màu nền đen trong suốt (tạo hiệu ứng vệt mờ dần)
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Vẽ nền

    // Cập nhật và vẽ từng pháo hoa
    fireworks.forEach((firework, index) => {
        firework.update();
        firework.draw();

        // Kiểm tra nếu pháo hoa đã nổ và tất cả hạt đã mờ hết thì xóa pháo hoa
        if (firework.explode && firework.particlesCreated) {
            if (particles.every(particle => particle.alpha <= 0) && firework.particlesCreated) {
                fireworks.splice(index, 1); // Xóa pháo hoa khỏi mảng
            }
        }
    });

    // Cập nhật và vẽ từng hạt pháo hoa
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw();

        // Xóa hạt pháo hoa nếu đã mờ hết
        if (particle.alpha <= 0) {
            particles.splice(i, 1); // Xóa hạt khỏi mảng
        }
    }

    requestAnimationFrame(animate); // Gọi lại hàm animate ở khung hình tiếp theo (tạo vòng lặp hoạt hình)
}

setInterval(createFirework, 250); // Tạo pháo hoa mới mỗi 250ms
animate(); // Bắt đầu hoạt hình


// Xử lý sự kiện resize cửa sổ để canvas luôn vừa với kích thước màn hình
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Xử lý sự kiện click chuột để tạo pháo hoa tại vị trí click
canvas.addEventListener('click', (event) => {
    const targetX = event.clientX; // Vị trí X chuột click
    const targetY = event.clientY; // Vị trí Y chuột click
    const startX = canvas.width / 2; // Vị trí X bắt đầu (giữa màn hình)
    const startY = canvas.height;    // Vị trí Y bắt đầu (dưới cùng màn hình)
    fireworks.push(new Firework(startX, startY, targetX, targetY)); // Tạo pháo hoa mới tại vị trí click
});