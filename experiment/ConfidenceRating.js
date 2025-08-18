let selectedConfidence = null;

function selectConfidence(value) {
    selectedConfidence = value;
    
    // remove previous selection
    document.querySelectorAll('[id^="conf-"]').forEach(el => { // look for all elements with id starting with "conf-"
        //el.style.border = 'none'; // remove border
        el.querySelector('div').style.transform = 'scale(1)'; // reset to original size
        el.querySelector('div').style.boxShadow = 'none'; // remove shadow
        el.querySelector('span').style.fontWeight = 'normal'; // reset text weight
        //el.querySelector('div').style.border = '2px solid ${baseColor}'; // reset border color

    });
    
    // highlight selected option
    const selected = document.getElementById('conf-' + value); // get the selected element
    //selected.style.border = '3px solid #ff6b35'; // add a border
    //selected.style.borderRadius = '10px'; // round the corners
    selected.querySelector('div').style.transform = 'scale(1.1)'; // make the button slightly larger
    //selected.querySelector('div').style.border = '3px solid #007BFF'; // make the border black
    selected.querySelector('span').style.fontWeight = 'bold'; // make the text bold
    selected.querySelector('div').style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)'; // add a shadow effect


    // show continue button
    const continueBtn = document.getElementById('continue-btn');
    continueBtn.style.opacity = '1';
    continueBtn.style.pointerEvents = 'auto';}

function continueExperiment() {
    if (selectedConfidence !== null) {
        jsPsych.finishTrial({response: selectedConfidence});
    }
}

function createConfidenceStimulus(prompt, numOptions, optionLabels, baseColor = '#0096ff') {
    // for each trial, reset button selection
    selectedConfidence = null;
    
    // compute opacities based on number of options
    const opacities = Array.from({length: numOptions}, (_, i) => 
        0.2 + (0.8 * i / (numOptions - 1))
    );

    // reture the full HTML string for all confidence and continue (hidden at first) buttons, waiting to be clicked
    // display: flex - automatically arrange the buttons horizontally
    // gap: 10px - define space between buttons
    return `
        <p>${prompt}</p> 
        <div id="confidence-buttons" style="display: flex; justify-content: center; gap: 10px; margin: 40px 0 20px 0;">
            ${Array.from({length: numOptions}, (_, i) => {
                //cursor: pointer - change cursor to pointer on hover
                // transition: all 0.2s - smooth transition for hover effect
                return `<div onclick="selectConfidence(${i+1})" style="text-align: center; padding: 2px; cursor: pointer;" id="conf-${i+1}">
                            <div style="width: 100px; height: 60px; background-color: rgba(0, 150, 255, ${opacities[i]}); 
                                        border: 2px solid ${baseColor}; border-radius: 8px; margin: 0 auto 5px; 
                                        transition: all 0.2s;"></div>
                            <span style="font-size: 15px;">${optionLabels[i]}</span>
                        </div>`;
            }).join('')}
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button id="continue-btn" onclick="continueExperiment()" 
                    style="padding: 10px 20px; font-size: 16px; 
                           background-color: #4CAF50; color: white; border: none; 
                           border-radius: 5px; cursor: pointer;
                           opacity: 0; pointer-events: none; transition: opacity 0.3s ease;">
                Continue
            </button>
        </div>
    `;
}