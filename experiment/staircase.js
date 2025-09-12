function staircaseEvaluator(correct) {
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
                    coherence: coherence,
                    step_size: step_size
                });
                direction_changed = true;
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
                    coherence: coherence,
                    step_size: step_size
                });
                direction_changed = true;
            }

            coherence = Math.min(coherence + step_size, max_coherence);
            stairCaseDown = 0;
            previous_direction = new_direction;
        }
    }

    // keep reducing step size after convergence
    if (direction_changed && reversals.length >= convergence_reversals) {
        if (reversals.length % convergence_reversals === 0) {
            step_size = Math.max(step_size * reversal_step_reduction, min_step_size);
        }
    }

    return {
        coherence: coherence,
        reversals: reversals.length,
        step_size: step_size
    };
}
