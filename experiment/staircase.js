// these are to be detmermined to opitimize the staircase
var coherence = 0.3; // starting coherence level
var step_size = 0.05; // initial step size
var min_step_size = 0.01; // minimum step size

var stairCaseUp = 0;
var stairCaseDown = 0;
var trial_count = 0; //****** maybe put it somewhere else? ******
var min_coherence = 0.01; // minimum coherence level
var max_coherence = 0.95;

var reversal_step_reduction = 0.75; // factor to reduce step size after reversals
var convergence_reversals = 4; // number of reversals before reducing step size

var reversals = []; // track all reversal points
var previous_direction = 0; // -1 = getting easier, 1 = getting harder, 0 = no change
//var cohCollected = []; // activate if you want to view coherence history
//var reversalCollected = [];

function staircaseEvaluator(correct) {
    trial_count++; // increment trial count **** need to make sure this is called only once per trial ****
    var direction_changed = false; // flag to track if direction changed
    
    if (correct) {
        stairCaseUp += 1; // if correct, increment up counter
        stairCaseDown = 0; // reset down counter
        
        // 2-up rule: make harder after 2 consecutive correct
        if (stairCaseUp >= 2) {
            var new_direction = 1; // 1=getting harder (decrease coherence)
            
            // if the previous direction was getting easier (= -1), record a reversal
            if (previous_direction === -1) {
                reversals.push({
                    trial: trial_count,
                    coherence: coherence,
                    step_size: step_size
                });
                direction_changed = true;
                //console.log(`Reversal ${reversals.length} at trial ${trial_count}, coherence: ${coherence.toFixed(3)}`);
            }
            
            coherence = Math.max(coherence - step_size, min_coherence); 
            stairCaseUp = 0;
            previous_direction = new_direction;
        }
    } else {
        stairCaseDown += 1; // if incorrect, increment down counter
        stairCaseUp = 0; // reset up counter
        
        // 1-down rule: make easier after 1 incorrect
        if (stairCaseDown >= 1) {
            var new_direction = -1; // -1=getting easier (increase coherence)
            
            // if the previous direction was getting harder (= 1), record a reversal
            if (previous_direction === 1) {
                reversals.push({
                    trial: trial_count,
                    coherence: coherence,
                    step_size: step_size
                });
                direction_changed = true;
                //console.log(`Reversal ${reversals.length} at trial ${trial_count}, coherence: ${coherence.toFixed(3)}`);
            }
            
            coherence = Math.min(coherence + step_size, max_coherence); 
            stairCaseDown = 0;
            previous_direction = new_direction;
        }
    }
    /* just reduce step size once
    if (direction_changed && reversals.length >= convergence_reversals) {
        if (reversals.length === convergence_reversals) {
            step_size = Math.max(step_size * reversal_step_reduction, min_step_size);
            console.log(`Step size reduced to ${step_size.toFixed(3)} after ${convergence_reversals} reversals`);
        }
    }
    */

    // keep reducing step size after convergence
    if (direction_changed && reversals.length >= convergence_reversals) {
        if (reversals.length % convergence_reversals === 0) {
            step_size = Math.max(step_size * reversal_step_reduction, min_step_size);
        }
    }
    
    // store data
    //cohCollected.push(coherence);
    //reversalCollected.push(reversals.length);
    
    //console.log(`Trial ${trial_count}: Coherence: ${coherence.toFixed(3)}, Step: ${step_size.toFixed(3)}, Up: ${stairCaseUp}, Down: ${stairCaseDown}, Reversals: ${reversals.length}`);
    
    return {
        coherence: coherence,
        converged: reversals.length >= 6, // consider converged after 6 reversals
        reversals: reversals.length,
        step_size: step_size
    };
}

/// Joel's staircase evaluator
/*
function staircaseEvaluator() {
    if (stairCaseUp >= 2) {
        coherence = Math.max(coherence - 0.025, 0.025); // Decrease coherence (harder)
        stairCaseUp = 0; // Reset up counter
    }
    if (stairCaseDown >= 1) {
        coherence = Math.min(coherence + 0.025, 0.8); // Increase coherence (easier)
        stairCaseDown = 0; // Reset down counter
    }
    console.log('Coherence:', coherence, 'Staircase Up:', stairCaseUp, 'Staircase Down:', stairCaseDown);
    cohCollected.push(coherence);
    stairCaseCollect.push(stairCaseUp - stairCaseDown); 
}
*/