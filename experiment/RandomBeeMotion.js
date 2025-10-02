function createContainer(width, height, mainText, bottomText = '') {
    return `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; ">
            <div id="rdm-container" style="width: ${width}px; height: ${height}px; 
             border: 1px solid black; background-color: #f0f0f0; position: relative;">
                
                <p style="text-align: center; font-size: 25px; margin-top: 80px;">${mainText}</p>
                
                <div id="rdm-area" style="width: 100%; height: ${height - 100}px; position: absolute; bottom: 0;">
                </div>
            </div>

            <!-- Bottom instruction outside the box -->
            ${bottomText ? 
                `<p style="text-align: center; font-size: 20px; max-width: ${width}px;">
                    ${bottomText}
                </p>` : ''}
        </div>
    `;
}

function startRDM(set_coherence = coherence, set_direction = null) {
    const container = document.getElementById('rdm-area'); // get the RDM area container
    if (!container) return;

    // set parameters
    const numDots = RDM_numDots;
    const current_coherence = set_coherence; // use the current staircase coherence
    if (set_direction === null) {
        direction = Math.random() < 0.5 ? Math.PI : 0; // generate random direction (PI=left，0=right)
    } else {
        direction = set_direction; // use the provided direction
    }
    const radius = RDM_radius;
    const DotSpeed = RDM_DotSpeed;
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;

    container.innerHTML = ''; // clear previous content

    // draw the circle rdm area
    const circleArea = document.createElement('div'); //
    circleArea.style.position = 'absolute';
    circleArea.style.width = radius * 2 + 'px';
    circleArea.style.height = radius * 2 + 'px';
    circleArea.style.left = (centerX - radius) + 'px';
    circleArea.style.top = (centerY - radius) + 'px';
    circleArea.style.borderRadius = '50%';
    circleArea.style.overflow = 'hidden';
    circleArea.style.border = '2px solid #333';
    // set background image of the cricle area
    circleArea.style.backgroundImage = `linear-gradient(rgba(255,255,255,${RDM_bg_opacity}), rgba(255,255,255,${RDM_bg_opacity})), 
    url("${backgroundImage}")`; //background image
    circleArea.style.backgroundSize = 'cover';
    circleArea.style.backgroundPosition = 'center';
    circleArea.style.backgroundRepeat = 'no-repeat';
    //circleArea.style.backgroundColor = '#e8f5e8'; //pure color background

    // append the circle area to the container
    container.appendChild(circleArea);

    // draw dots
    const Dots = [];
    // calculate the angle step for evenly spaced dots
    const angleStep = (2 * Math.PI) / numDots;
    // loop through the dots
    for (let i = 0; i < numDots; i++) {
        let angle = i * angleStep;
        let r = radius * Math.sqrt(Math.random()); // random radius for uniform distribution
        let x = centerX + r * Math.cos(angle);
        let y = centerY + r * Math.sin(angle);

        // apply coherence with some noise, so that the coherence is not exactly the same every time
        let isCoherent = Math.random() < current_coherence;
        //let isCoherent = Math.random() < (current_coherence + jsPsych.randomization.sampleNormal(0, 0.05));
        // if the dot is coherent, move in the specified left/right direction, otherwise random direction (2pi)
        let moveAngle = isCoherent ? direction : Math.random() * 2 * Math.PI;

        const Dot = document.createElement('img');
        Dot.src = dotImage; // dot image
        Dot.alt = 'Dot';
        Dot.style.position = 'absolute';
        Dot.style.width = RDM_Dot_size + 'px';
        Dot.style.height = RDM_Dot_size + 'px';
        Dot.style.pointerEvents = 'none';

        // randomly flip the dot horizontally
        const flip = Math.random() < 0.5;
        if (flip) {
            Dot.style.transform = 'scaleX(-1)';
        }

        // set dot position
        Dot.style.left = (x - centerX + radius - 8) + 'px';
        Dot.style.top = (y - centerY + radius - 8) + 'px';

        // append the dot to the circle area
        circleArea.appendChild(Dot);
        // store the dot information
        Dots.push({
            element: Dot,
            x: x,
            y: y,
            speed: DotSpeed,
            moveAngle: moveAngle,
            isCoherent: isCoherent,
            flip: flip
        });
    }
    // the animation
    const animate = () => {
        Dots.forEach(Dot => {
            // update dot position based on speed and direction
            Dot.x += Dot.speed * Math.cos(Dot.moveAngle);
            Dot.y += Dot.speed * Math.sin(Dot.moveAngle);

            // compute distance from the center
            const d = distance(Dot.x, Dot.y, centerX, centerY);

            // check if the dot edge is within the circle area
            if (d - RDM_Dot_size / 2 > radius) {
                // Wrap to opposite side
                const angle = Math.atan2(Dot.y - centerY, Dot.x - centerX) + Math.PI;
                Dot.x = centerX + (radius - RDM_Dot_size / 2) * Math.cos(angle);
                // for incoherent dots, set y position randomly within the circle area
                if (!Dot.isCoherent) {
                    Dot.y = centerY + (radius - RDM_Dot_size / 2) * Math.sin(angle);
                    // Joel's version: if (this.isCoherent) {this.y = this.y * 1;} else {this.y = centerY + (radius + 40) * sin(angle) * 1;}
                }
            }

            // update dot position in the DOM
            Dot.element.style.left = (Dot.x - centerX + radius - RDM_Dot_size / 2) + 'px';
            Dot.element.style.top = (Dot.y - centerY + radius - RDM_Dot_size / 2) + 'px';
        });
        // continue the animation
        requestAnimationFrame(animate);
    };

    animate();
}

