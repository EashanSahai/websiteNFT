// Function to draw a circuit around an element (section)
function drawCircuitAroundElement(elementId, startPoint, endPoint, drawingOrder) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Create a full-page canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.width = document.body.scrollWidth;
    canvas.height = document.body.scrollHeight;
    canvas.style.zIndex = -1;
    document.body.appendChild(canvas);

    const context = canvas.getContext('2d');
    const margin = 20; // Margin around the section
    const circleRadius = 12;
    const turnDotRadius = 10;

    // Get the section's dimensions within the bounding rectangle
    const sectionRect = element.getBoundingClientRect();

    // Define the path points with a margin around the section
    const pathPoints = [
        { x: sectionRect.left - margin, y: sectionRect.top - margin },
        { x: sectionRect.right + margin, y: sectionRect.top - margin },
        { x: sectionRect.right + margin, y: sectionRect.bottom + margin },
        { x: sectionRect.left - margin, y: sectionRect.bottom + margin }
    ];

    // Reorder path points based on the provided drawing order
    const orderedPath = drawingOrder.map(i => pathPoints[i]);

    // Add start and end points if provided
    if (startPoint) orderedPath.unshift(startPoint);
    if (endPoint) orderedPath.push(endPoint);
    else orderedPath.push(orderedPath[0]); // Close the path

    let currentSegment = 0;
    let startTime = null;
    const segmentCount = orderedPath.length - 1;
    const duration = 5000; // Duration in milliseconds (5 seconds)

    // Function to animate the circuit drawing
    function animateCircuit(timestamp) {
        if (!startTime) startTime = timestamp;
        const segmentDuration = duration / segmentCount;

        // Ensure current segment index is valid
        if (currentSegment < segmentCount) {
            const start = orderedPath[currentSegment];
            const end = orderedPath[currentSegment + 1];

            // Determine progress within the current segment
            const progress = (timestamp - startTime) / segmentDuration;

            // Calculate the current position along the path using linear interpolation
            const currentX = start.x + progress * (end.x - start.x);
            const currentY = start.y + progress * (end.y - start.y);

            // Clear the canvas and redraw the path up to the current segment
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawPathUpTo(currentSegment, currentX, currentY);

            // Draw all previously drawn turning dots up to the current segment
            for (let i = 0; i <= currentSegment; i++) {
                drawTurnDot(orderedPath[i].x, orderedPath[i].y);
            }

            // Draw the moving circle at the current position
            drawMovingCircle(currentX, currentY);

            // Draw the turning dot at the beginning of each segment
            if (progress >= 1) {
                drawTurnDot(start.x, start.y);

                // Move to the next segment
                currentSegment += 1;
                startTime = timestamp;
            }

            // Continue animation
            requestAnimationFrame(animateCircuit);
        } else {
            // Draw the final turning dot and moving circle
            drawTurnDot(orderedPath[segmentCount].x, orderedPath[segmentCount].y);
            drawMovingCircle(orderedPath[segmentCount].x, orderedPath[segmentCount].y);

            // Make the section contents visible after drawing
            revealContents(elementId);
        }
    }

    // Draw the path up to the current point
    function drawPathUpTo(segmentIndex, currentX, currentY) {
        context.strokeStyle = "white";
        context.lineWidth = 2;
        context.beginPath();

        // Draw all completed segments
        for (let i = 0; i < segmentIndex; i++) {
            context.moveTo(orderedPath[i].x, orderedPath[i].y);
            context.lineTo(orderedPath[i + 1].x, orderedPath[i + 1].y);
        }

        // Draw the current segment partially, up to the moving dot
        if (segmentIndex < segmentCount) {
            context.moveTo(orderedPath[segmentIndex].x, orderedPath[segmentIndex].y);
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

    // Start the circuit animation
    requestAnimationFrame(animateCircuit);
}

// Function to reveal the contents after drawing the circuit
function revealContents(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.opacity = 1; // Fully visible
    }
}
