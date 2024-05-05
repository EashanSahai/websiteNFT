// Function to draw sequential circuit boxes around specified elements
function drawCircuitBoxesSequentially(elements) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.width = document.body.scrollWidth;
    canvas.height = document.body.scrollHeight;
    canvas.style.zIndex = 1; // Ensure the canvas is on top
    document.body.appendChild(canvas);

    const context = canvas.getContext('2d');
    const margin = 10; // Adjust margin around each box
    const circleRadius = 12;
    const turnDotRadius = 10;

    // Prepare path points for all specified elements sequentially
    const orderedPaths = [];
    for (const elementId of elements) {
        const element = document.getElementById(elementId);
        if (!element) continue;

        // Calculate accurate dimensions based on content type
        let elementRect = element.getBoundingClientRect();
        const styles = getComputedStyle(element);

        // Adjust based on the computed styles and specific tag types
        if (element.tagName === 'IMG') {
            elementRect = {
                left: elementRect.left,
                top: elementRect.top,
                right: elementRect.left + parseInt(styles.width),
                bottom: elementRect.top + parseInt(styles.height)
            };
        }

        // Calculate the bounding box with a specified margin
        const pathPoints = [
            { x: elementRect.left - margin, y: elementRect.top - margin },
            { x: elementRect.right + margin, y: elementRect.top - margin },
            { x: elementRect.right + margin, y: elementRect.bottom + margin },
            { x: elementRect.left - margin, y: elementRect.bottom + margin }
        ];

        orderedPaths.push(pathPoints);

        // Initially hide the element
        element.style.opacity = 0;
    }

    let currentPathIndex = 0;
    let currentSegment = 0;
    let startTime = null;
    const duration = 2000; // Duration per box drawing (500 milliseconds)

    // Function to animate the circuit drawing
    function animateCircuit(timestamp) {
        if (!startTime) startTime = timestamp;
        const currentPath = orderedPaths[currentPathIndex];
        const segmentCount = currentPath.length;
        const segmentDuration = duration / segmentCount;

        // Ensure current segment index is valid
        if (currentSegment < segmentCount) {
            const start = currentPath[currentSegment];
            const end = currentPath[(currentSegment + 1) % segmentCount];

            // Determine progress within the current segment
            const progress = (timestamp - startTime) / segmentDuration;

            // Calculate the current position along the path using linear interpolation
            const currentX = start.x + progress * (end.x - start.x);
            const currentY = start.y + progress * (end.y - start.y);

            // Clear the canvas and redraw the path up to the current segment
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawPathUpTo(currentPath, currentSegment, currentX, currentY);

            // Draw all previously drawn turning dots up to the current segment
            for (let i = 0; i <= currentSegment; i++) {
                drawTurnDot(currentPath[i].x, currentPath[i].y);
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
            // Reveal the current element after its box is drawn
            revealElement(elements[currentPathIndex]);

            // Move to the next path
            currentPathIndex += 1;
            currentSegment = 0;
            startTime = null;

            if (currentPathIndex < orderedPaths.length) {
                requestAnimationFrame(animateCircuit);
            }
        }
    }
    
    function drawPathUpTo(currentPath, segmentIndex, currentX, currentY) {
        context.strokeStyle = "white";
        context.lineWidth = 2;
        context.beginPath();
    
        // Draw all completed segments
        for (let i = 0; i < segmentIndex; i++) {
            context.moveTo(currentPath[i].x, currentPath[i].y);
            context.lineTo(currentPath[i + 1].x, currentPath[i + 1].y);
        }
    
        // Draw the current segment partially up to the moving circle
        if (segmentIndex <= currentPath.length - 1) {
            context.moveTo(currentPath[segmentIndex].x, currentPath[segmentIndex].y);
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

// Function to reveal an element after its box is drawn
function revealElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.opacity = 1; // Fully visible
    }
}
