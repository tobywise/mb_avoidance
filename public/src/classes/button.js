class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, w, h) {

        var buttonBackground = scene.add.rectangle(0, 0, w, h, "0xe8e8e8");
        var buttonText = scene.add.text(0, 0, 'text', {color: '0xff0000', fontFamily: 'Rubik', fontSize: h / 2});
        buttonBackground.setInteractive();
        buttonText.setOrigin(0.5);
        // var children = [buttonBackground, buttonText];

        super(scene, x, y, [buttonBackground, buttonText]);
        scene.add.existing(this);

        this.buttonBackground = this.list[0];
        this.buttonText = this.list[1];

        this.buttonBackground.on('pointerover', () => { this.buttonBackground.setFillStyle('0x03a5fc'); });
        this.buttonBackground.on('pointerout', () => { this.buttonBackground.setFillStyle('0xe8e8e8'); });

        // this.buttonBackground.on('pointerdown', () => {console.log('dffff')});

    }

    setText(text) {
        this.buttonText.text = text;
    }

    // setOnClick(f) {
    //     this.buttonBackground.on('pointerdown', () => {f()});
    // }

}

export default Button;
