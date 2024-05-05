// Initialization
const canvas = document.getElementById("animationCanvas");
const context = canvas.getContext("2d");

const mainHeader = document.getElementById("main-header");
const caption = document.getElementById("caption");

let isBlinking = true;
let blinkInterval;
let pathPoints = [];
let pathDrawn = false;

// Function to blink the initial dot
function blinkDot(x, y) {
    let visible = true;
    blinkInterval = setInterval(() => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (visible) {
            drawDot(x, y);
        }
        visible = !visible;
    }, 500);
}

// Function to draw a static dot
function drawDot(x, y) {
    context.fillStyle = "white";
    context.beginPath();
    context.arc(x, y, 8, 0, 2 * Math.PI);
    context.fill();
}
// Function to draw circuit lines
function drawCircuit() {
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.beginPath();
    // Example Path (customize based on your design)
    context.moveTo(100, 300); // Starting point
    context.lineTo(200, 300); // Horizontal to the right
    context.lineTo(200, 200); // Upwards
    context.lineTo(500, 200); // Far to the right

    context.stroke();
}
function fadeIn(element) {
    element.style.display = 'block';
    element.style.opacity = 0;
    let opacity = 0;
    const interval = setInterval(() => {
        opacity += 0.05;
        if (opacity >= 1) {
            clearInterval(interval);
        }
        element.style.opacity = opacity;
    }, 50);
}

// Animation initiation
function startAnimation() {
    drawDot(100, 300); // Example starting position
    blinkDot(100, 300);

    // Stop blinking and draw the circuit after 3 seconds
    setTimeout(() => {
        clearInterval(blinkInterval);
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawCircuit();

        // After circuit is drawn, fade in headers
        fadeIn(mainHeader);
        fadeIn(caption);
    }, 3000);
}
// Start the animation
startAnimation();
