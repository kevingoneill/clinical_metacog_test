// generate a sequence from start to stop
function seq(start = 1, stop = 1, by=1) {
    let n = Math.floor((stop - start) / by) + 1;
    return new Array(n).fill().map((_, i) => start + by * i);
}

// enter/exit fullscreen mode
function fullscreen(on) {
    return {
        type: jsPsychFullscreen,
        fullscreen_mode: on,
        delay_after: 0
    }
}
function check_fullscreen() {
  return {
    timeline: function() {
      let t = [];
      if (!document.fullscreenElement) {
        t.push(fullscreen(true));
      }
      return t;
    }
  }
}


// calculate the Euclidean distance between (x1, y1) and (x2, y2)
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// create an object from two arrays:
//   names: the names of the Object attributes
//   values: the values corresponding to each name
function zip(names, values) {
    return Object.fromEntries(names.map((k, i) => [k, values[i]]));
}

// read the jsPsych data to compile the confidence data
// returns a flattened array C[response, accuracy, confidence]
function standata(task='rdm_decision') {
    // initialize confidence counts to 0
    // C[response, correct, confidence]
    let C = Array.from(Array(2),
        () => Array.from(Array(2),
            () => Array(confidence_levels).fill(0)));

    // gather all RDM decision trials
    // (assuming confidence is added as an attribute)
    jsPsych.data.get()
        .filter({ phase: "main_task", task: task, type: task+'_decision' })
        .values()
        .forEach(trial => {
            C[trial.response == 'right' ? 1 : 0][trial.correct][trial.confidence - 1]++;
        });

    return {
        "K": confidence_levels,
        "counts": C.flat(Infinity),
        "prior_sd_d_prime": 0.5,
        "prior_sd_c": 0.5,
        "prior_sd_log_M": 0.25,
        "prior_mean_meta_c2": -1,
        "prior_sd_meta_c2": 1,
        "prior_only": 0
    }
}


// apply func to every value of obj
function objMap(obj, func) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, func(v)]));
}

function formatEstimate(x, precision=results_precision) {
    return x.toFixed(precision).padStart(precision+4, ' ');
}
