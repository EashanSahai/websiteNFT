document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('circuitCanvas');
    const ctx = canvas.getContext('2d');
    const content = document.getElementById('content');
    const h1 = content.querySelector('h1');
    const h2 = content.querySelector('h2');
    const nextButton = document.getElementById('nextButton');
    const blinkDuration = 3000; // Blinking effect for 3 seconds

    // Setup the canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let blinkState = false;
    let blinkStart = Date.now();

    // Blinking Dot Animation
    function drawBlinkingDot() {
        const elapsed = Date.now() - blinkStart;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (elapsed < blinkDuration) {
            blinkState = !blinkState;
            ctx.fillStyle = blinkState ? 'white' : 'black';
            ctx.beginPath();
            ctx.arc(canvas.width / 4, canvas.height / 2, 10, 0, Math.PI * 2);
            ctx.fill();
        } else {
            drawCircuitPath();
        }

        if (elapsed < blinkDuration) {
            requestAnimationFrame(drawBlinkingDot);
        }
    }

    function drawCircuitPath() {
        // Example circuit path (customize this path as needed)
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;

        // Starting Point
        ctx.beginPath();
        ctx.moveTo(canvas.width / 4, canvas.height / 2);
        ctx.lineTo(canvas.width / 2, canvas.height / 2);
        ctx.lineTo(canvas.width / 2, canvas.height / 4);
        ctx.lineTo((3 * canvas.width) / 4, canvas.height / 4);
        ctx.lineTo((3 * canvas.width) / 4, canvas.height / 2);

        // Circles at junctions
        const junctions = [
            { x: canvas.width / 2, y: canvas.height / 2 },
            { x: canvas.width / 2, y: canvas.height / 4 },
            { x: (3 * canvas.width) / 4, y: canvas.height / 4 }
        ];
        junctions.forEach(j => {
            ctx.moveTo(j.x + 5, j.y);
            ctx.arc(j.x, j.y, 5, 0, Math.PI * 2);
        });

        // Finish the path
        ctx.stroke();
        ctx.beginPath();
        ctx.arc((3 * canvas.width) / 4, canvas.height / 2, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        // Fade-in and reveal content
        content.style.display = 'block';
        setTimeout(() => {
            h1.style.opacity = '1';
            h2.style.opacity = '1';
            nextButton.style.display = 'inline-block';
        }, 1000);
    }

    drawBlinkingDot();
});
