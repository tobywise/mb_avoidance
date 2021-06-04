class TextBox extends Phaser.GameObjects.Container {
    constructor(scene, x, y, w, h) {

        var buttonBackground = scene.add.rectangle(0, 0, w, h, "0xe8e8e8");
        var buttonText = scene.add.text(0, 0, 'text', {
            color: '0xff0000', 
            fontFamily: 'Rubik', 
            fontSize: h / 5,
            wordWrap: { width: w * 0.95}});

        var underText = scene.add.text(0 - (w / 2), h / 2 + 10, 'Press the B key to continue', {
            color: "white",
            fontSize: h / 6,
            fontFamily: 'Rubik', 
        });
        underText.setOrigin(0.);

        buttonText.setOrigin(0.5);

        super(scene, x, y, [buttonBackground, buttonText, underText]);
        scene.add.existing(this);

        this.buttonBackground = this.list[0];
        this.buttonText = this.list[1];

        // this.buttonBackground.on('pointerdown', () => {console.log('dffff')});

    }

    setText(text) {
        this.buttonText.text = text;
    }

    // setOnClick(f) {
    //     this.buttonBackground.on('pointerdown', () => {f()});
    // }

}

export default TextBox;
