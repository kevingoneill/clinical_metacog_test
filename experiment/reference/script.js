window.reactionTimes = [];
window.correctResponse = [];
window.confidenceRatings = [];
window.cohCollected = [];
window.responseTracker = [];
window.answerTracker = [];

// Task inits
let letsGo = false; // Flag to start the task
let practice = false; // Flag to start the practice
let started = false; 
let ver = 'task';
let mode = 2;
let resTypeMode = 'b';
let alarmX, alarmY, alarmSize;
let correctChoices = 0;
let wrongChoices = 0;
let stairCaseUp = 0;
let stairCaseDown = 0;
let beeSpeed = 6;

// Output variables
let correctResponse = [];
let reactionTimes = [];
let confidenceRatings = [];
let stairCaseCollect = [];
let cohCollected = [];
let stateTracker = [];
let globalSelf = [];
let globalConfSelf = [];
let answerTracker = []; 
let responseTracker = [];
let trialTracker = []; // Track trial numbers
let blockTracker = []; // Track block numbers 

// P5 inits
let canvas;
let centerX, centerY;
let img, img1, img2, imgB;

// RDM Settings
let dots = [];
let numDots = 100 / mode;
let coherence = 0.3; 
let direction;// = 180; // Coherent direction (0° = rightward)
let radius = 200; // Circle radius


// Trial stage settings
let keyLock = true; // Key presses allowed only specific times
let buttonSelected = null; // Init button selection check
let confirmed = false; // Init confirmation check
let stimulusShown = false; // Stimulus shown check

// Task visual element presets
let shutterX, shutterY;
let controlRod; // Control rod for confidence ratings
let correctKey; // Correct direction
let populationDrawn = false; // Reference population for global ratings
let population = []; // Array to store population characters
let draggedObject = null;

// Task structure settings
let nTrials = 30; // N trials per block
let nBlocks = 6; // N blocks
let trial = 0; // Init trial
let block = 0; // Init block
let practiceTrial = 0; // Init practice trial
let trialBlocks = []; // Array to store blocks
for (let i = 0; i < nBlocks; i++) {
    let block = Array(nTrials).fill(1); 
    trialBlocks.push(block);
}



let trialStarted = false; // Tracks if the trial has started
let timerStart = null; // Stores the start time of the timer
let timerRunning = false; // Tracks if the timer is running
let elapsedTime = 0;
let padder;
let confDragged = false; // Flag to check if confidence is dragged
let init = false;
let ratingFinished = false; // Flag to check if rating is finished
let currentBoatX = 0;
let rateLock = true;
let stopMouse = true;

// Task start function, initializes canvas and sets up environment
function RDMstart(version, inputMode, resTypeInput) {

    const button = document.getElementById('buttonStart');
    if (button) {
        button.remove(); // Remove the button from the DOM
    }
    
    started = true;
    ver = version;
    mode = inputMode;
    resTypeMode = resTypeInput;

    if (!canvas) {
        canvas = createCanvas(1500, 800);
        if (ver === 'task') {
            canvas.parent('RDM1');
        }
    }

    centerX = width / 2;
    centerY = height / 2;
    shutterX = centerX;
    shutterY = centerY;


    correctKey = random() < 0.5 ? 'L' : 'R'; // Randomly assign correct key

    updateDirection(correctKey); // Update direction based on correct key


    dots = []; // Reset dots array

    if (ver === 'task') {
        randomDots();
        keyLock = false; // Unlock input for the task 
    } 

    draggableConf = {xPos: width / 2, draggable: true};
    controlRod = {color: color(100,0,0), xPos : width / 2, draggable: true};
}

// Task end function
function RDMstop() {
    started = false;
    buttonSelected = false;
    if (canvas) {
        canvas.remove();  // Remove the canvas
        canvas = null;    // Reset the variable
    }  
    dots = [];
    //characters = [];
}

