///////////////////////////////////////////////////////////////////////////////
//                         Parameters
///////////////////////////////////////////////////////////////////////////////
// trial numbers
var n_decision_practice = 5; // number of decision trials for practice
var n_confidence_practice = 3; // number of confidence trials for practice
var n_main = 5; // number of main trials

//var n_block = 4; // number of blocks in the main task

// for tracking rdm properties
var current_correct_direction = null;
var current_coherence_level = null;

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

///////////////////////////////////////////////////////////////////////////////
//                                Task design
///////////////////////////////////////////////////////////////////////////////
//preload images
var preload = {
    type: jsPsychPreload,
    images: [backgroundImage, dotImage]//defined in RandomBeeMotion.js
};

var instruction_1 = {
    type: jsPsychInstructions,
    show_clickable_nav: true,
    show_page_number: false,
    pages: [
        `<h1>Welcome to the task!</h2>
        <p>In this task, you'll watch bees🐝 perform their <strong>waggle dance</strong>—a way they show other bees where to find flowers and nesting sites.</p>
        <p>🔍Please help us observe the <strong>direction </strong> of the waggle dance! </p>
        `
    ],
    allow_backward: false,
    button_label_next: 'Next'
};

var example_stimuli = {
    type: jsPsychHtmlButtonResponse,
    // create a container for the RDM
    stimulus: function() {
        return createRDMContainer(RDM_box_width, RDM_box_height, 
            "The waggle dance looks like this",
            "💡The movement looks messy, but if you look closely, the majority is moving to one direction."
        );
    },
    choices: ['Got it!'],// navigation buttons
    trial_duration: null, // wait until response
    // store metadata
    data: {
        task: 'example_stimuli',
        coherence: function() {
            return coherence; // example coherence level for demonstration
        }
    },
    // start the RDM animation
    on_load: function() {
        startRDM(example_coherence, example_direction);// use fixed coherence and direction (right) for the example
    }
};

var instruction_2 = {
    type: jsPsychInstructions,
    show_clickable_nav: true,
    show_page_number: false,
    pages: [
        `<p> 🔍 In the following task, your job is to determine the overall direction of the bees' motion—left or right.</p>`
    ],
    allow_backward: false,
    button_label_next: 'Start!'
};

var example_rdm_decision = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p>During the task, click on the <strong>LEFT</strong> button if you think more bees are moving left, or the <strong>RIGHT</strong> button if you think more bees are moving right.</p><p>Now, click on any button to proceed.</p>',
    choices: ['Left', 'Right'],
    data: {
        task: 'example_rdm_decision',
    },
};

var instruction_3 = {
    type: jsPsychInstructions,
    show_clickable_nav: true,
    show_page_number: false,
    pages: [
        `<p> In addition, after your decision, we will tell you whether your judgment was correct.</p>
        <p> Now, let's practice a few times.</p>
        <p> ⚠️The bees will appear for a very short time, so please pay attention!</p>`
    ],
    allow_backward: false,
    button_label_next: '🐝Start!'
};

var iti = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '',          // blank screen
    choices: "NO_KEYS",   // no response
    trial_duration: 500    // ITI duration in ms
};

// stimuli used in practice and main trials
var stimuli = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        return createRDMContainer(RDM_box_width, RDM_box_height, "Watch the bees");

    },
    choices: "NO_KEYS",
    trial_duration: RDM_duration, // duration of the RDM animation, set in RandomBeeMotion.js
    data: {
        task: 'stimuli',
        coherence: function() {
            return coherence; // store current coherence
        }
    },
    on_load: function() {
        startRDM(coherence);
    }
};

var rdm_decision = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p>Which direction did the bees move?</p>',
    choices: ['Left', 'Right'],
    data: {
        task: 'rdm_decision',
    },
    on_finish: function(data) {
        //compute correctness
        var correct_direction = current_correct_direction;
        var participant_response;
        if (data.response == 0) {
            participant_response = -1; 
        } else if (data.response == 1) {
            participant_response = 1; 
        }
        var correct = (participant_response === correct_direction);
        
        // apply staircase rule
        staircaseEvaluator(correct);
        
        // store trial data
        data.correct_direction = correct_direction;
        data.participant_response = participant_response;
        data.correct = correct;
        data.coherence_level = current_coherence_level;
        data.next_coherence = coherence; // important
        data.staircase_up = stairCaseUp;
        data.staircase_down = stairCaseDown;
        data.reversals = reversals.length;
        data.step_size = step_size;
        data.trial_number = trial_count;
        
        console.log(`Trial ${trial_count} (${data.phase}): Coherence=${coherence.toFixed(3)}, Correct=${correct}, Reversals=${reversals.length}`);
    }
};

