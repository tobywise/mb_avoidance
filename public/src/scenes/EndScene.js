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

        // var docRef = this.cache.game.db.collection("spaceship").doc(this.cache.game.studyID).collection('subjects').doc(this.cache.game.uid);
        this.addQuestionniareToPage();
        // docRef.update({
        //     trial_data: this.cache.game.data,
        //     attention_checks: this.cache.game.attention_checks,
        //     response_warnings_shown: this.cache.game.responseWarningsShown
        // }).then(
        //     this.addQuestionniareToPage()
        // ).catch(function(error) {
        //     console.error("Error writing document: ", error);
        //     this.addQuestionniareToPage();
        //     }
        // )
        
    }

    addQuestionniareToPage() {
        this.text = this.make.text({    
            style: {
            font: '20px Rubik',
            fill: 'white',
        }});
        this.text.x = 500;
        this.text.y = 300;
        this.text.originX = 0.5;
        this.text.originY = 0.5;
        this.text.setText('End of the game!\n\n\n\n' +
            '\n\n\nClick here to finish the task');
        this.text.setAlign('center');
        
        this.text.setInteractive();

        this.text.on('pointerup', function() {
            postTestItems(this);
        }, this);
        
            
        
    }

    update() {
    }


}

var postTestItems = function(context) {


    document.getElementById('start').innerHTML = `
    <br>
    <b>How anxious did the game make you feel?</b>
    <div class="slidecontainer2">
    <input type="range" min="1" max="100" value="50" class="slider" id="VAS1_post">
    </div>
    <div class="slider-label-container">
    <div class"slider-label">Not at all</div>
    <div class"slider-label">Very much so</div>
    </div>
    
    <b>Rate the maximum intensity you felt each emotion during the game:</b><br><br>
    <br>


    `
    var emotions = ['anxious',
    'excited',
    'scared',
    'happy',
    'worried',
    'bored',
    'aroused']



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
        }

        emotions.forEach(element => {
            vasData[element + '_VAS_POST'] = document.getElementById(element + '_VAS_POST').value
        });

        var docRef = context.game.config.db.collection("spaceship_MB").doc(context.game.config.studyID).collection('subjects').doc(context.game.config.uid);

        docRef.update({
            post_test_items: vasData
        }).then(
            function() {

                var complete_url = 'https://app.prolific.co/submissions/complete?cc=10B15748';    
                document.getElementById('start').innerHTML = 'Thank you! Please click' +
                ' <a href="' + complete_url + '">here</a> to return to Prolific';
                window.location.href = complete_url;
            }
        
        ).catch(function(error) {
            console.error("Error writing document: ", error);
            var complete_url = 'https://app.prolific.co/submissions/complete?cc=10B15748';    
            document.getElementById('start').innerHTML = 'Thank you! Please click' +
            ' <a href="' + complete_url + '">here</a> to return to Prolific';
            window.location.href = complete_url;
            }
        )

    };

}

export default EndScene;