// Preload images
function preload() {
    img2 = loadImage('img/fish3.png');
    img1 = loadImage('img/fish3.png');
    imgB = loadImage('img/imgBee.png');
    bgImage = loadImage('img/gardd.jpeg');
    circleBgImage = loadImage('img/meadow.jpg');//loadImage('img/underDaSea.jpeg');
    frameImage = loadImage('img/frame.png');
}

//////////////////////////////// HELPER FUNCTIONS //////////////////////////////////

// Necessary for P5.js setup
function setup() {
    if (!started) return;
}

/////////////////////////////// P5JS HELPER FUNCTIONS ///////////////////////////////

// Determine coherence direction based on the correct key
function updateDirection(correctKey) {
    if (correctKey === 'L') {
        direction = 180; // Left
    } else if (correctKey === 'R') {
        direction = 0; // Right
    }
}

/////////////////////////////////////// MAIN ///////////////////////////////////////

// Main animation function
function draw() {
    if (!started) return;
    
    clear();


    // Background image
    image(bgImage, 0, 0, width, height); // Draw the image to cover the entire canvas

    // Draw meadow
    push();
        drawingContext.beginPath();
        drawingContext.arc(centerX, centerY, radius, 0, TWO_PI); // Define the circular clipping area
        drawingContext.clip(); // Clip the canvas to the circular area
        image(circleBgImage, centerX - radius, centerY - radius, radius * 2, radius * 2); // Draw the circular background image
    pop();
    
    // Dots
    push();
        drawingContext.beginPath();
        drawingContext.arc(centerX, centerY, radius, 0, TWO_PI);
        drawingContext.clip();

        for (let dot of dots) {
            dot.move();
            dot.display();
        }
    pop();

    // Shutter
    push();
        translate(shutterX, shutterY);
        /*fill(color(169, 169, 169));
        ellipse(0, 0, radius * 2);
        */
        push();
            drawingContext.beginPath();
            drawingContext.arc(0, 0, radius, 0, TWO_PI); // Define the circular clipping area
            drawingContext.clip(); // Clip the canvas to the circular area
            image(bgImage, 0 - radius, 0 - radius, radius * 2, radius * 2); // Draw the circular background image
        pop();

        // Fixation cross
        if (!buttonSelected && trialStarted && !stimulusShown) {
            push();
                stroke(255);
                strokeWeight(20);                                
                line(0, -50, 0, 50);
                line(-50, 0, 50, 0)
            pop();
        } 
    pop();

    // Start text
    if (!trialStarted && !buttonSelected) {
        noStroke();
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(30);
        text('Press SPACE to Start.', width / 2, height / 2);
    }
    
    // After stimulus text
    if (buttonSelected) {
        noStroke();
        fill(255);
        textAlign(CENTER, CENTER);
        if (!confirmed) { 
            textSize(20);
            text('Press SPACE to Continue.', width / 2, height / 2 + 30);
        }
    } 

    // Confidence rating text
    if (stimulusShown) {
        noStroke();
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(30);
        let controlRodX = round((controlRod.xPos.toFixed(2) - 600)/ 2); 
        let controlRodLR = controlRodX < 0 ? 'L' : controlRodX > 0 ? 'R' : 'L / R';
        text(`Confidence ${controlRodLR} : ${abs(controlRodX)}`, width / 2, height / 2);
    }

    // Circular frame
    noFill();
    stroke(0);
    strokeWeight(10);
    ellipse(centerX, centerY, radius * 2);

    // Draw control for responses
    drawControl(resTypeMode);

    // Frame
    stroke(30);
    strokeWeight(20);
    noFill();
    rect(0 + 10, 0 + 10, width - 20, height - 20); // Draw the frame
    
    drawProgressBar('bar', trial);
}

let sailX = -5; // Initialize sailX

