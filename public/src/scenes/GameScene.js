import loadIndicator from '../classes/loadIndicator.js';
import SpaceShip from '../classes/spaceship.js';
import Button from '../classes/button.js'

var explosions;
var asteroid_health_decrement
var sampleRate;


class GameScene extends Phaser.Scene {

    constructor(key) {

        super({
            key: key,
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false,
                    gravity: { y: 0 },
                    setBounds: true,
                    width: 1000,
                    height: 600,
                    x: 0,
                    y: 0,
                    checkCollision: {
                        up: true,
                        down: true,
                        left: true,
                        right: true
                    }
                }
            },
        });
    }


    init(data) {

        this.n_slots = 10;
        this.slot_spacing = 20;
        this.slot_width = 60;
        this.slot_height = 5;
        this.button_size = 80;
        this.decisionTime = 5;
        this.asteroidSpeed = 1000;
        this.asteroidTimes = [250, 1500];
        this.outcomeDelay = 2000;
        this.outcomeFlashDuration = 1000;
        this.outcomePhaseDuration = 6000;

        this.loadIndicator1_pos = [200, 400];
        this.loadIndicator2_pos = [800, 400];

        this.yPositions = [150, 450];
        this.xPositions = [200, 800];

        this.currentState = 'decision';


    }

    

    preload() {

        // Trial info
        this.load.json('trial_info', './src/trial_info4.json');

        // Images

        // Ship
        // this.load.image('ship', './assets/thrust_ship.png');

        this.load.image('Green ship', './assets/greenShip.png');
        this.load.image('Red ship', './assets/redShip.png');
        this.load.image('Orange ship', './assets/orangeShip.png');
        this.load.image('Pink ship', './assets/pinkShip.png');

        this.load.image('fire', './assets/flame2.png');

        // // Background
        this.load.image('space', './assets/space3.jpg')
        // // Asteroids
        this.load.image('ast1', './assets/asteroid1.png');
        this.load.image('ast2', './assets/asteroid2.png');
        this.load.image('ast3', './assets/asteroid3.png');
        this.asteroid_textures = ['ast1', 'ast2', 'ast3']

        this.load.image('indicatorBackground', './assets/loadIndicatorBackground.png');

        this.load.image('minus', './assets/minusButton.png');
        this.load.image('minusHover', './assets/minusButtonHover.png');
        this.load.image('minusPressed', './assets/minusButtonPressed.png');

        this.load.image('plus', './assets/plusButton.png');
        this.load.image('plusHover', './assets/plusButtonHover.png');
        this.load.image('plusPressed', './assets/plsuButtonPressed.png');

        // PLANET
        this.load.image('planet', './assets/planet.png');

        // Explosion
        this.load.spritesheet('kaboom', './assets/explode.png', {
            frameWidth: 128,
            frameHeight: 128
        });

    }

    create() {

        // Keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.selectionActive = false;

        // Score
        this.registry.values.trial = this.game.registry.values.trial;

        // Trial info

        this.createExplosions();

        this.bgImg = this.add.image(400, 100, 'space');
        this.bgImg.setScale(0.5);
        this.bgImg.alpha = 0.5;
        this.bgPos = 'up';

        this.boxes = this.createZones();

        this.loadIndicators = [];
        
        this.createLoadIndicator(this.loadIndicator1_pos[0], this.loadIndicator1_pos[1], 'indicator_1');
        this.createLoadIndicator(this.loadIndicator2_pos[0], this.loadIndicator2_pos[1], 'indicator_2');

        this.createLoadIndicator(this.loadIndicator1_pos[0], this.loadIndicator1_pos[1], 'indicator_3');
        this.createLoadIndicator(this.loadIndicator2_pos[0], this.loadIndicator2_pos[1], 'indicator_4');

        this.hideIndicators();

        this.ships = [];
        this.game.config.shipNames.forEach(i => this.createShip(i));
        this.hideShips();
        this.createCountdown();
        
        this.createUI();

        this.outcomeText = this.add.text(800, 300, '-50%', {color: '#ffbd54', font: '50px Rubik'});
        this.outcomeText.setOrigin(0.5);
        this.outcomeText.visible = false;

        // Add horizontal bar
        this.horizontalBar = this.add.line(500, 300, 0, 0, 1000, 0, "0xe8e8e8");

        this.countdownText.visible = false;

        // this.shiftBackground('up');
        // this.topAsteroids = this.createAsteroids(100, 5);
        
        this.hideZones();

        this.phaseStarted = false;

        // this.OKButton = new Button(this, 500, 490, 130, 100);
        // this.OKButton.setText('OK');
        // this.OKButton.visible = false;
        // this.OKButton.buttonBackground.on('pointerdown', () => {this.endDecisionPhase()});
        
        this.tooSlowText = this.add.text(500, 400, 'Too slow!', {color: 'red', fontFamily: 'Rubik', fontSize: 30});
        this.tooSlowText.setOrigin(0.5);
        this.tooSlowText.visible = false;

        this.scoreText.text = 'Score: ' + this.registry.get('score');
        this.scoreText.visible = false;

        this.createSelectionBoxes();

        this.planetHealth = 0.8;
        this.updateHealthBar();

        this.n_trials = Object.keys(this.cache.json.get('trial_info')).length;
        this.updateTrialCount();

        this.start();
    }

    start() {
        this.startDecisionPhase();
    }

    // Update - runs constantly
    update() {

        // if (!this.phaseStarted) {
        //     this.startDecisionPhase();
        //     this.phaseStarted= true;
        // }
        
        // if (!this.phaseStarted & this.currentState == 'decision') {
        //     this.startDecisionPhase();
        //     this.phaseStarted = true;
        // }

        // else if (!this.phaseStarted & this.currentState == 'outcome') {
        //     // this.startDecisionPhase();
        //     // this.phaseStarted = true;
        // }

    }

    createExplosions() {
        // Add explosions, from here https://github.com/robhimslf/game-dev-invaders
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers( 'kaboom', {
                start: 0,
                end: 15
            }),
            frameRate: 16,
            repeat: 0,
            hideOnComplete: true
        });
    }

    startDecisionPhase() {

        this.selectionActive = true;
        

        this.explosions = this.add.group({
            defaultKey: 'kaboom',
            maxSize: 20,
            active: false
        });

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

        this.showZone(this.secondStageState);

        this.hideShips();
        this.showShips([this.selectedShip]);
        this.ships[this.selectedShip].setThrust(true)
        this.ships[this.selectedShip].setHorizontal(true)

        this.setShipPos(this.selectedShip, 200, 300);
        console.log(this.registry.values.trial);
        var thisTrialInfo = this.cache.json.get('trial_info')[this.registry.values.trial];

        // OUTCOMES
        if (this.secondStageState == 0) {
            var outcome = thisTrialInfo.state1_outcome;
        }
        else {
            var outcome = thisTrialInfo.state2_outcome;
        }

        this.outcome = outcome;
    
        var asteroidEvent1 = this.time.addEvent({
            delay: this.asteroidTimes[0],
            callback: function() {
                this.createAsteroids(300, parseInt(outcome   / 10));
            },
            callbackScope: this
        })
        

        var outcomeEvent1 = this.time.addEvent({
            delay: this.asteroidTimes[0] + this.outcomeDelay,
            callback: function() {
                this.outcomeText.text = '-' + outcome + '%';
                this.outcomeText.visible = true;

                var gain = 0.28 * (1- (outcome / 100));
                var loss = -0.2;
                
                var change = gain + loss

                if (change < 0) {
                    change = change * 2;
                }
                
                this.planetHealth += change

                if (this.planetHealth > 1) {
                    this.planetHealth = 1;
                }

                this.updateHealthBar();


            },
            callbackScope: this
        })

        var end = this.time.addEvent({
            delay: this.game.config.outcome_duration ,
            callback: function() {
                this.endOutcomePhase();
            },
            callbackScope: this
            }
        )
    }

    endOutcomePhase() {

        // DATA
        var trialData = {
            trial: this.registry.values.trial,
            state1: this.cache.json.get('trial_info')[this.registry.values.trial].state1 + 1,
            choice1: this.selectedShip + 1,
            state2: this.secondStageState + 1,
            points: this.outcome,
            health: this.planetHealth
        }

        this.game.registry.values.data[this.registry.values.trial] = trialData;

        if (this.registry.values.trial % 10 == 2) {
            this.saveData();
        }

        this.ships.forEach(i => i.setThrust(false));
        this.ships.forEach(i => i.setVertical());

        this.hideShips();
        this.hideZones();
        this.outcomeText.visible = false;

        this.registry.values.trial += 1;

        if (this.planetHealth <= 0) {
            this.scene.start('GameOver');
        }

        
        if (this.registry.values.trial == 2 & this.game.config.testing) {
            this.saveData();
            this.scene.start('EndScene');
        }
        else if (this.registry.values.trial == this.n_trials) {
            this.saveData();
            this.scene.start('EndScene');
        }
        else {
            this.startDecisionPhase();
        }

    }

    saveData() {

        var docRef = this.game.config.db.collection("spaceship_MB").doc(this.game.config.studyID).collection('subjects').doc(this.game.config.uid);

        docRef.update({
            trial_data: this.game.registry.values.data
        })
    }

    createSelectionBoxes() {

        var leftBox = this.add.rectangle(this.xPositions[0], 300, 250, 250, "0x1c1c1c");
        leftBox.setFillStyle("0xffffff", 0.1);
        leftBox.setStrokeStyle(2, "0xffffff");


        var rightBox = this.add.rectangle(this.xPositions[1], 300, 250, 250,"0x1c1c1c");
        rightBox.setFillStyle("0xffffff", 0.1);
        rightBox.setStrokeStyle(2, "0xffffff");

        rightBox.visible = false;
        leftBox.visible = false;

        this.selectionBoxes = {
            left: leftBox, 
            right: rightBox
        }

        this.cursors.left.on('down', function() { 
            if (this.selectionActive) {
                this.selectionBoxes.left.visible = true; 
                this.selectionActive = false;
                this.selectedShip = this.shipID.left;
                this.time.addEvent({
                    delay: this.outcomePhaseDelay,
                    callback: function() {
                        this.endDecisionPhase();
                    },
                    callbackScope: this
                })
            }
        }, this);

        this.cursors.right.on('down', function() { 
            if (this.selectionActive) {
                this.selectionBoxes.right.visible = true; 
                this.selectionActive = false;
                this.selectedShip = this.shipID.right;
                this.time.addEvent({
                    delay: this.outcomePhaseDelay,
                    callback: function() {
                        this.endDecisionPhase();
                    },
                    callbackScope: this
                })
            }
        }, this);

    }

    hideSelectionBoxes() {
        this.selectionBoxes.right.visible = false;
        this.selectionBoxes.left.visible = false;
    }

    createZones() {

        // Add coloured boxes
        if (this.game.config.secondStateOrder == 1) {
            var boxA = this.add.rectangle(0, 0, 1000, 600, '0xffdd00');
            var boxB = this.add.rectangle(0, 0, 1000, 600, '0x00aeff');
        }
        else {
            var boxB = this.add.rectangle(0, 0, 1000, 600, '0xffdd00');
            var boxA = this.add.rectangle(0, 0, 1000, 600, '0x00aeff');
        }
        
        boxA.alpha = 0.2;
        boxB.alpha = 0.2;

        // Zone labels
        if (this.game.config.secondStateOrder == 1) {
            var ZoneALabel = this.add.text(-490, -250, 'Yellow zone', {color: '#ffdd00', font: '20px Rubik'});
            var ZoneBLabel = this.add.text(-490, -250, 'Blue zone', {color: '#00aeff', font: '20px Rubik'});
        }
        else {
            var ZoneBLabel = this.add.text(-490, -250, 'Yellow zone', {color: '#ffdd00', font: '20px Rubik'});
            var ZoneALabel = this.add.text(-490, -250, 'Blue zone', {color: '#00aeff', font: '20px Rubik'});
        }

        // Containers
        var boxAGroup = new Phaser.GameObjects.Container(this, 500, 300, [boxA, ZoneALabel]);
        var boxBGroup = new Phaser.GameObjects.Container(this, 500, 300, [boxB, ZoneBLabel]);

        this.add.existing(boxAGroup);
        this.add.existing(boxBGroup);

        var boxes = [boxAGroup, boxBGroup];

        return boxes;
    }

    hideZones() {

        this.boxes.forEach(i => i.visible = false);
        this.horizontalBar.visible = false;

    }

    showZones() {
        this.boxes.forEach(i => i.visible = true);
        this.horizontalBar.visible = true;
    }

    showZone(i) {
        this.boxes[i].visible = true;
    }

    createAsteroids(y, n) {

        // Add asteroids
        var asteroidGroup = this.physics.add.group({
            key: 'asteroid',
            repeat: n - 1,
            setXY: { x: 1700, y: y, stepY: 120 / n},
            setVelocityX: 0
        });

        // Set texture of the asteroids
        asteroidGroup.children.iterate(function (child) {
            child.setTexture(this.asteroid_textures[Phaser.Math.Between(0, 2)]);
            child.x = Phaser.Math.Between(1200, 1800);
            child.setVelocityX(-this.asteroidSpeed);
        }, this);

        asteroidGroup.depth = 0;

        var asteroidChecker = this.time.addEvent({
            delay:50,
            callback: function() {
                asteroidGroup.children.iterate(function (child) {
                    if (typeof child !== 'undefined') {
                        if (child.x < 200) {                       
                            var explosion = this.explosions.get();
                            explosion.setScale(0.6, 0.6);
                            explosion.setOrigin( 0.8, 0.5 );
                            explosion.x = child.x;
                            explosion.y = child.y;;
                            explosion.play('explode');
                            child.destroy();
                        }

                    }
                }, this);
                if (asteroidGroup.children.entries.length == 0) {
                    asteroidChecker.remove();
                }
            },
            callbackScope: this,
            loop: true

        })

        return this;

    }

    shiftBackground(position) {

        if (position == 'up' & this.bgPos != 'up') {

            this.bgUpEvent = this.time.addEvent({
                delay: 50,
                callback: function() {
                    this.bgPos = 'up';
                    this.bgImg.y -= 10;
                    if (this.bgImg.y <= 100) {
                        this.bgUpEvent.remove();
                    }
                },
                callbackScope: this,
                loop: true
            })

        }

        if (position == 'down' & this.bgPos != 'down') {

            this.bgDownEvent = this.time.addEvent({
                delay: 10,
                callback: function() {
                    this.bgPos = 'down';
                    this.bgImg.y += 2;
                    // console.log(this.bgDownEvent);
                    // console.log(this.bgImg.y);
                    if (this.bgImg.y >= 200) {
                        // console.log('aaa');
                        this.bgDownEvent.remove();
                        this.startOutcomePhase();
                    }
                },
                callbackScope: this,
                loop: true
            })

        }

    }

    createLoadIndicator(x, y, name) {

        let shapes = [];

        var bg = this.add.sprite(0, 0, 'indicatorBackground')
        bg.setScale(0.65);
        shapes.push(bg);

        var barsBg = this.add.rectangle(-40, 20, this.slot_width + 20, (this.n_slots * this.slot_spacing) + 20,"0x1c1c1c")
        shapes.push(barsBg);
        
        for (var i=0; i < this.n_slots; i++) {
            var ypos = -((this.n_slots * this.slot_spacing) / 2) + (this.slot_spacing * i + 30)
            var l = this.add.line(-40, ypos, 0, 0, this.slot_width, 0, "0xe8e8e8")
            l.setLineWidth(this.slot_height, this.slot_height);
            shapes.push(l);
        }

        // var plusButton = this.add.rectangle(this.slot_width / 2 + 30, -30, this.button_size, this.button_size, "0xe8e8e8");
        // var minusButton = this.add.rectangle(this.slot_width / 2 + 30, this.button_size, this.button_size, this.button_size, "0xe8e8e8");
        
        var minusButton = this.add.sprite(this.slot_width / 2 + 30, this.button_size, 'minus');
        var plusButton = this.add.sprite(this.slot_width / 2 + 30, -30, 'plus');

        plusButton.setInteractive();
        minusButton.setInteractive();
        
        shapes.push(plusButton);
        shapes.push(minusButton);

        var plusText = this.add.text(plusButton.x - 35, plusButton.y - 50, '+', {color: '0xff0000', fontSize: this.button_size * 1.5});
        var minusText = this.add.text(minusButton.x - 35, minusButton.y - 50, '-', {color: '0xff0000', fontSize: this.button_size * 1.5});

        plusText.visible = false;
        minusText.visible = false;

        shapes.push(plusText);
        shapes.push(minusText);
        
        var spentText = this.add.text(plusButton.x - 35, minusButton.y - 50, '-150', {color: '#ffbd54', font: '50px Rubik'});
        var gainedText = this.add.text(minusButton.x - 35, plusButton.y - 20, '+100', {color: '#54d1ff', font: '50px Rubik'});
        
        shapes.push(spentText);
        shapes.push(gainedText);

        var indicator = new loadIndicator(this, x, y, shapes);
        indicator.maxLoad = this.n_slots;
        indicator.name = name;
        this.loadIndicators.push(indicator);

    }

    createShip(name) {

        var ship = this.add.sprite(0, 0, name).setOrigin(0.5).setRotation(4.71).setScale(0.5);
        var thrust = this.add.sprite(0, 80, 'fire').setRotation(Phaser.Math.DegToRad(180));
        var label = this.add.text(0, -70, name, {color: 'white', fontFamily: 'Rubik', fontSize: 30}).setOrigin(0.5);
        

        var shipGroup = new SpaceShip(this, 200, 200, [thrust, ship, label]);
        shipGroup.name = name;
        this.ships.push(shipGroup);

    }

    hideShips() {
        this.ships.forEach(i => i.visible = false);
    }

    showShips(idx) {
        idx.forEach(i => this.ships[i].visible = true);
    }

    hideIndicators() {
        this.loadIndicators.forEach(i => i.visible = false);
    }

    showIndicators(idx) {
        idx.forEach(i => this.loadIndicators[i].showAll());
    }

    setShipPos(i, x, y) {
        this.ships[i].x = x;
        this.ships[i].y = y;
    }

    setIndicatorPos(i, x, y) {
        this.loadIndicators[i].x = x;
        this.loadIndicators[i].y = y;
    }

    createCountdown() {
        this.countdownText = this.add.text(500, 300, this.currentTime, {color: 'white', fontFamily: 'Rubik', fontSize: 80}).setOrigin(0.5);
    }

    startCountdown() {

        this.countdownText.visible = true;
        this.countdownText.text = this.currentTime;

        this.countdownEvent = this.time.addEvent({
            delay:1000,
            callback: function() {
                this.currentTime -= 1;
                this.countdownText.text = this.currentTime;
                
                if (this.currentTime == 0) {
                    this.countdownText.visible = false;
                    this.tooSlowText.visible = true;
                    this.selectionActive = false;
                    this.countdownEvent.remove();
                    this.restartTrial();
                }
    
            },
            callbackScope: this,
            loop: true
        })
    }

    restartTrial() {

        var restartEvent = this.time.addEvent({
            delay:2000,
            callback: function() {
                this.startDecisionPhase();
            },
            callbackScope: this
        })

    }

    createUI() {

        this.topBar = this.add.rectangle(0, 0, 1000, 30, "0x292929").setOrigin(0);
        this.scoreText = this.add.text(500, 15, 'Score: 3029', {color: 'white', font: '20px Rubik'}).setOrigin(0.5);
        this.registry.values.trialText = this.add.text(10, 5, '1 / 90', {color: 'white', font: '20px Rubik'}).setOrigin(0);

        this.planet = this.add.image(500, 500, 'planet');
        this.planet.setOrigin(0.5);
        this.planet.setScale(0.2);

        this.healthBarWidth = 250;    
        this.healthBackround = this.add.rectangle(500, 575, this.healthBarWidth, 25, "0x292929");

        this.healthBar = this.add.rectangle(500 - (this.healthBarWidth / 2), 575 - (25 / 2), this.healthBarWidth, 25, "0x4287f5");
        this.healthBar.setOrigin(0);

        this.healthBorder  = this.add.rectangle(500, 575, this.healthBarWidth, 25, "0x292929");
        this.healthBorder .setFillStyle("0xffffff", 0);
        this.healthBorder .setStrokeStyle(1, "0xffffff");
    }

    hideUI() {

        this.planet.visible = false;
        this.healthBackround.visible = false;
        this.healthBar.visible = false;
        this.healthBorder.visible = false;

    }

    showUI() {

        this.planet.visible = true;
        this.healthBackround.visible = true;
        this.healthBar.visible = true;
        this.healthBorder.visible = true;

    }

    movePlanetUIRight() {
        this.planet.x += 300;
        this.healthBackround.x += 300;
        this.healthBar.x += 300;
        this.healthBorder.x += 300;
    }

    updateHealthBar() {

        var currentHealth = this.planetHealth;
        if (currentHealth < 0) {
            currentHealth = 0;
        }

        if (currentHealth > 1) {
            currentHealth = 1;
        }
        this.healthBar.displayWidth = this.healthBarWidth * currentHealth;

        let c1 = Phaser.Display.Color.HexStringToColor('#ff7300');
        let c2 = Phaser.Display.Color.HexStringToColor('#4fcaff'); 

        var col = Phaser.Display.Color.Interpolate.ColorWithColor(c1, c2, 100, parseInt(currentHealth * 100));
        
        var newC = Phaser.Display.Color.GetColor(col.r, col.g, col.b);

        this.healthBar.setFillStyle(newC);

    }

    updateTrialCount() {

        this.registry.values.trialText.text = this.registry.values.trial + ' / ' + this.n_trials;
    }

}
export default GameScene;