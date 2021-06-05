import GameStart from './scenes/GameStart.js';
import TrainingScene from './scenes/TrainingScene.js';
import GameScene from './scenes/GameScene.js';
import GameOver from './scenes/GameOver.js';
import EndScene from './scenes/EndScene.js';
import BreakScene from './scenes/BreakScene.js';

// SET UP GAME
// var training = new GameScene('TrainingScene');
var game = new GameScene('GameScene');
var gameover = new GameOver("GameOver");
var breakScene = new BreakScene("BreakScene");

let config = {
    type: Phaser.WEBGL,
    parent: 'start',
    width: 1000,
    height: 600,
    scene: [
        TrainingScene,
        game,
        gameover,
        EndScene,
        breakScene
    ]
};

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


// START GAME
var subjectID;
var check_start = function (uid) {


    // Get subject ID from URL
    if (window.location.search.indexOf('PROLIFIC_PID') > -1) {
        var subjectID = getQueryVariable('PROLIFIC_PID');
    }
    else {
        var subjectID = Math.floor(Math.random() * (2000000 - 0 + 1)) + 0; // if no prolific ID, generate random ID (for testing))
    }


    // Testing
    var testing = 'FALSE';
    if (window.location.search.indexOf('TEST') > -1) {
        var testing = getQueryVariable('TEST');
    }

    // STUDY ID
    var studyID = 'NONE';
    if (window.location.search.indexOf('STUDY') > -1) {
        var studyID = getQueryVariable('STUDY');
    }

    // STUDY ID
    var version = 0;
    if (window.location.search.indexOf('VERSION') > -1) {
        var version = getQueryVariable('VERSION');
    }

    // Binary outcomes
    var binary = false;
    if (window.location.search.indexOf('BINARY') > -1) {
        var binaryParam = getQueryVariable('BINARY');
        if (binaryParam == 'TRUE') {
            binary = true;
        }
        else if (binaryParam == 'rand') {
            if (Phaser.Math.Between(0, 1)) {
                binary = true;
            }
            else {
                binary = false;
            }
        }
        
    }

    document.getElementById('start').innerHTML = "";
    window.scrollTo(0,0);
    $.getJSON('./trial_info.json', function (data) {

        let game = new Phaser.Game(config);

        game.config.secondStateOrder = Phaser.Math.Between(0, 1);

        if (game.config.secondStateOrder == 0) {
            game.config.secondStateNames = ['BLUE', 'YELLOW'];
        }
        else {
            game.config.secondStateNames = ['YELLOW', 'BLUE'];
        }

        game.registry.set('secondStateOrder', game.config.secondStateOrder);
        
        // Shuffle ships
        var shipNames = ['Green ship', 'Red ship', 'Pink ship', 'Orange ship'];
        game.registry.set('shipNames', shipNames);
        Phaser.Actions.Shuffle(shipNames);

        game.config.shipNames = shipNames;

        if (testing == 'FALSE') {
            game.config.testing = false;   
        }
        else {
            game.config.testing = true;   
        }

        game.config.outcome_duration = 4000;
        game.config.studyID = studyID;
        game.config.binary = binary;

        game.registry.set('trial', 0);
        game.registry.set('data', {});
           
        game.registry.set('subjectID', subjectID);
        game.registry.set('studyID', studyID.toLowerCase());
        game.config.studyID = studyID.toLowerCase();
     

        //////////////////////////////////

        // Update firebase data
        var db = firebase.firestore();

        db.collection("spaceship_MB").doc(game.config.studyID).collection('subjects').doc(uid).set({
            subjectID: subjectID,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            trial_data: [],
            attention_checks: [],
            binary: binary,
            version: parseInt(version),
            }).catch(err => {
                Rollbar.error(err, function(err, data) {
                    if (err) {
                      console.log("Error while reporting error to Rollbar: ", e);
                    } else {
                      console.log("Error successfully reported to Rollbar. UUID:", data.result.uuid);
                    }
                  });
                alert("Something went wrong, sorry. Please contact us on Prolific");
            })
                    
        game.config.db = db;
        game.config.uid = uid;
        
        game.registry.set('start_time', new Date());


    });


};

var uid;
// Firebase
firebase.auth().signInAnonymously().then(function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            var isAnonymous = user.isAnonymous;
            uid = user.uid;
            check_start(uid);
        } 
    });
}).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.error(errorCode);
    console.error(errorMessage);

    document.body.innerHTML = '<div id="mainDiv"><div class="jspsych-display-element">' + 
    "<h1>Oops</h1>Looks like there's a problem! Try hard refreshing your browser (Ctrl + F5). If that doesn't work, contact us on Prolific.<br><br>Thank you!</div></div>"
});


