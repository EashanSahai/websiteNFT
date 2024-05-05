// Initialization
const canvas = document.getElementById("animationCanvas");
const context = canvas.getContext("2d");

const mainHeader = document.getElementById("main-header");
const caption = document.getElementById("caption");

const headerMargin = 20;
let pathPoints = [];
let currentSegment = 0;
let startTime = null;
const duration = 5000; // Duration in milliseconds (5 seconds)
const circleRadius = 12;
const turnDotRadius = 10;

function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    calculatePathPoints();
}

function calculatePathPoints() {
    const headerRect = mainHeader.getBoundingClientRect();
    const captionRect = caption.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // Convert DOM coordinates to canvas coordinates
    const offsetX = canvasRect.left;
    const offsetY = canvasRect.top;

    pathPoints = [
        { x: headerRect.left - offsetX - headerMargin, y: headerRect.top - offsetY - headerMargin },
        { x: headerRect.right - offsetX + headerMargin, y: headerRect.top - offsetY - headerMargin },
        { x: headerRect.right - offsetX + headerMargin, y: headerRect.bottom - offsetY + headerMargin },
        { x: headerRect.left - offsetX - headerMargin, y: headerRect.bottom - offsetY + headerMargin }
    ];

    // Reset animation
    currentSegment = 0;
    startTime = null;
    requestAnimationFrame(animateCircuit);
}

// Function to animate the circuit drawing
function animateCircuit(timestamp) {
    if (!startTime) startTime = timestamp;
    const segmentCount = pathPoints.length - 1;
    const segmentDuration = duration / segmentCount;

    // Determine progress within the current segment
    const progress = (timestamp - startTime) / segmentDuration;

    // Draw the turning dot at the beginning of each segment
    if (progress >= 1) {
        drawTurnDot(pathPoints[currentSegment].x, pathPoints[currentSegment].y);

        // Move to the next segment
        currentSegment += 1;
        startTime = timestamp;

        if (currentSegment >= segmentCount) {
            // Draw the final turning dot and moving circle
            drawTurnDot(pathPoints[segmentCount].x, pathPoints[segmentCount].y);
            drawMovingCircle(pathPoints[segmentCount].x, pathPoints[segmentCount].y);
            fadeInHeaders();
            return;
        }
    }

    // Calculate the current position along the path using linear interpolation
    const start = pathPoints[currentSegment];
    const end = pathPoints[currentSegment + 1];
    const currentX = start.x + progress * (end.x - start.x);
    const currentY = start.y + progress * (end.y - start.y);

    // Clear the canvas and redraw the path up to the current segment
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPathUpTo(currentSegment, currentX, currentY);

    // Draw all previously drawn turning dots up to the current segment
    for (let i = 0; i <= currentSegment; i++) {
        drawTurnDot(pathPoints[i].x, pathPoints[i].y);
    }

    // Draw the moving circle at the current position
    drawMovingCircle(currentX, currentY);

    // Continue animation
    requestAnimationFrame(animateCircuit);
}

// Draw the path up to the current point
function drawPathUpTo(segmentIndex, currentX, currentY) {
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.beginPath();

    // Draw all completed segments
    for (let i = 0; i < segmentIndex; i++) {
        context.moveTo(pathPoints[i].x, pathPoints[i + 1].y);
        context.lineTo(pathPoints[i + 1].x, pathPoints[i + 1].y);
    }

    // Draw the current segment partially, up to the moving dot
    if (segmentIndex < pathPoints.length - 1) {
        context.moveTo(pathPoints[segmentIndex].x, pathPoints[segmentIndex].y);
        context.lineTo(currentX, currentY);
    }

    context.stroke();
}

// Draw the "turning" dot with a black center
function drawTurnDot(x, y) {
    // Outer circle (white)
    context.fillStyle = "white";
    context.beginPath();
    context.arc(x, y, circleRadius, 0, 2 * Math.PI);
    context.fill();

    // Inner circle (black)
    context.fillStyle = "black";
    context.beginPath();
    context.arc(x, y, turnDotRadius, 0, 2 * Math.PI);
    context.fill();
}

// Draw the moving circle
function drawMovingCircle(x, y) {
    context.fillStyle = "white";
    context.beginPath();
    context.arc(x, y, circleRadius, 0, 2 * Math.PI);
    context.fill();
}

// Function to gradually show headers
function fadeInHeaders() {
    fadeIn(mainHeader);
    fadeIn(caption);
}

function fadeIn(element) {
    element.style.display = 'block';
    element.style.opacity = 0;
    let opacity = 0;
    const interval = setInterval(() => {
        opacity += 0.05;
        if (opacity >= 1) clearInterval(interval);
        element.style.opacity = opacity;
    }, 50);
}

// Adjust canvas size and recalculate points on window resize
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
