///////////////////////////////////////////////////////////////////////////////
//                         Pre-experiment questions
///////////////////////////////////////////////////////////////////////////////

// the information form
var information = {
    type: jsPsychExternalHtml,
    url: "information.html",
    cont_btn: "continue",
    check_fn: function () {
        if (!document.getElementById('consent_checkbox').checked) {
            alert("If you wish to participate, you must check the box next to the statement 'I consent to participate in this study.'");
            return false;
        }
        return true;
    }
};

// the consent form
var consent = {
    type: jsPsychExternalHtml,
    url: "consent.html",
    cont_btn: "start",
    check_fn: function () {
        if (!document.getElementById('consent_checkbox').checked) {
            alert("If you wish to participate, you must check the box next to the statement 'I consent to participate in this study.'");
            return false;
        }
        return true;
    }
};

// ensure minimal screen size & desktop/laptop device
var browser_check = {
    type: jsPsychBrowserCheck,
    minimum_width: 800,
    minimum_height: 800,
    inclusion_function: (data) => { return !data.mobile && data.fullscreen; },
    exclusion_message: (data) => {
        if (data.mobile)
            return '<p>You must use a desktop/laptop computer to participate in this study.</p>';
        else if (!data.fullscreen)
            return '<p>Your browser must support fullscreen mode to participate in this study.</p>';
    }
};

var general_instructions = {
    type: jsPsychInstructions,
    pages: [
        `<h2>Welcome to the experiment!🐝🌹</h2>
        <p>In this experiment, you will complete <strong>${task_seq.length} ${task_seq.length === 1 ? 'task.' : 'tasks.'}</strong></p>
        <p>Please pay attention to the instructions and do your best.</p>`
    ],
    allow_backward: false,
    show_clickable_nav: true
};
///////////////////////////////////////////////////////////////////////////////
//                                Shared components
///////////////////////////////////////////////////////////////////////////////
//preload images
var preload = {
    type: jsPsychPreload,
    images: [backgroundImage, dotImage] //defined in RandomBeeMotion.js
};

// inter-trial interval
var iti = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: 500,
    data: {
        type: 'ITI'
    }
};

var feedback = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        // show feedback based on correctness
        if (jsPsych.data.get().last(1).values()[0].correct) {
            return '<p style="color: green; font-size: 24px;">Correct!</p>';
        } else {
            return '<p style="color: red; font-size: 24px;">Incorrect</p>';
        }
    },
    choices: "NO_KEYS",
    trial_duration: 1000
};
// example confidence rating
var example_confidence_rt = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus:
        createConfidenceStimulus(
            `<p>A rating scale as shown below is used throughout the task.</p>
            <p>If you are <strong>more confident</strong> that your judgment was correct, click more on the <strong>RIGHT</strong> of the scale;</p>
            <p>if you are <strong>less confident</strong>, click more on the <strong>LEFT</strong>.</p>
            <p>Please do your best to rate your confidence accurately and do take advantage of the whole rating scale.</p>
            <p>Now, click on any point and press continue to proceed.</p>`),
    choices: "NO_KEYS",
    data: {
        type: 'example_confidence_rt'
    },
    on_finish: function (data) {
        data.response = parseInt(data.response);
    }
};

// confidence rating
var confidence_rt = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        return createConfidenceStimulus("How confident are you in your judgment?");
    },
    choices: "NO_KEYS",
    data: {
        type: 'local_confidence'
    },
    on_finish: function (data) {
        //data.current_coherence = jsPsych.data.get().last(2).values()[0].current_coherence; // get current coherence
        data.correct = jsPsych.data.get().last(2).values()[0].correct; // get last trial correctness
        data.response = parseInt(data.response);
        console.log(`Confidence selected: ${data.response}`);

        // add confidence data to the previous trial
        jsPsych.data.get().last(2).values()[0].confidence = data.response;
    }
};

