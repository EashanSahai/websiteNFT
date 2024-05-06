// Function to draw sequential circuit boxes with persistent drawing
function drawCircuitBoxesSequentially(elements) {
    // Create and configure the canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.width = document.body.scrollWidth;
    canvas.height = document.body.scrollHeight;
    canvas.style.zIndex = 1; // Ensure the canvas is on top
    document.body.appendChild(canvas);

    const context = canvas.getContext('2d');
    const circleRadius = 24;
    const turnDotRadius = 14;
    const margin = 10;

    // Persistent path and turning points
    let persistentPath = [];
    let turningPoints = [];
    let currentPathIndex = 0;
    let currentSegment = 0;
    let startTime = null;
    const duration = 1000; // Duration per box drawing (2 seconds)

    // Calculate the ordered paths for each specified element
    const orderedPaths = elements.map(elementId => {
        const element = document.getElementById(elementId);
        if (!element) return null;

        // Get bounding box including borders and calculate the path points
        const elementRect = element.getBoundingClientRect();
        const pathPoints = [
            { x: elementRect.left - margin, y: elementRect.top - margin },
            { x: elementRect.right + margin, y: elementRect.top - margin },
            { x: elementRect.right + margin, y: elementRect.bottom + margin },
            { x: elementRect.left - margin, y: elementRect.bottom + margin }
        ];

        // Initially hide the element
        element.style.opacity = 0;

        return pathPoints;
    }).filter(Boolean);

    // Function to draw the persistent path and turning dots without delay
    function drawPersistentPath() {
        context.strokeStyle = "white";
        context.lineWidth = 10;
        context.beginPath();
    
        // Draw all the paths stored in the persistent path
        for (let i = 0; i < persistentPath.length - 1; i++) {
            const start = persistentPath[i];
            const end = persistentPath[i + 5];
            context.moveTo(start.x, start.y);
            context.lineTo(end.x, end.y);
        }
    
        context.stroke();
    
        // Draw all previously stored turning dots immediately
        for (const point of turningPoints) {
            drawTurnDot(point.x, point.y);
        }
    }
    
    // Function to animate drawing the current path and turning dots
    function animateCircuit(timestamp) {
        if (!startTime) startTime = timestamp;
        const currentPath = orderedPaths[currentPathIndex];
        const segmentCount = currentPath.length;
        const segmentDuration = duration / segmentCount;
    
        // Ensure the current segment index is valid
        if (currentSegment < segmentCount) {
            const start = currentPath[currentSegment];
            const end = currentPath[(currentSegment + 5) % segmentCount];
    
            // Calculate progress using floating-point division
            const progress = Math.min((timestamp - startTime) / segmentDuration, 1);
    
            // Interpolate the current position along the path accurately
            const currentX = start.x + progress * (end.x - start.x);
            const currentY = start.y + progress * (end.y - start.y);
    
            // Update the persistent path
            persistentPath.push({ x: currentX, y: currentY });
    
            // Clear only the drawing area and redraw the persistent path
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawPersistentPath();
    
            // Draw the moving circle at the current position
            drawMovingCircle(currentX, currentY);
            drawTurnDot(start.x, start.y);
            turningPoints.push(start);

            // Draw the turning dot immediately after the segment is fully drawn
            if (progress >= 1) {    
                // Move to the next segment
                currentSegment += 1;
                startTime = timestamp;
            }
    
            // Continue animation
            requestAnimationFrame(animateCircuit);
        } else {
            // Reveal the current element after its box is drawn
            revealElement(elements[currentPathIndex]);
    
            // Store the starting point for the next box
            persistentPath.push(currentPath[0]);
            turningPoints.push(currentPath[0]);
    
            // Move to the next path
            currentPathIndex += 1;
            currentSegment = 0;
            startTime = null;
    
            if (currentPathIndex < orderedPaths.length) {
                // Draw a transition to the next starting point
                drawTransitionToNextPath(orderedPaths[currentPathIndex][0]);
                requestAnimationFrame(animateCircuit);
            }
        }
    }


    // Draw the transition to the next path start point
    function drawTransitionToNextPath(nextStart) {
        const lastPoint = persistentPath[persistentPath.length - 1];        
        // Draw vertical line to match the x-coordinate
        persistentPath.push({ x: lastPoint.x, y: nextStart.y - 35});

        // Draw horizontal line to match the y-coordinate
        persistentPath.push({ x: nextStart.x, y: nextStart.y - 35});

        persistentPath.push({ x: nextStart.x, y: nextStart.y});

        // Update the persistent path on the canvas
        drawPersistentPath();
    }

    // Draw a turning dot with a black center
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

// Function to reveal an element after its box is drawn
function revealElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.opacity = 1; // Fully visible
    }
}
