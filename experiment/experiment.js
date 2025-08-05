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
/////////////test

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

// the initial set of instructions
var instructions = {
    type: jsPsychInstructions,
    show_clickable_nav: true,
    show_page_number: true,
    pages: [
        `<p>*insert instructions here*</p>`
    ],
    button_label_previous: '',
    button_label_next: ''
};



///////////////////////////////////////////////////////////////////////////////
//                                Task design
///////////////////////////////////////////////////////////////////////////////





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