// global confidence at the end of each task
var global_confidence = {
    type: jsPsychHtmlSliderResponse,
    stimulus: `
        <p>In this task, what percentage of trials do you think you got correct?</p>
        <p>(Use the slider to choose between 0% and 100%)</p>
    `,
    labels: ['0%', '100%'],
    min: 0,
    max: 100,
    step: 1,
    slider_start: 50,
    require_movement: true,
    data: {
        type: 'global_confidence'
    },
    on_finish: function(data) {
        data.response = data.response;
        console.log(`Estimated accuracy: ${data.response}%`);
    }
};

///////////////////////////////////////////////////////////////////////////////
//                                RDM task components
///////////////////////////////////////////////////////////////////////////////
//instructions
var rdm_pages = [
        [`
        <p>In this task, you'll watch bees 🐝 perform their <strong>waggle dance</strong>—a way they show other bees where to find flowers and nesting sites.</p>
        <p>🔍 Please help us observe the <strong>direction </strong> of the waggle dance! </p>
        `],
        [`
        <p> 🔍 In the following task, your job is to determine the overall direction of the bees' motion—left or right.</p>
        `],
        [`
        <p> In addition, after your decision, we will tell you whether your judgment was correct.</p>
        <p> Now, let's practice a few times.</p>
        <p> ⚠️ The bees will appear for a very short time, so please pay attention!</p>
        `],
        [`
        <p><strong>Looking good!</strong></p>
        <p>This task is supposed to be quite challenging, so it could happen that sometimes you are sure you made a correct judgement, but sometimes less sure.</p>
        <p>Therefore, we would like to know your confidence about each judgments.</p>
        `],
        [`
        <p>Great!</p>
        <p>Let's try a few more with your confidence ratings.</p>
        <p>This time you won't get the feedback anymore.</p>
        `],
        [`
        <p>Now we are ready to start!</p>
        <p><strong>Reminder:</strong></p>
        <p>🐝 Watch the bees closely — they will only appear for a short time!</p>
        <p>⬅️ / ➡️ Decide if the <strong>majority</strong> are moving left or right.</p>
        <p>⭐ Then rate how confident you are in your decision using the scale provided.</p>
        <p>💡 There will be no feedback during the main task, so just try your best!</p>
        </ul>
        <p>Take a deep breath, stay focused, and let’s begin.</p>
        `]
];

var example_rdm_stimuli = {
    type: jsPsychHtmlButtonResponse,
    // create a container for the RDM
    stimulus: function () {
        return createContainer(RDM_box_width, RDM_box_height,
            "The waggle dance looks like this",
            "💡 The movement looks messy, but if you look closely, the majority is moving to one direction."
        );
    },
    choices: ['Got it!'],// navigation buttons
    trial_duration: null, // wait until response
    // store metadata
    data: {
        type: 'example_stimuli'
    },
    // start the RDM animation
    on_load: function () {
        startRDM(example_coherence, example_direction);// use fixed coherence and direction (right) for the example
    }
};

