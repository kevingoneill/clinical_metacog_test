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