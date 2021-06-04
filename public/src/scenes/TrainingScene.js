import GameScene from './GameScene.js';
import TextBox from '../classes/textBox.js'

class TrainingScene extends GameScene {

    constructor(key) {
        super('trainingScene');
    }

    preload() {
        super.preload();

        this.load.image('astronaut', './assets/astronaut.png');
    }

    create() {

        super.create();
        this.hideUI();

        this.hideShips();
        this.setShipPos(0, 200, 200);
        this.setShipPos(1, 400, 200);
        this.setShipPos(2, 600, 200);
        this.setShipPos(3, 800, 200);

        this.createTrainingText();
        
        var comtinueKey = this.input.keyboard.addKey('B');

        this.moveAllowed = true;

        if (this.game.config.testing) {
            var keyPressDelay = 20;
        }
        else {
            var keyPressDelay = 1500;
        }

        console.log(keyPressDelay);

        comtinueKey.on('down', function() { 
            if (this.trainingInstructions & this.moveAllowed) {
                this.trainingStep += 1;
                this.nextStep();
                this.moveAllowed = false;
                this.time.addEvent({
                    delay: keyPressDelay,
                    callback() {
                        this.moveAllowed = true;
                    },
                    callbackScope: this
                })
            }            
        }, this);

        this.trainingStep = 1;
        

        this.createExplosions();

        this.explosions = this.add.group({
            defaultKey: 'kaboom',
            maxSize: 20,
            active: false
        });

        this.secondStageDirection = this.add.text(500, 100, 'Go to the BLUE ZONE', {
            color: "white",
            fontSize: 40,
            fontFamily: 'Rubik', 
        });
        this.secondStageDirection.setOrigin(0.5);
        this.secondStageDirection.visible = false;

        this.correctSecondStageState = 0;

        this.nCorrect = 0;
        this.trainingInstructions = true;

        
        this.nextStep();
        // this.startDecisionPhase();

    }

    start() {
        this.nextStep();
    }

    nextStep() {
        // c = 30;
        if (this.trainingStep == 1) {
            this.textBox.setText('Hello there! We need your help shipping supplies to a base on a nearby planet');
        }
        else if (this.trainingStep == 2) {
            this.textBox.setText('First, we need to teach you your way around space');
        }
        else if (this.trainingStep == 3) {
            this.textBox.setText('You have a choice of 4 different spaceships to use for transporting supplies');
            this.showShips([0, 1, 2, 3]);
        }
        else if (this.trainingStep == 4) {
            this.textBox.setText('Two of these ships will travel through the ' + this.game.config.secondStateNames[0]  + ' asteroid zone');
            this.hideShips();
            this.showShips([0, 3]);
        }
        else if (this.trainingStep == 5) {
            this.textBox.setText('Two of these ships will travel through the ' + this.game.config.secondStateNames[0]  + ' asteroid zone');
            this.hideShips();
            this.ships[0].setHorizontal();
            this.ships[0].setThrust(true);
            this.showShips([0]);

            this.showZone(0);
        }
        else if (this.trainingStep == 6) {
            this.textBox.setText('The other two will travel through the ' + this.game.config.secondStateNames[1]  + ' asteroid zone');
            this.hideZones();
            this.hideShips();
            this.showShips([1, 2]);
        }
        else if (this.trainingStep == 7) {
            this.textBox.setText('The other two will travel through the ' + this.game.config.secondStateNames[1]  + ' asteroid zone');
            this.hideShips();
            this.ships[2].setHorizontal();
            this.ships[2].setThrust(true);
            this.setShipPos(2, 200, 300);
            this.showShips([2]);

            this.showZone(1);
        }
        else if (this.trainingStep == 8) {
            this.textBox.setText('Each asteroid zone has a chance of hitting your ship with asteroids');
            var asteroidEvent1 = this.time.addEvent({
                delay: 2000,
                callback: function() {
                    this.createAsteroids(300, 5);
                },
                callbackScope: this
            })
        }
        else if (this.trainingStep == 9) {
            this.textBox.setText('If you get hit by too many asteroids, your supplies will be damaged');
        }
        else if (this.trainingStep == 10) {
            this.textBox.setText('You can see how well-supplied the base is by looking at the bar underneath the planet');
            this.showUI();
            this.movePlanetUIRight();
        }
        else if (this.trainingStep == 11) {
            this.textBox.setText("If you don't get enough supplies to the planet, they will run out!");
            this.planetHealth = 0.1;
            this.updateHealthBar();
        }
        else if (this.trainingStep == 12) {
            this.textBox.setText("To be successful, you will need to learn which asteroid zone is safest and choose the right ship");
            this.planetHealth = 0.9;
            this.updateHealthBar();
        }
        else if (this.trainingStep == 13) {
            this.textBox.setText("To be successful, you will need to learn which asteroid zone is safest and choose the right ship");
            this.hideUI();
            this.hideShips();
            this.hideZones();
            this.ships.forEach(i => i.setThrust(false));
            this.ships.forEach(i => i.setVertical());
            this.setShipPos(0, this.xPositions[0], 300);
            this.setShipPos(3, this.xPositions[1], 300);
            this.showShips([0, 3]);
        }
        else if (this.trainingStep == 14) {
            this.textBox.setText("You'll need to learn which ship travels in which asteroid zone before you can start flying");
        }
        else if (this.trainingStep == 15) {
            this.textBox.setText("Try choosing the ship that you think goes to the asteroid zone at the top of the screen");
            this.secondStageDirection.visible = true;
        }
        else if (this.trainingStep == 16) {
            this.textBox.setText("Use the LEFT ARROW key to select the ship on the left, and the RIGHT ARROW to select the one on the right");
        }
        else if (this.trainingStep == 17) {
            this.textBox.setText("This will repeat until you're getting most of the answers right");
        }
        else if (this.trainingStep == 18) {
            this.trainingInstructions = false;
            this.UIMoveEvent = this.time.addEvent({
                delay:10,
                callback: function() {
                    this.astronaut.x -= 10;
                    this.textBox.x -= 10;
                    if (this.textBox.x < -400) {
                        this.UIMoveEvent.remove();
                        this.startDecisionPhase();
                    }
                },
                callbackScope: this,
                loop: true
            })
        }
        
        else if (this.trainingStep == 19) {
            this.astronaut.x = 100;
            this.textBox.x = 380;
            this.textBox.setText("Well done! Looks like you're ready to go");
        }
        else if (this.trainingStep == 20) {
            this.textBox.setText("Remember, head for the asteroid zone that you think is safest!");
        }
        else if (this.trainingStep == 21) {
            this.scene.start('GameScene');
        }

        
    }