var example_rdm_decision = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<p>During the task, click on the <strong>LEFT</strong> button if you think more bees are moving left, or the <strong>RIGHT</strong> button if you think more bees are moving right.</p><p>Now, click on any button to proceed.</p>`,
    choices: ['Left', 'Right'],
    data: {
        type: 'example_rdm_decision',
    },
};

var rdm_stimuli = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => createContainer(RDM_box_width, RDM_box_height, "Watch the bees"),
    choices: "NO_KEYS",
    trial_duration: RDM_duration, // duration of the RDM animation, set in RandomBeeMotion.js
    data: {
        type: 'rdm_stimuli'
    },
    on_load: function () {
        // dynamically set the RDM direction
        let direction_rad = jsPsych.evaluateTimelineVariable('target') == 'left' ? Math.PI : 0;
        startRDM(coherence, set_direction = direction_rad);
    },
    on_finish: function (data) {
        // store currect coherence
        data.current_coherence = coherence;
        console.log(`Stimulus shown with direction: ${data.target}, coherence: ${data.current_coherence}`);
    }
};

var rdm_decision = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p>Which direction did the bees move?</p>',
    choices: ['Left', 'Right'],
    data: {
        type: 'rdm_decision',
    },
    on_finish: function (data) {

        // store current coherence
        data.current_coherence = coherence;

        //store correctness
        data.response = data.response ? 'right' : 'left';
        data.correct = (data.response === data.target) ? 1 : 0;

        console.log(`Trial ${data.trial} (${data.phase}): Coherence=${coherence.toFixed(3)}, Correct=${data.correct}, Reversals=${reversals.length}`);

        // apply staircase rule, update coherence and step size
        staircaseEvaluator(data.correct);

        // store updated staircase data
        data.next_coherence = coherence;
        data.staircase_up = stairCaseUp;
        data.staircase_down = stairCaseDown;
        data.reversals = reversals.length;
        data.step_size = step_size;
    }
};

///////////////////////////////////////////////////////////////////////////////
//                                WM task components
///////////////////////////////////////////////////////////////////////////////
//instructions
var wm_pages = [
    [`
    <p>In this task, you’ll be observing and memorizing flowers with various shapes and colors 🌹🌸🌼🌺.</p>
    `],
    [`
    <p> 🧠 In the following task, your job is to try to memorize the flowers carefully.</p>
    <p>Right after, you’ll be shown two flowers side by side.</p>
    <p>Your task is to pick the one that has been just shown to you.</p>
    `],
    [`
    <p> In addition, after your decision, we will tell you whether your judgment was correct.</p>
    <p> Now, let's practice a few times.</p>
    <p> ⚠️ The flowers will appear for a very short time, so please pay attention!</p>
    `],
    [`
    <p><strong>Looking good!</strong></p>
    <p>This task is supposed to be quite challenging, so it could happen that sometimes you are sure you made a correct judgment, but sometimes less sure.</p>
    <p>Therefore, we would like to know your <strong>confidence about each judgment.</strong></p>
    `],
    [`
    <p>Great!</p>
    <p>Let's try a few more with your confidence ratings.</p>
    <p>This time you won't get the feedback anymore.</p>
    `],
    [`
    <p>Now we are ready to start!</p>
    <p><strong>Reminder:</strong></p>
    <p>🌹 Memorize the flowers carefully — they will only appear for a short time!</p>
    <p>🔍 Pick out the flower that has been shown to you.</p>
    <p>⭐ Then rate how confident you are in your decision using the scale provided.</p>
    <p>💡 There will be no feedback during the main task, so just try your best!</p>
    </ul>
    <p>Take a deep breath, stay focused, and let’s begin.</p>
    `]
];

var example_wm_stimuli = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function () {
        let flowers = [];
        // draw 3 different flowers
        flowers.push(drawFlower({n_petals: 10, shape: 'triangle', center_color: '#902618', petal_color: '#FB9946',layered: false, n_leaves: 1, angle: 0, size: WM_stimuli_size}));
        flowers.push(drawFlower({n_petals: 6, shape: 'oval', center_color: '#4B2F3E', petal_color: '#FFD30D',layered: true, n_leaves: 0, angle: 100, size: WM_stimuli_size}));
        flowers.push(drawFlower({n_petals: 4, shape: 'rect', center_color: '#19180A', petal_color: '#BBA1BE', layered: false, n_leaves: 2, angle: 200, size: WM_stimuli_size}));

        let flowersHTML = flowers.map(flower => 
            `<div class="img" width="${WM_stimuli_size}" height="${WM_stimuli_size}" style="display: inline-block;">${flower}</div>`
        ).join('');
        
        return `
            <p>The flowers look like this</p>
            <div style="display: block;">
                ${flowersHTML}
            </div>
        `;
    },
    choices: ['Got it!'],
    trial_duration: null, // wait until response
    data: {
        type: 'example_wm_stimuli'
    }
};

var example_wm_decision = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p>During the task, click on the flower that has been just shown to you.</p><p>In the previous example, you\'ve seen the flower on the left but not the one on the right.</p><p>In this case, you should click on the flower on the left.</p><p>Now, click on the flower on the left to proceed.</p>',
    choices: function() {
        let flowers = [];
        flowers.push(drawFlower({n_petals: 6, shape: 'oval', center_color: '#4B2F3E', petal_color: '#FFD30D',layered: true, n_leaves: 0, angle: 100, size: WM_stimuli_size}));
        flowers.push(drawFlower({n_petals: 4, shape: 'heart', center_color: '#19180A', petal_color: '#E96047', layered: true, n_leaves: 1, angle: 200, size: WM_stimuli_size}));

        return flowers.map(flower => 
            `<div class="img" style="display:inline-block; cursor:pointer;" width="${WM_stimuli_size}" height="${WM_stimuli_size}">${flower}</div>`
        );
    },
    data: {
        type: 'example_wm_decision'
    },
};

var wm_stimuli = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        let flowers = [];
        wm_stimuli_params = [];
        for (let i = 0; i < set_size+1; i++) {
            let params = generateFlowerParams();
            wm_stimuli_params.push(params);
            flowers.push(drawFlower(params));
        }

        let flowersHTML = flowers.slice(0, -1).map(flower => 
            `<div class="img" width="${WM_stimuli_size}" height="${WM_stimuli_size}" style="display: inline-block;">${flower}</div>`
        ).join('');
        
        return `
            <p>Memorize the flowers</p>
            <div style="display: block;">
                ${flowersHTML}
            </div>
        `;
    },
    choices: "NO_KEYS",
    trial_duration: WM_duration,
    post_trial_gap: post_stimulus_gap,

    data: {
        type: 'wm_stimuli'
    },
    on_finish: function (data) {
        data.current_set_size = set_size;
        data.wm_stimuli_params = JSON.stringify(wm_stimuli_params);
        console.log(`Current set_size: ${data.current_set_size}`);
    }
};

var wm_decision = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<p>Which flower has been just shown to you?</p>`,
    choices: function() {
        let flowers = [];
        let target_index = Math.floor(Math.random() * set_size);
        let target_params = wm_stimuli_params[target_index];
        let new_flower_params = wm_stimuli_params[wm_stimuli_params.length - 1];

        while (JSON.stringify(new_flower_params) === JSON.stringify(target_params)) {
            new_flower_params = generateFlowerParams();
        }

        let target_position = jsPsych.evaluateTimelineVariable('target');
        console.log(`Target flower index: ${target_index}, position: ${target_position}`);

        if (target_position === 'left') {
            flowers.push(drawFlower(target_params));
            flowers.push(drawFlower(new_flower_params));
        } else {
            flowers.push(drawFlower(new_flower_params));
            flowers.push(drawFlower(target_params));
        }

        return flowers.map(flower => 
            `<div class="img" style="display:inline-block; cursor:pointer;" width="${WM_stimuli_size}" height="${WM_stimuli_size}">${flower}</div>`
        );
    },
    data: {
        typef: 'wm_decision',
    },
    on_finish: function (data) {
        data.current_set_size = set_size;
        // response will be 0 (left) or 1 (right)
        data.response = data.response === 0 ? 'left' : 'right';
        data.correct = (data.response === data.target) ? 1 : 0;

        console.log(`Response=${data.response}, Correct=${data.correct}`);

        staircaseEvaluator(data.correct,'wm');

        data.next_set_size = set_size;
        data.staircase_up = stairCaseUp;
        data.staircase_down = stairCaseDown;
        data.reversals = reversals.length;
    }
};

