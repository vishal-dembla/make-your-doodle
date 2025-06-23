// Get references to all the HTML elements we need to interact with
const canvas = document.getElementById('doodle-canvas');
const ctx = canvas.getContext('2d');

const faceSelect = document.getElementById('face-select');
const hatSelect = document.getElementById('hat-select');
const bodySelect = document.getElementById('body-select');
const legsSelect = document.getElementById('legs-select');

const surpriseBtn = document.getElementById('surprise-btn');
const downloadBtn = document.getElementById('download-btn');

// This will hold all our doodle data once it's loaded
let doodleData = {};
// This will store the currently selected parts
const currentCharacter = {
    face: 0,
    hat: 0,
    body: 0,
    legs: 0
};

// --- CORE DRAWING FUNCTION ---
// This is the most important function. It draws one part (like a face or hat)
// onto the canvas, making sure it's the right size and in the right place.
function drawPart(partName, index, targetBox) {
    if (!doodleData[partName] || !doodleData[partName][index]) return;

    const strokes = doodleData[partName][index].strokes;

    // 1. Find the bounding box of the original doodle
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const stroke of strokes) {
        for (let i = 0; i < stroke[0].length; i++) {
            minX = Math.min(minX, stroke[0][i]);
            maxX = Math.max(maxX, stroke[0][i]);
            minY = Math.min(minY, stroke[1][i]);
            maxY = Math.max(maxY, stroke[1][i]);
        }
    }
    const originalWidth = maxX - minX;
    const originalHeight = maxY - minY;

    // 2. Calculate the scale to fit it into our targetBox
    const scale = Math.min(targetBox.width / originalWidth, targetBox.height / originalHeight);

    // 3. Draw each stroke, scaled and positioned correctly
    ctx.strokeStyle = '#334155'; // A nice dark slate color
    ctx.lineWidth = 2;
    for (const stroke of strokes) {
        ctx.beginPath();
        for (let i = 0; i < stroke[0].length; i++) {
            // This is the magic: transform the point from its original spot to the canvas spot
            const x = (stroke[0][i] - minX) * scale + targetBox.x;
            const y = (stroke[1][i] - minY) * scale + targetBox.y;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}


// --- CHARACTER ASSEMBLY FUNCTION ---
// This function clears the canvas and draws the full character
// by calling drawPart for each piece.
function drawCharacter() {
    // Clear the canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Define the "boxes" where each part will be drawn on the canvas
    const faceBox = { x: 75, y: 100, width: 150, height: 150 };
    const hatBox = { x: 75, y: 50, width: 150, height: 100 };
    const bodyBox = { x: 75, y: 220, width: 150, height: 100 };
    const legsBox = { x: 100, y: 300, width: 100, height: 100 };

    // Draw each part using the currently selected index
    drawPart('face', currentCharacter.face, faceBox);
    drawPart('hat', currentCharacter.hat, hatBox);
    // Note: The data file uses 't-shirt' as the key for body
    drawPart('t-shirt', currentCharacter.body, bodyBox);
    // Note: The data file uses 'pants' as the key for legs
    drawPart('pants', currentCharacter.legs, legsBox);
}


// --- HELPER & EVENT FUNCTIONS ---

// Populates a dropdown menu with options
function populateSelect(selectElement, items, partName) {
    selectElement.innerHTML = '';
    items.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${partName} #${index + 1}`;
        selectElement.appendChild(option);
    });
}

// Function to handle the "Surprise Me!" button click
function handleSurpriseMe() {
    currentCharacter.face = Math.floor(Math.random() * doodleData.face.length);
    currentCharacter.hat = Math.floor(Math.random() * doodleData.hat.length);
    currentCharacter.body = Math.floor(Math.random() * doodleData['t-shirt'].length);
    currentCharacter.legs = Math.floor(Math.random() * doodleData.pants.length);
    
    // Update the dropdowns to show the new random selection
    faceSelect.value = currentCharacter.face;
    hatSelect.value = currentCharacter.hat;
    bodySelect.value = currentCharacter.body;
    legsSelect.value = currentCharacter.legs;

    drawCharacter();
}

// Function to handle downloading the canvas as a PNG
function handleDownload() {
    const link = document.createElement('a');
    link.download = 'doodlemix-character.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// --- INITIALIZATION ---
// This is the main function that starts everything up
async function init() {
    // 1. Load the data from our JSON file
    const response = await fetch('/make-your-doodle/quick_draw.json');
    doodleData = await response.json();

    // 2. Populate the dropdown menus
    populateSelect(faceSelect, doodleData.face, 'Face');
    populateSelect(hatSelect, doodleData.hat, 'Hat');
    populateSelect(bodySelect, doodleData['t-shirt'], 'Body');
    populateSelect(legsSelect, doodleData.pants, 'Legs');

    // 3. Set up event listeners for user interaction
    faceSelect.addEventListener('change', (e) => {
        currentCharacter.face = e.target.value;
        drawCharacter();
    });
    hatSelect.addEventListener('change', (e) => {
        currentCharacter.hat = e.target.value;
        drawCharacter();
    });
    bodySelect.addEventListener('change', (e) => {
        currentCharacter.body = e.target.value;
        drawCharacter();
    });
    legsSelect.addEventListener('change', (e) => {
        currentCharacter.legs = e.target.value;
        drawCharacter();
    });

    surpriseBtn.addEventListener('click', handleSurpriseMe);
    downloadBtn.addEventListener('click', handleDownload);

    // 4. Draw a random character to start with!
    handleSurpriseMe();
}

// Start the application!
init();
