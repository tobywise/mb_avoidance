

import GameStart from './scenes/GameStart.js';
import GameScene from './scenes/GameScene.js';
import GameOver from './scenes/GameOver.js';
import EndScene from './scenes/EndScene.js';
import loadIndicator from './classes/loadIndicator.js';


// Sentry.init({ dsn: 'https://858581c7c8234dd393241da13da4f94b@sentry.io/1340805' });


// SET UP GAME
var game = new GameScene('GameScene');
var gameover = new GameOver("GameOver");

let config = {
    type: Phaser.WEBGL,
    parent: 'start',
    width: 1000,
    height: 600,
    scene: [
        // GameStart,
        game,
        gameover,
        EndScene
    ]
};

// var uid;
// // Firebase
// firebase.auth().signInAnonymously().then(function() {
//     firebase.auth().onAuthStateChanged(function(user) {
//         if (user) {
//             var isAnonymous = user.isAnonymous;
//             uid = user.uid;
//         } 
//     });
// }).catch(function(error) {
//     var errorCode = error.code;
//     var errorMessage = error.message;
//     console.error(errorCode);
//     console.error(errorMessage);

//     document.body.innerHTML = '<div id="mainDiv"><div class="jspsych-display-element">' + 
//     "<h1>Oops</h1>Looks like there's a problem! Try hard refreshing your browser (Ctrl + F5). If that doesn't work, contact us on Prolific.<br><br>Thank you!</div></div>"
// });

function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}

// Get subject ID from URL
if (window.location.search.indexOf('PROLIFIC_PID') > -1) {
    var subjectID = getQueryVariable('PROLIFIC_PID');
}
else {
    var subjectID = Math.floor(Math.random() * (2000000 - 0 + 1)) + 0; // if no prolific ID, generate random ID (for testing))
}

// STUDY ID
var studyID = 'NONE';
if (window.location.search.indexOf('STUDY') > -1) {
    var studyID = getQueryVariable('STUDY');
}

// Testing
var testing = 'FALSE';
if (window.location.search.indexOf('TEST') > -1) {
    var testing = getQueryVariable('TEST');
}

// Completion
var completion_code = 'FALSE';
if (window.location.search.indexOf('completion_token') > -1) {
    var completion_code = getQueryVariable('completion_token');
}

// Completion
var iti = 'default';
if (window.location.search.indexOf('ITI') > -1) {
    var iti = getQueryVariable('ITI');
}


// START GAME
var subjectID;
var check_start = function (vasData={}) {


    console.log(vasData);
    document.getElementById('start').innerHTML = "";
    window.scrollTo(0,0);
    $.getJSON('./trial_info.json', function (data) {

        // Add brief instructions
        var helperText = document.createElement('div');
        helperText.innerHTML = 'Move the spaceship using the <b>up</b> and <b>down</b> keys to avoid the asteroids<br><br><br>'
        document.getElementById('start').appendChild(helperText);

        let game = new Phaser.Game(config);

        game.trial_info = data;
        game.trial = 0;
        game.player_trial = 0;
        game.data = {};
        game.dataKeys = ['health', 'hole1_y', 'hole2_y', 'player_y', 'score', 'subjectID', 'trial', 'trial_type'];
        game.subjectID = subjectID;
        game.studyID = studyID.toLowerCase();
        game.testing = testing;      


        game.asteroid_velocity = -700;  // Determines the speed of the asteroid belt. Must be negative. If tweaking this, make sure that it makes it difficult for subjects to move in time to avoid getting hit once seeing the asteroid belt appear.
        game.asteroid_health_decrement = 0.05;  // Determines how much health is lost each time an asteroid is it.
        game.sampleRate = 2;  // Determines how frequently data is saved (hz)
        game.score_increment = 10;  // Determines how quickly the score increases
        game.health_increase = 0.00012; // Determines how quickly subjects' health increases

        //////////////////////////////////

        // // Update firebase data
        // var db = firebase.firestore();


        // db.collection("spaceship").doc(game.studyID).collection('subjects').doc(uid).set({
        //     subjectID: game.subjectID,
        //     subjectID: game.subjectID,
        //     date: new Date().toLocaleDateString(),
        //     time: new Date().toLocaleTimeString(),
        //     trial_data: [],
        //     started: true,
        //     completed: false,
        //     version:3,
        //     iti: game.iti,
        //     language: language,
        //     pre_test_items: vasData,
        //     attention_checks: []
        //     }).catch(err => {
        //         Sentry.captureException(err)
        //         console.log(err);
        //         alert("Something went wrong, sorry. Please contact us on Prolific");
        //     })
                    
        // game.db = db;
        // game.uid = uid;
        game.start_time = new Date();
        game.attention_checks = [];
        game.responseWarningsShown = 0;
        game.completion_code = completion_code;


    });


};

check_start();

