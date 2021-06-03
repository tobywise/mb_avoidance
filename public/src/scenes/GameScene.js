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
        this.decisionTime = 7;
        this.asteroidSpeed = 1000;
        this.asteroidTimes = [250, 1500];
        this.outcomeDelay = 2000;
        this.outcomeFlashDuration = 1000;
        this.outcomePhaseDuration = 6000;

        this.loadIndicator1_pos = [200, 400];
        this.loadIndicator2_pos = [800, 400];

        this.shipNames = ['Green ship', 'Red ship', 'Pink ship', 'Orange ship'];

        this.yPositions = [150, 450];
        this.xPositions = [200, 800];

        this.currentState = 'decision';

        this.trial = 0;

        // this.cache.json.get('trial_info') = [
        //     {
        //         state1: 1,
        //         state1_outcome: 6,
        //         state2_outcome: 2
        //     }
        // ]

    }

    

    preload() {

        // Trial info
        this.load.json('trial_info', './src/trial_info.json');

        // Images

        // Ship
        this.load.image('ship', './assets/thrust_ship.png');
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

        // Explosion
        this.load.spritesheet('kaboom', './assets/explode.png', {
            frameWidth: 128,
            frameHeight: 128
        });

    }

    create() {

        // Score
        this.registry.set('score', 0);

        // Trial info
        console.log(this.trial_info);

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
        // this.showIndicators([1]);       

        // this.loadIndicators[1].showOnlyBars();

        // this.loadIndicators[1].flashDamageBars(4);
        // this.loadIndicators[1].stopFlashDamageBars();

        this.ships = [];
        this.shipNames.forEach(i => this.createShip(i));
        this.hideShips();
        // this.showShips([1, 2]);

        // this.ships[1].setHorizontal();
        // this.ships[2].setHorizontal();

        // this.setShipPos(2, 200, 500);


        // this.ships[1].setMoving(true);
        // this.ships[1].setMoving(true);
        // this.ships[2].setMoving(true);

        // this.ships[1].showLabel(true);

        this.createCountdown();
        
        this.createUI();


        // Add horizontal bar
        this.horizontalBar = this.add.line(500, 300, 0, 0, 1000, 0, "0xe8e8e8");

        this.countdownText.visible = false;

        // this.shiftBackground('up');
        // this.topAsteroids = this.createAsteroids(100, 5);
        
        this.hideZones();

        this.phaseStarted = false;

        this.OKButton = new Button(this, 500, 490, 130, 100);
        this.OKButton.setText('OK');
        this.OKButton.visible = false;
        this.OKButton.buttonBackground.on('pointerdown', () => {this.endDecisionPhase()});
        
        this.tooSlowText = this.add.text(500, 400, 'Too slow!', {color: 'red', fontFamily: 'Rubik', fontSize: 30});
        this.tooSlowText.setOrigin(0.5);
        this.tooSlowText.visible = false;

        this.scoreText.text = 'Score: ' + this.registry.get('score');

        this.startDecisionPhase();

    }

    // Update - runs constantly
    update() {
        
        // if (!this.phaseStarted & this.currentState == 'decision') {
        //     this.startDecisionPhase();
        //     this.phaseStarted = true;
        // }

        // else if (!this.phaseStarted & this.currentState == 'outcome') {
        //     // this.startDecisionPhase();
        //     // this.phaseStarted = true;
        // }

    }

    startDecisionPhase() {

        explosions = this.add.group({
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
        console.log(this.bgUpEvent);
        console.log(this.bgDownEvent);

        this.shiftBackground('up');

        console.log('starting');
        this.currentTime = this.decisionTime;
        this.updateTrialCount();
        this.tooSlowText.visible = false;
        this.OKButton.visible = true;
        // this.OKButton.setInteractive();

        var indicator_x_order = Phaser.Math.Between(0, 1);

        if (this.cache.json.get('trial_info')[this.trial].state1 == 1) {
            var indicator_idx = [0, 1];
        }
        else {
            var indicator_idx = [2, 3];
        }

        this.showIndicators(indicator_idx);


        var indicator_pos = this.xPositions;
        if (indicator_x_order == 1) {
            indicator_pos.reverse();
        }

        // indicator_idx.forEach(i => this.setIndicatorPos(i, 200, 200));
        this.setIndicatorPos(indicator_idx[0], indicator_pos[0], this.loadIndicator1_pos[1]);
        this.setIndicatorPos(indicator_idx[1], indicator_pos[1], this.loadIndicator2_pos[1]);
        indicator_idx.forEach(i => this.loadIndicators[i].showOutcome(false));
        indicator_idx.forEach(i => this.loadIndicators[i].displayLoad());

        this.startCountdown();

        this.showShips(indicator_idx);
        this.setShipPos(indicator_idx[0], indicator_pos[0], 150);
        this.setShipPos(indicator_idx[1], indicator_pos[1], 150);
        indicator_idx.forEach(i => this.ships[i].setThrust(false));

        this.visible_ships = indicator_idx;

    }

    endDecisionPhase() {
        this.currentState = 'outcome';
        console.log('ENDING');

        this.hideIndicators();
        this.countdownEvent.destroy();
        this.countdownText.visible = false;
        this.OKButton.visible = false;
        // this.hideShips();
        
        this.phaseStarted = false;

        this.trial += 1;

        // this.startOutcomePhase();

        this.shiftBackground('down');

    }

    startOutcomePhase() {
        

        var zone_order = Phaser.Math.Between(0, 1);
        var zone_ypos = [this.yPositions[0], this.yPositions[1]];
        if (zone_order == 1) {
            zone_ypos = zone_ypos.reverse();
        }

        this.boxes[0].y = zone_ypos[0];
        this.boxes[1].y = zone_ypos[1];

        this.showZones();

        this.visible_ships.forEach(i => this.ships[i].setThrust(true));
        this.visible_ships.forEach(i => this.ships[i].setHorizontal());
        // this.visible_ships.forEach(i => this.ships[i].setMoving(true));

        this.setShipPos(this.visible_ships[0], 200, zone_ypos[0]);
        this.setShipPos(this.visible_ships[1], 200, zone_ypos[1]);

        var thisTrialInfo = this.cache.json.get('trial_info')[this.trial];
        console.log(thisTrialInfo);

        var asteroidEvent1 = this.time.addEvent({
            delay: this.asteroidTimes[0],
            callback: function() {
                this.createAsteroids(zone_ypos[0], thisTrialInfo.state1_outcome);
            },
            callbackScope: this
        })
        
        var asteroidEvent2 = this.time.addEvent({
            delay: this.asteroidTimes[1],
            callback: function() {
                this.createAsteroids(zone_ypos[1], thisTrialInfo.state2_outcome);
            },
            callbackScope: this
        })


        // OUTCOMES
        var outcomeA = this.loadIndicators[0].calculateOutcome(thisTrialInfo.state1_outcome);
        var outcomeB = this.loadIndicators[1].calculateOutcome(thisTrialInfo.state2_outcome);

        this.registry.set('score', this.registry.get('score') + outcomeA + outcomeB);

        var outcomeEvent1 = this.time.addEvent({
            delay: this.asteroidTimes[0] + this.outcomeDelay,
            callback: function() {
                this.loadIndicators[0].x = 800;
                this.loadIndicators[0].y = zone_ypos[0] - 20;
                this.loadIndicators[0].showOnlyBars();
                this.loadIndicators[0].flashDamageBars(thisTrialInfo.state1_outcome);
            },
            callbackScope: this
        })

        var outcomeEvent2_stop = this.time.addEvent({
            delay: this.asteroidTimes[0] + this.outcomeDelay + this.outcomeFlashDuration,
            callback: function() {
                this.loadIndicators[0].showDamageBars(thisTrialInfo.state1_outcome)
                this.loadIndicators[0].stopFlashDamageBars();
                this.loadIndicators[0].showOutcome(true);
            },
            callbackScope: this
        })


        var outcomeEvent2 = this.time.addEvent({
            delay: this.asteroidTimes[1] + this.outcomeDelay,
            callback: function() {
                this.loadIndicators[1].x = 800;
                this.loadIndicators[1].y = zone_ypos[1] - 20;
                this.loadIndicators[1].showOnlyBars();
                this.loadIndicators[1].flashDamageBars(thisTrialInfo.state2_outcome);
            },
            callbackScope: this
        })

        var outcomeEvent2_stop = this.time.addEvent({
            delay: this.asteroidTimes[1] + this.outcomeDelay + this.outcomeFlashDuration,
            callback: function() {
                this.loadIndicators[1].showDamageBars(thisTrialInfo.state2_outcome)
                this.loadIndicators[1].stopFlashDamageBars();
                this.loadIndicators[1].showOutcome(true);
                this.scoreText.text = 'Score: ' + this.registry.get('score');
            },
            callbackScope: this
        })

        var end = this.time.addEvent({
            delay: this.outcomePhaseDuration,
            callback: function() {
                this.endOutcomePhase();
            },
            callbackScope: this
            }
        )
    }

    endOutcomePhase() {

        this.visible_ships.forEach(i => this.ships[i].setThrust(false));
        this.visible_ships.forEach(i => this.ships[i].setVertical());
        // this.visible_ships.forEach(i => this.ships[i].setMoving(false));

        this.visible_ships.forEach(i => this.loadIndicators[i].showAll());
        this.hideIndicators();
        this.hideShips();
        this.hideZones();

        this.startDecisionPhase();

    }

    createZones() {

        // Add coloured boxes
        var boxA = this.add.rectangle(0, 0, 1000, 300, '0xffdd00');
        boxA.alpha = 0.2;

        var boxB = this.add.rectangle(0, 0, 1000, 300, '0x00aeff');
        boxB.alpha = 0.2;

        // Zone labels
        var ZoneALabel = this.add.text(-490, -110, 'Yellow zone', {color: '#ffdd00', font: '20px Rubik'});
        var ZoneBLabel = this.add.text(-490, -110, 'Blue zone', {color: '#00aeff', font: '20px Rubik'});

        // Containers
        var boxAGroup = new Phaser.GameObjects.Container(this, 500, 150, [boxA, ZoneALabel]);
        var boxBGroup = new Phaser.GameObjects.Container(this, 500, 450, [boxB, ZoneBLabel]);

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
                            var explosion = explosions.get();
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

        console.log('SHIFT');

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

        var ship = this.add.sprite(0, 0, 'ship').setOrigin(0.5).setRotation(4.71).setScale(3);
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
                    this.OKButton.visible = false;
                    this.tooSlowText.visible = true;
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
        this.trialText = this.add.text(10, 5, '1 / 90', {color: 'white', font: '20px Rubik'}).setOrigin(0);

    }

    updateTrialCount() {

        this.trialText.text = this.trial + ' / 90';
    }

}
export default GameScene;