///////////////////////////////////////////////////////////////////////////////
//                      Building the experimental timeline
///////////////////////////////////////////////////////////////////////////////
// build instructions
function instructions(pages, emoji) {
    return pages.map((p, i) => {
        return {
            type: jsPsychInstructions,
            show_clickable_nav: true,
            show_page_number: false,
            pages: p,
            allow_backward: false,
            button_label_next: (i == p.length-1) ? (emoji + ' Start!') : 'Next'
        }
    })
}
function decision_practice(decision_practice_variables, stimulus, decision) {
    return {
        timeline: [iti, stimulus, decision, feedback],
        timeline_variables: decision_practice_variables,
        data: function () {
            return {
                phase: 'decision_practice',
                target: jsPsych.evaluateTimelineVariable('target'),
                trial: jsPsych.evaluateTimelineVariable('trial'),
            };
        }
    };
};
var rdm_decision_practice = decision_practice(rdm_decision_practice_variables, rdm_stimuli, rdm_decision, '🐝')
var wm_decision_practice = decision_practice(wm_decision_practice_variables, wm_stimuli, wm_decision, '🌹')

function confidence_practice(confidence_practice_variables, stimulus, decision) {
    return {
        timeline: [iti, stimulus, decision, confidence_rt],
        timeline_variables: confidence_practice_variables,
        data: function () {
            return {
                phase: 'confidence_practice',
                target: jsPsych.evaluateTimelineVariable('target'),
                trial: jsPsych.evaluateTimelineVariable('trial'),
            };
        }
    };
};
var rdm_confidence_practice = confidence_practice(rdm_confidence_practice_variables, rdm_stimuli, rdm_decision)
var wm_confidence_practice = confidence_practice(wm_confidence_practice_variables, wm_stimuli, wm_decision)

