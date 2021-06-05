class BreakScene extends Phaser.Scene {

    init() {
    }

    create() {

        this.gameOverText = this.make.text({    
            style: {
            font: '50px Rubik',
            fill: 'white',
        }})
        this.gameOverText.x = 500;
        this.gameOverText.y = 100;
        this.gameOverText.originX = 0.5;
        this.gameOverText.originY = 0.5;
        this.gameOverText.setText('Break');
        this.gameOverText.setAlign('center');

        this.text = this.make.text({    
            style: {
            font: '25px Rubik',
            fill: 'white',
        }});
        this.text.x = 500;
        this.text.y = 300;
        this.text.originX = 0.5;
        this.text.originY = 0.5;
        this.text.setText('Take a break!\n\n' +
            '\n\n\nPress space when you are ready to continue\n\n');
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

export default BreakScene;