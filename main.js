// Initialization
const canvas = document.getElementById("animationCanvas");
const context = canvas.getContext("2d");

const mainHeader = document.getElementById("main-header");
const caption = document.getElementById("caption");

const pathPoints = [
    { x: 100, y: 300 },
    { x: 200, y: 300 },
    { x: 200, y: 200 },
    { x: 500, y: 200 }
];

let currentSegment = 0;
let startTime = null;
const duration = 5000; // Duration in milliseconds (5 seconds)
const circleRadius = 8;
const turnDotRadius = 12;
const drawnTurnDots = new Set(); // Track which dots have been drawn

// Function to animate the circuit drawing
function animateCircuit(timestamp) {
    if (!startTime) startTime = timestamp;
    const segmentCount = pathPoints.length - 1;
    const segmentDuration = duration / segmentCount;

    // Determine progress within the current segment
    const progress = (timestamp - startTime) / segmentDuration;

    if (progress >= 1) {
        // Add the current segment's start point as a drawn dot
        drawnTurnDots.add(currentSegment);

        // Move to the next segment
        currentSegment += 1;
        startTime = timestamp;

        if (currentSegment >= segmentCount) {
            // End animation if all segments are drawn
            drawFinalPath();
            drawMovingCircle(pathPoints[segmentCount].x, pathPoints[segmentCount].y);
            fadeInHeaders();
            return;
        }
    }

    // Calculate current position along the path using linear interpolation
    const start = pathPoints[currentSegment];
    const end = pathPoints[currentSegment + 1];
    const currentX = start.x + progress * (end.x - start.x);
    const currentY = start.y + progress * (end.y - start.y);

    // Clear the canvas and redraw the path so far
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPathUpTo(currentSegment, currentX, currentY);

    // Draw previously marked turn dots
    for (const segmentIndex of drawnTurnDots) {
        drawTurnDot(pathPoints[segmentIndex].x, pathPoints[segmentIndex].y);
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
        context.moveTo(pathPoints[i].x, pathPoints[i].y);
        context.lineTo(pathPoints[i + 1].x, pathPoints[i + 1].y);
    }

    // Draw the current segment partially, up to the moving dot
    if (segmentIndex < pathPoints.length - 1) {
        context.moveTo(pathPoints[segmentIndex].x, pathPoints[segmentIndex].y);
        context.lineTo(currentX, currentY);
    }

    context.stroke();
}

// Draw the final path without animation
function drawFinalPath() {
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.beginPath();
    for (let i = 0; i < pathPoints.length - 1; i++) {
        context.moveTo(pathPoints[i].x, pathPoints[i].y);
        context.lineTo(pathPoints[i + 1].x, pathPoints[i + 1].y);
    }
    context.stroke();
}

// Draw the "turning" dot with a black center
function drawTurnDot(x, y) {
    // Outer white circle
    context.fillStyle = "white";
    context.beginPath();
    context.arc(x, y, turnDotRadius, 0, 2 * Math.PI);
    context.fill();

    // Inner black circle
    context.fillStyle = "black";
    context.beginPath();
    context.arc(x, y, circleRadius, 0, 2 * Math.PI);
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

// Start the circuit animation
requestAnimationFrame(animateCircuit);
