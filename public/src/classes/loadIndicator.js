class loadIndicator extends Phaser.GameObjects.Container {
    constructor(scene, x, y, children) {

        super(scene, x, y, children);
        scene.add.existing(this);

        this.currentLoad = 0;
        this.maxLoad = 10;

        this.plusButton = this.list.slice(-6)[0];
        this.minusButton = this.list.slice(-6)[1];

        this.plusSign = this.list.slice(-6)[2];
        this.minusSign = this.list.slice(-6)[3];

        this.spentText = this.list.slice(-6)[4];
        this.gainedText = this.list.slice(-6)[5];

        this.spent = 0;
        this.gained = 0;


        this.bg = this.list[0];
        this.barBg = this.list[1];


        this.plusButton.on('pointerover', () => { this.plusButton.setTexture('plusHover'); });
        this.minusButton.on('pointerover', () => { this.minusButton.setTexture('minusHover'); });

        this.plusButton.on('pointerout', () => { this.plusButton.setTexture('plus'); });
        this.minusButton.on('pointerout', () => { this.minusButton.setTexture('minus'); });

        this.plusButton.on('pointerdown', () => {this.increaseLoad(); this.plusButton.setTexture('plusPressed');});
        this.minusButton.on('pointerdown', () => {this.decreaseLoad(); this.minusButton.setTexture('minusPressed');});

        this.displayLoad();

        this.damageFlashOn = false;

    }

    increaseLoad() {

        if (this.currentLoad < this.maxLoad) {
            this.currentLoad += 1;
        }

        // console.log(this.currentLoad);

        this.displayLoad();

    }

    decreaseLoad() {
        if (this.currentLoad > 0) {
            this.currentLoad -= 1;
        }

        this.displayLoad();
    }

    displayLoad() {

        for (var i=0; i<this.maxLoad; i++) {
            
            if (i < this.currentLoad) {
                this.list[this.maxLoad - (i - 1)].setStrokeStyle(10, '0x0078e8', 1);
            }

            else {
                this.list[this.maxLoad - (i - 1)].setStrokeStyle(10, '0xe8e8e8', 1)
            }
        }
    }

    showOnlyBars() {
        this.visible = true;
        this.bg.visible = false;
        // this.barBg.visible = false;
        this.plusButton.visible = false;
        this.minusButton.visible = false;
        this.plusSign.visible = false;
        this.minusSign.visible = false;

    }

    showAll() {
        this.visible = true;
        this.bg.visible = true;
        // this.barBg.visible = true;
        this.plusButton.visible = true;
        this.minusButton.visible = true;
        // this.plusSign.visible = true;
        // this.minusSign.visible = true;
    }

    showDamageBars(n) {

        for (var i=0; i<n; i++) {
            
            if ((this.maxLoad - i) <= this.currentLoad) {
                this.list[i + 2].setStrokeStyle(10, '0x961c00', 1);
            }
            else {
                this.list[i + 2].setStrokeStyle(10, '0xff8400', 1);
            }
        }
    }

    flashDamageBars(n) {

        this.damageFlashEvent = this.scene.time.addEvent({
            delay: 200,
            callback: function() {
                if (this.damageFlashOn) {
                    this.showDamageBars(n);
                    this.damageFlashOn = false;
                }
                else {
                    this.displayLoad(n);
                    this.damageFlashOn = true;
                }
            },
            callbackScope: this,
            loop: true
        })
    }

    stopFlashDamageBars() {
        this.damageFlashEvent.remove();
    }

    calculateOutcome(n) {

        this.spent = this.currentLoad;
        var lost = this.spent - (this.maxLoad - n);

        if (lost < 0) {
            lost = 0;
        }
        this.gained = this.spent - lost;

        this.gained *= 15;
        this.spent *= 10;

        this.gainedText.text = '+' + this.gained;
        this.spentText.text = '-' + this.spent;

        return this.gained - this.spent;

    }

    showOutcome(setting) {
        this.spentText.visible = setting;
        this.gainedText.visible = setting;


    }

}

export default loadIndicator;