function task_instructions(pages, example_stimuli, example_decision, decision_practice, confidence_practice, emoji) {
    if (pages.length != 6)
        throw('Must have six pages of instructions.');

    let i = instructions(pages, emoji);

    return {
        timeline: [i[0], example_stimuli, i[1], example_decision, i[2],
            decision_practice, i[3], example_confidence_rt, i[4], confidence_practice, i[5]]
    };
}
var rdm_instructions = task_instructions(rdm_pages, example_rdm_stimuli, example_rdm_decision, rdm_decision_practice, rdm_confidence_practice, '🐝');
var wm_instructions = task_instructions(wm_pages, example_wm_stimuli, example_wm_decision, wm_decision_practice, wm_confidence_practice, '🌹');


// build main task
function main_task(block_variables, stimulus, decision, emoji) {
    return {
        timeline: block_variables.flatMap((block_vars, i) => {
            const block_timeline = [
                {
                    timeline: [iti, stimulus, decision, confidence_rt],
                    timeline_variables: block_vars,
                    data: function () {
                        return {
                            phase: 'main_task',
                            target: jsPsych.evaluateTimelineVariable('target'),
                            trial: jsPsych.evaluateTimelineVariable('trial'),
                            block: jsPsych.evaluateTimelineVariable('block'),
                            trial_in_block: jsPsych.evaluateTimelineVariable('trial_in_block')
                        };
                    }
                }
            ];

            // add inter-block break if not the last block
            if (i < block_variables.length - 1) {
                block_timeline.push({
                    type: jsPsychHtmlButtonResponse,
                    stimulus: '<p>Great job so far!</p><p>You have completed ' + (i + 1) + ' out of ' + n_block + ' blocks.</p><p>You can now pause for a short break.</p><p>Click on the button below to continue the task.</p>',
                    choices: [emoji + ' Continue'],
                    trial_duration: null,
                    data: { phase: 'inter_block_break' }
                });
            } else {
                // end of the last block
                block_timeline.push({
                    type: jsPsychHtmlButtonResponse,
                    stimulus: '<p>You have completed all blocks of the main task!</p><p>Click on the button below to proceed to the final questions.</p>',
                    choices: ['Continue'],
                    trial_duration: null,
                    data: { phase: 'end_of_main_task' }
                });
            }

            return block_timeline;
        })
    };
}
var rdm_main_task = main_task(rdm_main_task_block_variables, rdm_stimuli, rdm_decision, '🐝');
var wm_main_task = main_task(wm_main_task_block_variables, wm_stimuli, wm_decision, '🌹');

