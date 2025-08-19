// generate a sequence from start to stop
function seq(start = 1, stop = 1) {
    return [...Array(stop - start + 1).keys()].map(x => start + x);
}

// enter/exit fullscreen mode
function fullscreen(on) {
    return {
        type: jsPsychFullscreen,
        fullscreen_mode: on
    }
}

// calculate the Euclidean distance between (x1, y1) and (x2, y2)
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}
