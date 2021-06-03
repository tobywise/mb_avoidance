class EndScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'EndScene',
        });
    }

    init(data) {
        this.scoreVal = data.score;
        this.topScore = data.topScore;
    }

    create() {
        // SAVE DATA
        var time_taken = (new Date() - this.cache.game.start_time) / 60000;

        var docRef = this.cache.game.db.collection("spaceship").doc(this.cache.game.studyID).collection('subjects').doc(this.cache.game.uid);

        docRef.update({
            trial_data: this.cache.game.data,
            attention_checks: this.cache.game.attention_checks,
            response_warnings_shown: this.cache.game.responseWarningsShown
        }).then(
            this.addQuestionniareToPage()
        ).catch(function(error) {
            console.error("Error writing document: ", error);
            this.addQuestionniareToPage();
            }
        )
        
    }

    addQuestionniareToPage() {
        this.text = this.make.text({    
            style: {
            font: '20px Rubik',
            fill: 'white',
        }});
        this.text.x = 400;
        this.text.y = 300;
        this.text.originX = 0.5;
        this.text.originY = 0.5;
        this.text.setText('End of the game!\n\n\n\nTop score: ' + this.topScore +
            '\n\n\nClick here to finish the task');
        this.text.setAlign('center');
        
        this.text.setInteractive();

        if (this.cache.game.completion_code != 'FALSE') {
            this.text.on('pointerup', function() {
                var complete_url = 'https://research.sc/participant/login/resume/' + this.cache.game.completion_code;    
                document.getElementById('start').innerHTML = 'If you are not redirected automatically, please click' +
                ' <a href="' + complete_url + '">here</a> to return to Gorilla';
                window.location.href = complete_url;
            }, this);
            
        }

        else if (this.cache.game.studyID == 'anxiety_study') {
            this.text.on('pointerup', function() {
                document.getElementById('start').innerHTML = "<div>Use the following code to complete the task: SP4CESH1P</div>";                
            });
        }

        else if (this.cache.game.studyID == 'validation_study') {
            var complete_url = 'https://app.prolific.co/submissions/complete?cc=10B15748';    
            document.getElementById('start').innerHTML = 'Thank you! Please click' +
            ' <a href="' + complete_url + '">here</a> to return to Prolific';
            // window.location.href = complete_url;
        }

        else if (this.cache.game.studyID == 'iti_study') {
            var complete_url = 'https://app.prolific.co/submissions/complete?cc=10B15748';    
            document.getElementById('start').innerHTML = 'Thank you! Please click' +
            ' <a href="' + complete_url + '">here</a> to return to Prolific';
            // window.location.href = complete_url;
        }

        else if (this.cache.game.studyID == 'ecg_v2') {
            postTestItems(this.cache.game.language, this);
            // window.location.href = complete_url;
        }

        else {
            this.text.on('pointerup', function() {
                document.getElementById('start').innerHTML = "<div>End of task</div>";
            });
            
        }
    }

    update() {
    }


}

var postTestItems = function(language, context) {

    if (language == 'EN') {

        document.getElementById('start').innerHTML = `
        <br>
        <b>My heart beats fast</b>
        <div class="slidecontainer2">
        <input type="range" min="1" max="100" value="50" class="slider" id="VAS1_post">
        </div>
        <div class="slider-label-container">
        <div class"slider-label">Not at all</div>
        <div class"slider-label">Very much so</div>
        </div>
        
        <b>I have butterflies in my stomach</b>
        <div class="slidecontainer2">
        <input type="range" min="1" max="100" value="50" class="slider" id="VAS2_post">
        </div>
        <div class="slider-label-container">
        <div class"slider-label">Not at all</div>
        <div class"slider-label">Very much so</div>
        </div>
    
        <b>My palms feel clammy</b>
        <div class="slidecontainer2">
        <input type="range" min="1" max="100" value="50" class="slider" id="VAS3_post">
        </div>
        <div class="slider-label-container">
        <div class"slider-label">Not at all</div>
        <div class"slider-label">Very much so</div>
        </div>
    
        <b>Rate the maximum intensity you felt each descriptor during the game:</b>
        <br>
    
    
        `
        var emotions = ['anxious',
        'excited',
        'scared',
        'happy',
        'worried',
        'bored',
        'aroused']
    }

    else {

        document.getElementById('start').innerHTML = `
        <br>
        <b>Mit hjerte banker hurtigt</b>
        <div class="slidecontainer2">
        <input type="range" min="1" max="100" value="50" class="slider" id="VAS1_post">
        </div>
        <div class="slider-label-container">
        <div class"slider-label">Slet ikke</div>
        <div class"slider-label">Virkelig meget</div>
        </div>
        
        <b>Jeg har sommerfugle i maven</b>
        <div class="slidecontainer2">
        <input type="range" min="1" max="100" value="50" class="slider" id="VAS2_post">
        </div>
        <div class="slider-label-container">
        <div class"slider-label">Slet ikke</div>
        <div class"slider-label">Virkelig meget</div>
        </div>
    
        <b>Mine håndflader føles svedige</b>
        <div class="slidecontainer2">
        <input type="range" min="1" max="100" value="50" class="slider" id="VAS3_post">
        </div>
        <div class="slider-label-container">
        <div class"slider-label">Slet ikke</div>
        <div class"slider-label">Virkelig meget</div>
        </div>
    
        <b>Angiv den højeste intensitet du følte imens du spillede spillet for hver af de følgende:</b>
        <br>
    
        `
        var emotions = ['Angst',
            'Spændt',
            'Bange',
            'Glad',
            'Bekymret',
            'Kedsomhed',
            'Ophidset'
            ]

    }



    emotions.forEach(element => {
        document.getElementById('start').innerHTML += '<b>' + element  +'</b>';
        document.getElementById('start').innerHTML += `
        <div class="slidecontainer2">
        <input type="range" min="1" max="100" value="50" class="slider" id="` + element + `_VAS_POST">
        </div>
        <div class="slider-label-container">
        <div class"slider-label">0</div>
        <div class"slider-label">100</div>
        </div>
        `
    });

    document.getElementById('start').innerHTML += `
    </p>
    <button type=\"button\" id=\"startButton\" class=\"submit_button\">OK</button>
    <br><br>
    `

    document.getElementById("startButton").onclick = function() {

        var vasData = {
            VAS1_PRE: document.getElementById('VAS1_post').value,
            VAS2_PRE: document.getElementById('VAS2_post').value,
            VAS3_PRE: document.getElementById('VAS3_post').value,
        }

        emotions.forEach(element => {
            vasData[element + '_VAS_POST'] = document.getElementById(element + '_VAS_POST').value
        });

        var docRef = context.cache.game.db.collection("spaceship").doc(context.cache.game.studyID).collection('subjects').doc(context.cache.game.uid);

        docRef.update({
            post_test_items: vasData
        }).then(
            document.getElementById('start').innerHTML = "<div>End of task</div>"
        ).catch(function(error) {
            console.error("Error writing document: ", error);
            document.getElementById('start').innerHTML = "<div>End of task</div>";
            }
        )

    };

}

export default EndScene;