//create task info summary based on task_seq
var tasks = task_seq.map(task => {
    if (task === 'rdm') {
        return {
            name: 'rdm',
            emoji: '🐝',
            timeline: [rdm_instructions, rdm_main_task, global_confidence]
        };
    } else if (task === 'wm') {
        return {
            name: 'wm',
            emoji: '🌹',
            timeline: [wm_instructions, wm_main_task, global_confidence]
        };
    }
});
// build the entire experiment
var experiment = {
    timeline: tasks.flatMap((task, i) => {

        let task_intro = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `<p>You are about to begin <strong>Task ${i + 1}</strong></p>
                      `,
            choices: ['Start Task'],
            data: {phase: 'task_intro', task: task.name}
        };

        let task_timeline = {
            timeline: task.timeline,
            data: {task:  task.name}
        };

        let experiment_timeline = [task_intro, task_timeline];

        // reset staircasing variables
        reversals = []; // track all reversal points
        previous_direction = 0; // -1 = getting easier, 1 = getting harder, 0 = no change
        
        // add inter-task break unless it's the last task
        if (i < tasks.length - 1) {
            experiment_timeline.push({
                type: jsPsychHtmlButtonResponse,
                stimulus: `<p>Thank you for completing Task ${i + 1}.</p>
                           <p>You can now pause for a short break.</p>
                           <p>Click on the button below to continue to the next task.</p>`,
                choices: ['Continue'],
                data: { phase: 'inter_task_break', task: task.name }
            });
        }

        return experiment_timeline;
    })
};
///////////////////////////////////////////////////////////////////////////////
//                         Post-experiment questions
///////////////////////////////////////////////////////////////////////////////
// gather demographics
var age = {
    timeline: [{
        type: jsPsychSurveyText,
        questions: [{ name: "age", prompt: "What is your age?", required: true }],
        on_finish: function (data) {
            data.measure = "age";
            data.response = parseInt(data.response.age);
        }
    }],
    loop_function: function (data) {
        let response = parseInt(data.values()[0].response);
        if (isNaN(response)) alert("Please enter in your age as a number.");
        if (!isNaN(response) && (response <= 0 || response > 150)) alert("Please enter a valid age.");
        return isNaN(response) || response <= 0 || response > 150;
    }
};

var gender = {
    type: jsPsychSurveyMultiChoice,
    questions: [{
        name: 'gender', prompt: 'What is your gender?',
        options: jsPsych.randomization.shuffle(['Man', 'Woman', 'Other']),
        option_reorder: 'random', required: true
    }],
    on_finish: function (data) {
        data.measure = "gender";
        data.response = data.response.gender;
    }
};

// make sure participants paid attention
var attn_check = {
    type: jsPsychSurveyMultiChoice,
    questions: [{
        name: 'attn_check', required: true,
        prompt: `<p align='left'>Please be honest when answering the following question.
           <b>Your answer will not affect your payment or eligibility for future studies.</b></p>
           <p align='left'>The study you have just participated in is a psychological study aimed at understanding human cognition and behavior.
            Psychological research depends on participants like you.
            Your responses to surveys like this one are an incredibly valuable source of data for researchers.
            It is therefore crucial for research that participants pay attention, avoid distractions,
            and take all study tasks seriously (even when they might seem silly).</p>
           <b>Do you feel that you paid attention, avoided distractions, and took this survey seriously?</b>`,
        options: [
            "No, I was distracted.",
            "No, I had trouble paying attention",
            "No, I did not take the study seriously",
            "No, something else affected my participation negatively.",
            "Yes."
        ]
    }],
    on_finish: function (data) {
        data.measure = "attention_check";
        data.response = data.response.attn_check;
    }
};

// gather any other feedback
var comments = {
    type: jsPsychSurveyText,
    questions: [{ name: 'comments', type: 'text', prompt: "Do you have anything else to add (comments, questions, etc)?", rows: 10 }],
    on_finish: function (data) {
        data.measure = "comments";
        data.response = data.response.comments;
    }
}