var feedback = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        // get last trial correctness
        var last_trial = jsPsych.data.get().last(1).values()[0];
        var correct = last_trial.correct;
        // show feedback based on correctness
        if (correct) {
            return '<p style="color: green; font-size: 24px;">Correct!</p>';
        } else {
            return '<p style="color: red; font-size: 24px;">Incorrect</p>';
        }
    },
    choices: "NO_KEYS",
    trial_duration: 1000
};

var instruction_4 = {
    type: jsPsychInstructions,
    show_clickable_nav: true,
    show_page_number: false,
    pages: [
        `<p>Looking good!</p>
        <p>This task is supposed to be quite challenging, so it could happen that sometimes you are sure you made a correct judgement, but sometimes less sure.</p>
        <p>Therefore, we would like to know your confidence about each judgments.</p>`
    ],
    allow_backward: false,
    button_label_next: 'Next'
};

var example_confidence_rt = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        return createConfidenceStimulus(
            "<p>A rating scale as shown below is used throughout the task. <p>If you are <strong>more confident</strong> that your judgment was correct, click more on the <strong>RIGHT</strong> of the scale; </p><p>if you are <strong>less confident</strong>, click more on the <strong>LEFT</strong>.</p>  <p>Please do your best to rate your confidence accurately and do take advantage of the whole rating scale.</p><p>Now, click on any point and press continue to proceed.</p>",
            5,
            ['Not sure at all', 'A little sure', 'Somewhat sure', 'Very sure', 'Extremely sure']//change the labels
        );
    },
    choices: "NO_KEYS",
    data: {
        task: 'example_confidence_rt'
    },
    on_finish: function(data) {
        data.response = parseInt(data.response);
        console.log(`Confidence selected: ${data.response}`);
    }
};
var instruction_5 = {
    type: jsPsychInstructions,
    show_clickable_nav: true,
    show_page_number: false,
    pages: [
        `<p>Great!</p>
        <p>Let's try a few more with your confidence ratings.</p>
        <p>This time you won't get the feedback anymore.</p>`
    ],
    allow_backward: false,
    button_label_next: '🐝Start!'
};

var confidence_rt = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        return createConfidenceStimulus(
            "How confident are you in your judgment?",
            5,
            ['Not sure at all', 'A little sure', 'Somewhat sure', 'Very sure', 'Extremely sure']//change the labels
        );
    },
    choices: "NO_KEYS",
    data: {
        task: 'local_confidence'
    },
    on_finish: function(data) {
        data.response = parseInt(data.response);
        console.log(`Confidence selected: ${data.response}`);
    }
};
/*
var confidence_rt = {
    type: jsPsychSurveyLikert,
    questions: [
        {
            prompt: "How confident are you in your judgment?",
            labels: ["😟Not sure at all", "😐Slighty confident", "🙂Very confident", "😊Extremely confident"],
            required: true
        }
    ],
    data: {
        task: 'local_confidence'
    },
    on_finish: function(data) {
        data.response = data.response.Q0;
    }
};

*/

var instruction_6 = {
    type: jsPsychInstructions,
    show_clickable_nav: true,
    show_page_number: false,
    pages: [
        `<p>Now we are ready to start!</p>
        <p><strong>Reminder:</strong></p>
        <p>🐝 Watch the bees closely — they will only appear for a short time!</p>
        <p>⬅️ / ➡️ Decide if the <strong>majority</strong> are moving left or right.</p>
        <p>⭐ Then rate how confident you are in your decision using the scale provided.</p>
        <p>💡 There will be no feedback during the main task, so just try your best!</p>
        </ul>
        <p>Take a deep breath, stay focused, and let’s begin.</p>`
    ],
    allow_backward: false,
    button_label_next: '🐝Start!'
};


// timeline
var decision_practice = {
    timeline: [iti, stimuli, rdm_decision, feedback],
    repetitions: n_decision_practice,
    data: { phase: 'decision_practice' }
};

var confidence_practice = {
    timeline: [iti, stimuli, rdm_decision, confidence_rt],
    repetitions: n_confidence_practice,
    data: { phase: 'confidence_practice' }

};

var instructions = {
    timeline: [instruction_1, example_stimuli, instruction_2, example_rdm_decision,instruction_3, decision_practice, instruction_4, example_confidence_rt, instruction_5, confidence_practice, instruction_6],
    data: { phase: 'instructions' }
};

var main_task = {
    timeline: [iti, stimuli, rdm_decision, confidence_rt],//confidence_rt],
    repetitions: n_main,
    data: { phase: 'main_task' }
  };


///////////////////////////////////////////////////////////////////////////////
//                         Post-experiment questions
///////////////////////////////////////////////////////////////////////////////
var global_confidnece = {};

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