function drawProgressBar(type = 'boat', ticker) {
    push();
        if (type === 'bar') {
            fill(color(169, 169, 169));
            noStroke();
            rect(width - 100, height / 6, 50, height / 3 * 2, 15);
            fill(color(95, 158, 160));
            
            let progressHeight = (ticker + 1) / nTrials * (height / 3 * 2);

            fill(color(95, 158, 160)); // Progress color
            noStroke();
            rect(width - 100, height / 6 + (height / 3 * 2) - 10, 50, 10, 15);
            rect(width - 100, height / 6 + (height / 3 * 2 - progressHeight) - 10, 50, progressHeight); // Draw the progress bar

            for (let i = 1; i < trialBlocks[block].length; i++) {
                let yTickStep = height / 3 * 2 / trialBlocks[block].length;
                stroke(255);
                strokeWeight(3);
                if (i % 5 === 0) {
                    line(width - 100 + 3, height / 6 + yTickStep * i, width - 100 + 15, height / 6 + yTickStep * i);
                } else {
                    line(width - 100 + 3, height / 6 + yTickStep * i, width - 100 + 8, height / 6 + yTickStep * i);
                }
            }
            noFill();
            stroke(30);
            strokeWeight(7);
            rect(width - 101, height / 6, 52, height / 3 * 2, 15);
        }
        if (type === 'boat') {
            // Scene
            noStroke();
            fill(color(226, 236, 255));
            rect(width / 4, 30, width / 2, 40, 10);
            fill(color(24, 64, 142));
            rect(width / 4, 30 + 25, width / 2, 15);

            // Clip the drawing area to the progress bar
            drawingContext.save(); // Save the current drawing context
            drawingContext.beginPath();
            drawingContext.rect(width / 4, 30, width / 2, 40); // Define the clipping area
            drawingContext.clip(); // Apply the clipping area

            // Boat
            let boatStep, targetBoatX;
            if (ver === 'instructions') {
                boatStep = width / 2 / trialBlocks[block].length; // Calculate tick spacing
                targetBoatX = width / 4 + boatStep * (ticker); // Target position for the boat
                if (ticker < 0) {
                    currentBoatX = width / 4 - 5 + boatStep * ticker; // Start outside the progress bar
                }
            } else {
                boatStep = width / 2 / trialBlocks[block].length; // Calculate tick spacing
                targetBoatX = width / 4 + boatStep * (ticker + 1); // Target position for the boat
                if (ticker == 0) {
                    currentBoatX = targetBoatX; // Start position for the boat
                }
             } 
            
            if (ver === 'rank') {
                currentBoatX = width / 4 + width / 2 * (ticker / trialBlocks[block].length);
            } else {
                currentBoatX = lerp(currentBoatX, targetBoatX, 0.1); // Smoothly interpolate the boat's position
            }
            ellipse(currentBoatX - 12, 30 + 25, 0.6);

            drawingContext.restore(); // Restore the original drawing context

            // Ticks
            for (let i = 1; i < trialBlocks[block].length; i++) {
                let xTickStep = width / 2 / trialBlocks[block].length;
                stroke(0);
                strokeWeight(3);
                if (i % 5 === 0) {
                    if (i % (trialBlocks[block].length / 2) === 0) {
                        line(width / 4 + xTickStep * i, 70, width / 4 + xTickStep * i, 70 - 30);
                        fill(255);
                        rect(width / 4 + xTickStep * i, 70 - 30, 15, 10)
                    } else {
                        line(width / 4 + xTickStep * i, 70, width / 4 + xTickStep * i, 70 - 15);
                    }
                } else {
                    line(width / 4 + xTickStep * i, 70, width / 4 + xTickStep * i, 70 - 5);
                }
            }

            // Frame
            noFill();
            stroke(30);
            strokeWeight(7);
            rect(width / 4, 30, width / 2, 40, 10);
        }
    pop();
}