    startDecisionPhase() {

        this.hideShips();

        this.correctSecondStageState = Phaser.Math.Between(0, 1);

        this.secondStageDirection.text = 'Go to the ' + this.game.config.secondStateNames[this.correctSecondStageState] + ' ZONE';
        this.secondStageDirection.visible = true;

        if (typeof this.bgDownEvent != 'undefined') {
            this.bgDownEvent.remove();
        }
        if (typeof this.bgUpEvent != 'undefined') {
            this.bgUpEvent.remove();
        }


        this.shiftBackground('up');

        this.currentTime = this.decisionTime;
        this.updateTrialCount();
        this.tooSlowText.visible = false;

        var indicator_x_order = Phaser.Math.Between(0, 1);

        if (this.cache.json.get('trial_info')[this.registry.values.trial].state1 == 1) {
            var ship_idx = [0, 1];
        }
        else {
            var ship_idx = [2, 3];
        }

        var ship_pos = [...this.xPositions];
        if (indicator_x_order == 1) {
            ship_pos.reverse();
        }

        this.shipID = {
            left: ship_idx[indicator_x_order],
            right: ship_idx[1 - indicator_x_order],
        }


        this.startCountdown();

        this.showShips(ship_idx);
        this.setShipPos(ship_idx[0], ship_pos[0], 300);
        this.setShipPos(ship_idx[1], ship_pos[1], 300);
        ship_idx.forEach(i => this.ships[i].setThrust(false));

        this.visible_ships = ship_idx;

        
        this.hideSelectionBoxes();

        this.selectionActive = true;

        

    }

    endDecisionPhase() {
        this.currentState = 'outcome';

        this.countdownEvent.destroy();
        this.countdownText.visible = false;

        this.phaseStarted = false;

        this.registry.values.trial += 1;

        this.shiftBackground('down');

    }

    startOutcomePhase() {

        this.selectionBoxes.left.visible = false;
        this.selectionBoxes.right.visible = false;
        
        if (this.selectedShip == 0 | this.selectedShip == 3) {
            this.secondStageState = 0;
        }
        else {
            this.secondStageState = 1;
        }

        // console.log(this.selectedShip);
        // console.log(this.secondStageState );
        // console.log(this.correctSecondStageState);
        if (this.secondStageState == this.correctSecondStageState) {
            var correct = true;
            this.nCorrect += 1;
        }
        else {
            var correct = false;
            this.nCorrect = 0;
        }

        this.showZone(this.secondStageState);

        this.hideShips();
        this.showShips([this.selectedShip]);
        this.ships[this.selectedShip].setThrust(true)
        this.ships[this.selectedShip].setHorizontal(true)

        this.setShipPos(this.selectedShip, 200, 300);

    
        var outcomeEvent = this.time.addEvent({
            delay: this.asteroidTimes[0],
            callback: function() {
                if (correct) {
                    this.secondStageDirection.text = 'Correct!';
                }
                else {
                    this.secondStageDirection.text = 'Incorrect!';
                }
            },
            callbackScope: this
        })
        

        var end = this.time.addEvent({
            delay: 3000,
            callback: function() {
                this.endOutcomePhase();
            },
            callbackScope: this
            }
        )
    }

    endOutcomePhase() {

        this.ships.forEach(i => i.setThrust(false));
        this.ships.forEach(i => i.setVertical());

        this.hideShips();
        this.hideZones();
        this.outcomeText.visible = false;

        if (this.game.config.testing) {
            var correctThreshold = 0;
        }
        else {
            var correctThreshold = 8;
        }

        if (this.nCorrect >= correctThreshold) {
            this.trainingInstructions = true;
            this.trainingStep = 19;
            this.nextStep();
        }
        else {
            this.game.registry.set('trial', 0);
            this.startDecisionPhase();
        }
        

    }


    update() {

    }

    

    createTrainingText() {

        this.astronaut = this.add.image(100, 500, 'astronaut');
        this.astronaut.setScale(0.2);

        this.textBox = new TextBox(this, 380, 450, 400, 100);

    }

}

export default TrainingScene;