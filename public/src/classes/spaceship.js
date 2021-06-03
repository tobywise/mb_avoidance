class SpaceShip extends Phaser.GameObjects.Container {
    constructor(scene, x, y, children) {

        super(scene, x, y, children);
        scene.add.existing(this);

        this.ship = this.list[1];
        this.label = this.list[2];
        this.thrust = this.list[0];
        console.log(this.scene);
        // this.thrust.visible = false;

        this.horizontal = false;
        this.thrustOn = false;
        this.moving = false;
        this.labelVisible = false;

    }


    setHorizontal() {
        this.ship.setRotation(Phaser.Math.DegToRad(0));
        this.thrust.setRotation(Phaser.Math.DegToRad(270));

        this.thrust.x = -80;
        this.thrust.y = 0;
    }

    setVertical() {
        this.ship.setRotation(Phaser.Math.DegToRad(270));
        this.thrust.setRotation(Phaser.Math.DegToRad(180));

        this.thrust.x = 0;
        this.thrust.y = 80;

    }

    setThrust(setting) {

        this.thrust.visible = setting;

        this.setMoving(setting);

    }

    setMoving(setting) {

        if (!this.moving) {
            if (setting) {
                this.moving = true;
                this.movingEvent = this.scene.time.addEvent( {
                    delay: 50,
                    callback: function() {
                        this.y += Phaser.Math.Between(-2, 2);
                        this.x += Phaser.Math.Between(-2, 2);
                    },
                    callbackScope: this,
                    loop: true
                });
            }
        }
        else if (setting == false & typeof this.movingEvent !== 'undefined'){        

            this.movingEvent.remove();
            this.moving = false;
        }

    }

    showLabel(setting) {
        this.label.visible = setting;
    }


}

export default SpaceShip;
