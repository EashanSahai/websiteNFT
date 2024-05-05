// Function to draw sequential circuit boxes around specified elements
function drawCircuitBoxesSequentially(elements, customDimensions) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.width = document.body.scrollWidth;
    canvas.height = document.body.scrollHeight;
    canvas.style.zIndex = -1;
    document.body.appendChild(canvas);

    const context = canvas.getContext('2d');
    const margin = 10; // Margin around each box
    const circleRadius = 12;
    const turnDotRadius = 10;

    const orderedPaths = [];
    for (let index = 0; index < elements.length; index++) {
        const elementId = elements[index];
        const element = document.getElementById(elementId);
        if (!element) continue;

        // Calculate exact bounding box or use custom dimensions if provided
        const elementRect = customDimensions && customDimensions[elementId] ? {
            left: customDimensions[elementId].left || element.offsetLeft,
            top: customDimensions[elementId].top || element.offsetTop,
            width: customDimensions[elementId].width || element.offsetWidth,
            height: customDimensions[elementId].height || element.offsetHeight
        } : {
            left: element.getBoundingClientRect().left,
            top: element.getBoundingClientRect().top,
            width: element.offsetWidth,
            height: element.offsetHeight
        };

        // Construct the path points considering the margin
        const pathPoints = [
            { x: elementRect.left - margin, y: elementRect.top - margin },
            { x: elementRect.left + elementRect.width + margin, y: elementRect.top - margin },
            { x: elementRect.left + elementRect.width + margin, y: elementRect.top + elementRect.height + margin },
            { x: elementRect.left - margin, y: elementRect.top + elementRect.height + margin }
        ];

        orderedPaths.push(pathPoints);

        // Initially hide the element
        element.style.opacity = 0;
    }

    let currentPathIndex = 0;
    let currentSegment = 0;
    let startTime = null;
    const duration = 2000; // Duration per box drawing (2 seconds)

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

            // Clear only the path area to ensure boxes remain visible
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

    // Draw the path up to the current point
    function drawPathUpTo(currentPath, segmentIndex, currentX, currentY) {
        context.strokeStyle = "white";
        context.lineWidth = 2;
        context.beginPath();

        // Draw all completed segments
        for (let i = 0; i < segmentIndex; i++) {
            context.moveTo(currentPath[i].x, currentPath[i].y);
            context.lineTo(currentPath[i + 1].x, currentPath[i + 1].y);
        }

        // Draw the current segment partially, up to the moving dot
        if (segmentIndex < currentPath.length - 1) {
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
