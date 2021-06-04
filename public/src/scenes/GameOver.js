class GameOver extends Phaser.Scene {

    init(data) {
        this.scoreVal = data.score;
        this.topScore = data.topScore;
        this.game = data.game;
    }

    create() {

        if (this.cache.game.trial - this.cache.game.player_trial == 1) {
            this.cache.game.player_trial += 1;
        }
        this.gameOverText = this.make.text({    
            style: {
            font: '50px Rubik',
            fill: 'white',
        }})
        this.gameOverText.x = 500;
        this.gameOverText.y = 100;
        this.gameOverText.originX = 0.5;
        this.gameOverText.originY = 0.5;
        this.gameOverText.setText('GAME OVER');
        this.gameOverText.setAlign('center');

        this.text = this.make.text({    
            style: {
            font: '15px Rubik',
            fill: 'white',
        }});
        this.text.x = 500;
        this.text.y = 300;
        this.text.originX = 0.5;
        this.text.originY = 0.5;
        this.text.setText('The planet ran out of supplies!\n\n' +
            '\n\n\nPress space to play again!\n\nThe game will continue until you have made ' + Object.keys(this.cache.json.get('trial_info')).length + ' decisions\n\nin total, regardless of how many times you see this screen');
        this.text.setAlign('center');
        this.saveData();

    }

    update() {

        var cursors = this.input.keyboard.createCursorKeys();

        if (cursors.space.isDown) {
            cursors.space.isDown = false;
            this.scene.start('GameScene', {score: this.scoreVal});

        }
    }

    saveData() {

        // var docRef = this.cache.game.db.collection("spaceship").doc(this.cache.game.studyID).collection('subjects').doc(this.cache.game.uid);

        // docRef.update({
        //     trial_data: this.cache.game.data,
        //     attention_checks: this.cache.game.attention_checks,
        //     response_warnings_shown: this.cache.game.responseWarningsShown
        // })

    }

}

export default GameOver;