function drawControl(resType) {
    if (resType == 'l') {
        
        // Box
        fill(50);
        stroke(0);
        strokeWeight(5);
        rect(width/3 - 5, height - 60, width/3 + 10, 20);

        // Mid point
        line(width/2, height - 30, width/2, height - 70);

        // Control slot
        stroke(100);
        line(width/3, height - 50, width/3 * 2, height - 50);

        // Tick marks
        stroke(0);
        strokeWeight(5);
        for (let xTick = (width/3) / 10; xTick < width/3; xTick += (width/3) / 10) {
            line((width / 3) + xTick, height - 40, (width / 3) + xTick, height - 60); 
        }

        drawControlRod(controlRod.xPos, controlRod.color, height - 10);

    } else if (resType == 'b') {
        // Draw buttons
        drawButton(centerX - 130, height - 60, '←');
        drawButton(centerX + 130, height - 60, '→');
    }
}

function shutterMoveFunc(dir){
    if (dir == 'open') {
        shutterY -= 3 * radius; // 50
        if (shutterY == height / 2 - 2 * radius) {
            shutterMove = false;
        }
    } else if (dir == 'close') {
        shutterY += 3 * radius; // 50
        if (shutterY == height / 2) {
            shutterMove = false;
            timerRunning = false;
        }
    }
}

// Button for responding
function drawButton(x, y, textInput) {
    const buttonW = 120;
    const buttonH = 60;

    push();
        translate(x, y);
        rectMode(CENTER);
        fill(169);
        
        if (buttonSelected == textInput) {
            stroke(255);
            strokeWeight(7);
        } else {
            stroke(0);
            strokeWeight(5);
        }
        rect(0, 0, buttonW, buttonH, 20);
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(30);
        text(textInput, 0, 0);
    pop();
}

// Control rod for responding
function drawControlRod(x, c, y = height) {
    
    // Stem
    stroke(130);
    strokeWeight(7);
    line(x, y - 70, x, y - 40);
    
    // Handle
    fill(c);
    stroke(0);
    strokeWeight(3);
    ellipse(x, y - 70, 40, 40);
}


function keyPressed() {

    if (keyLock) return;

    if (keyCode == 32 && !stimulusShown) { // Space bar pressed without button selected
        trialStarted = true; // Start the trial
        keyLock = true; // Lock input until animation finishes
        setTimeout(() => {
            shutterMoveFunc('open'); // Open the shutter

            setTimeout(() => {
                shutterMoveFunc('close'); // Close the shutter
                keyLock = false; 
                stimulusShown = true; // Stimulus shown
                controlRod.color = color(255,0,0);

                // RT start
                timerStart = millis(); // Start the timer
                timerRunning = true; 

            }, 1000);

        }, 1000); // Delay before starting the shutter animation

    } else if (stimulusShown) { 
        stimulusShown = false; // Reset stimulus shown flag

        if (controlRod.xPos < width / 2) {
            buttonSelected = 'L';
            confirmed = false;
        } else if (controlRod.xPos > width / 2) {
            buttonSelected = 'R';
            confirmed = false;
        }

        if (keyCode === 32 && buttonSelected) {// || controlSubmit)) { // Space confirms selection
            keyLock = true; // Lock input until animation finishes
            confirmed = true;
            blinkSelf = true; // Start blinking right alarm
            stopMouse = true; // Stop mouse movement

            // RT end
            elapsedTime = millis() - timerStart; // Calculate elapsed time
            timerRunning = false; // Stop the timer
            reactionTimes.push(elapsedTime); // Store reaction time
            confidenceRatings.push(round((controlRod.xPos.toFixed(2) - 600)/ 2));
            answerTracker.push(correctKey); // Track the answer
            responseTracker.push(buttonSelected); // Track the response
            stateTracker.push(`${practice ? "practice" : "trial"} ${block} ${practice ? practiceTrial : trial} `); // Track the state of the trial

            // Check if selected button is correct
            if (buttonSelected === correctKey) {
                alarmColor = color(0, 255, 0); // Green for correct input
                correctChoices++;
                correctResponse.push(true);
                stairCaseUp++;
                stairCaseDown = 0;
            } else { 
                alarmColor = color(255, 0, 0); // Red for incorrect input
                wrongChoices++;
                correctResponse.push(false);
                stairCaseUp = 0;
                stairCaseDown++;
            }

            straicaseEvaluator(); // Evaluate staircase

            // Reset after 2 seconds
            setTimeout(() => { 

                //////////// TRIAL RESET ////////////
                trialReset('self'); // Reset trial for self

            }, selfBlinktimer);
        }
    }
}



