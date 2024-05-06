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
    let connectorPath = [];
    let currentPathIndex = 0;
    let currentSegment = 0;
    let startTime = null;
    const duration = 1000; // Duration per box drawing (1 second)

    // Calculate the ordered paths for each specified element
    const orderedPaths = elements.map(elementId => {
        const element = document.getElementById(elementId);
        if (!element) return null;

        // Get the bounding box including borders and calculate the path points
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

    // Function to draw a persistent path with a specified style
    function drawPersistentPath() {
        context.beginPath();

        // Apply distinct styles for box paths
        context.strokeStyle = "white";
        context.lineWidth = 10;

        // Draw all the paths stored in the persistent path
        for (let i = 0; i < persistentPath.length - 1; i++) {
            const start = persistentPath[i];
            const end = persistentPath[i + 1];
            context.moveTo(start.x, start.y);
            if(start.x === end.x || start.y === end.y) {
                context.lineTo(end.x, end.y);
            }
        }

        context.stroke();

        // Draw all previously stored turning dots
        for (const point of turningPoints) {
            drawTurnDot(point.x, point.y);
        }
    }
    function drawPersistentPathConnector() {
        context.beginPath();
        context.strokeStyle = '#2f2f30';
        context.lineWidth = 10;

        // Draw all the paths stored in the persistent path
        for (let i = 0; i < connectorPath.length - 1; i++) {
            const start = connectorPath[i];
            const end = connectorPath[i + 1];
            context.moveTo(start.x, start.y);
            if (end.x < start.x) {
                context.lineTo(end.x - context.lineWidth/2, end.y);
            } else if (end.x > start.x) {
                context.lineTo(end.x + context.lineWidth/2, end.y);
            } else if (end.y < start.y) {
                context.lineTo(end.x, end.y - context.lineWidth/2);
            } else if (end.y > start.y) {
                context.lineTo(end.x, end.y + context.lineWidth/2);
            }
        }

        context.stroke();

        // Draw all previously stored turning dots
        for (const point of turningPoints) {
            drawTurnDot(point.x, point.y);
        }
    }

    // Function to animate drawing the current path
    function animateCircuit(timestamp) {
        if (!startTime) startTime = timestamp;
        const currentPath = orderedPaths[currentPathIndex];
        const segmentCount = currentPath.length;
        const segmentDuration = duration / segmentCount;

        // Ensure the current segment index is valid
        if (currentSegment < segmentCount) {
            const start = currentPath[currentSegment];
            const end = currentPath[(currentSegment + 1) % segmentCount];

            // Calculate progress using floating-point division
            const progress = Math.min((timestamp - startTime) / segmentDuration, 1);

            // Interpolate the current position along the path accurately
            const currentX = start.x + progress * (end.x - start.x);
            const currentY = start.y + progress * (end.y - start.y);

            // Update the persistent path
            persistentPath.push({ x: currentX, y: currentY });
            connectorPath.push({ x: currentX, y: currentY });
            // Clear the drawing area and redraw the persistent path
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawPersistentPathConnector();
            drawPersistentPath();
            // Draw the moving circle at the current position
            drawMovingCircle(currentX, currentY);
            if (!turningPoints.some(point => point.x === start.x && point.y === start.y)) {
                    drawTurnDot(start.x, start.y);
                    turningPoints.push(start);
            }
            // Store and draw the turning dot only after the segment is fully drawn
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

    // Draw the transition to the next path starting point
    function drawTransitionToNextPath(nextStart) {
        const lastPoint = persistentPath[persistentPath.length - 1001];
        connectorPath.push({ x: lastPoint.x - 100, y: lastPoint.y});
        connectorPath.push({ x: lastPoint.x - 100, y: nextStart.y - 35 });
        connectorPath.push({ x: nextStart.x, y: nextStart.y - 35 });
        connectorPath.push({ x: nextStart.x, y: nextStart.y });
        
        // Update the persistent path on the canvas with connector style
        drawPersistentPathConnector();
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