function straicaseEvaluator() {
    if (stairCaseUp >= 2) {
        coherence = max(coherence - 0.025, 0.025); // Decrease coherence
        stairCaseUp = 0; // Reset up counter
    }
    if (stairCaseDown >= 1) {
        coherence = min(coherence + 0.025, 0.5); // Increase coherence
        stairCaseDown = 0; // Reset down counter
    }
    console.log('Coherence:', coherence, 'Staircase Up:', stairCaseUp, 'Staircase Down:', stairCaseDown);
    cohCollected.push(coherence);
    stairCaseCollect.push(stairCaseUp - stairCaseDown); 
}

//////////////////////////// DOTS ////////////////////////////

function randomDots() {
    let angleStep = TWO_PI / numDots;
    for (let i = 0; i < numDots; i++) {
        let angle = i * angleStep;
        let r = radius * sqrt(random()); // Even spread within the circle
        let x = centerX + r * cos(angle);
        let y = centerY + r * sin(angle);
        let isCoherent = random() < (coherence + gaussianRandom(0,0.05));
        let moveAngle = isCoherent ? radians(direction) : random(TWO_PI);
        dots.push(new Dot(x, y, moveAngle, isCoherent));
    }
}

class Dot {
    constructor(x, y, moveAngle, isCoherent) {
        this.x = x;
        this.y = y;
        this.speed = beeSpeed;
        this.moveAngle = moveAngle;
        this.isCoherent = isCoherent;
        this.flip = random() < 0.5;
    }

    move() {
        this.x += this.speed * cos(this.moveAngle);
        this.y += this.speed * sin(this.moveAngle);

        // Check if the dot left the circular boundary
        let d = f(this.x, this.y, centerX, centerY);
        
        if (d - 40 > radius) {
            // Wrap to opposite side
            let angle = atan2(this.y - centerY, this.x - centerX) + PI; // Flip 180 degrees
            this.x = centerX + (radius + 40) * cos(angle) * 1;
            if (this.isCoherent) {this.y = this.y * 1;} else {this.y = centerY + (radius + 40) * sin(angle) * 1;}
        }
    }

    display() {
        if (mode == 1){
            fill(255);
            noStroke();
            ellipse(this.x, this.y, 5, 5);
        } else if (mode == 3) {
                push();
                    translate(this.x, this.y); // Move to dot position
                    scale(0.5);
    
                    
                    
                    if (this.flip) {
                        scale(-1, 1); // Flip horizontally
                        scale(2);
                        //image(img, -40, -20, 80, 40); // Adjust position to maintain proper placement
                        image(imgB, -40, -40, 80, 80); // Adjust position to maintain proper placement
                    } else {
                        scale(2);
                        //image(img, -40, -20, 80, 40); // Normal placement
                        image(imgB, -40, -40, 80, 80); // Normal placement
                    }
    
                pop();
        } else {
            push();
                translate(this.x, this.y); // Move to dot position
                scale(0.5);

                
                
                if (this.flip) {
                    scale(-1, 1); // Flip horizontally
                    //image(img, -40, -20, 80, 40); // Adjust position to maintain proper placement
                    image(img1, -40, -40, 80, 80); // Adjust position to maintain proper placement
                } else {
                    //image(img, -40, -20, 80, 40); // Normal placement
                    image(img1, -40, -40, 80, 80); // Normal placement
                }

            pop();
        }
    }
}

///////////////////////////////////// Mouse behavior /////////////////////////////////////

function mousePressed() {


    if (ver == 'rate' || ver == 'task' || ver == 'instructions') {
        event.preventDefault();
    }

    if (ver == 'task') {
        if (stopMouse) {mouseReleased(); return};
    }

    offSet = 0; // Reset offset on mouse press

    //////////////////////// Draggable object handling /////////////////////

    // Draggable self character
    if (ver == 'instructions') {
        padder = 10;
    } else {
        padder = 0;
    }
    if (ver == 'rate' || ver == 'instructions') {


        // Draggable confidence rating
        if (draggableConf && dist(mouseX, mouseY, draggableConf.xPos, height / 3 * 1.8) < 30 && !rateLock) {
            draggableObject = 'conf';
            dragging = true;
            offsetX = mouseX - draggableConf.xPos; // Store the offset from the mouse to the character's position
        } else if (mouseY > height / 3 * 1.8 - 10 && mouseY < height / 3 * 1.8 + 10 &&
            mouseX > 300 && mouseX < width - 300 &&
            !rateLock) {
            draggableConf.xPos = constrain(mouseX, 300, width - 300);
            buttonSelected = true;
            confDragged = true;
        }


        // Control rod for instruction section
        if (instructionNum == 2 && controlRod) {
            if (dist(mouseX, mouseY, controlRod.xPos, height - 47) < 25) {
                draggableObject = 'controlRod';
                dragging = true;
                offsetX = mouseX - controlRod.xPos; // Store the offset from the mouse to the character's position
            } else if (mouseY > height - 32 && mouseY < height + 2 && mouseX > width / 3 && mouseX < 2 * width / 3) {
                controlRod.xPos = constrain(mouseX, width / 3, 2 * width / 3);
            }
        }
    }

    // Control rod for main task
    if (stimulusShown && controlRod && !stopMouse) {
        if (dist(mouseX, mouseY, controlRod.xPos, height - 80) < 20 || dist(mouseX, mouseY, controlRod.xPos, height - 40) < 10) {
            draggableObject = 'controlRod';
            dragging = true;
            offsetX = mouseX - controlRod.xPos; // Store the offset from the mouse to the character's position
        } else if (mouseY > height - 60 && mouseY < height - 40 && mouseX > width / 3 && mouseX < 2 * width / 3 && !stopMouse) {
            controlRod.xPos = constrain(mouseX, width / 3, 2 * width / 3); // Constrain the control rod position
            buttonSelected = true;
        }
    } 

    // Rating confirm
    if (ver == 'rate' && (practice || block > 0 || trial > 0) && !rateLock &&
        mouseX > width / 4 && mouseX < (width / 4 + width / 2) &&
        mouseY > (height / 5 * 4) && mouseY < (height / 5 * 4 + 70)) {
            ratingLogging(); // Log the rating
    }

}

// Constrains for dragging
function mouseDragged() {

    if (ver == 'rate' || ver == 'task' || ver == 'instructions') {
        event.preventDefault();
    }

    if (ver == 'task') {
        if (stopMouse) {mouseReleased(); return};
    }

    if (dragging) {
        if (draggableObject == 'controlRod') {
            if (instructionNum == 2) {
                controlRod.xPos = constrain(mouseX - offsetX, width/3 + 5, 2 * width/3 - 5);
            } else {
                controlRod.xPos = constrain(mouseX - offsetX, width / 3, 2 * width / 3 );
                buttonSelected = true;
            }
        } else if (draggableObject == 'conf') {
            draggableConf.xPos = constrain(mouseX - offsetX, 300, width - 300);
            confDragged = true;
        }
    }
}

// Reset dragging state on mouse release
function mouseReleased() {
        
    if (ver == 'task') {
        if (stopMouse) {dragging = false; draggableObject = null; return};
    }

    draggableObject = null; 
    dragging = false;
}