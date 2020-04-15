export class InstructionsScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'instructionsScene'
        });
    }
    
    preload() {
        this.load.image('title_background', 'assets/title_background.png');
        this.load.image('back_button', 'assets/back_button.png');
    }

    create() {
        this.add.image(400, 300, 'title_background');

        var instructionsText = this.add.text(100, 200,
            "Stop these spring breaker degenerates from entering your city.\n" +
            "Enforce social distancing by clicking on them with your\n" +
            "teleporter gun to send them home.\n" +
            "Use the number keys to select other tools at your disposal.",
            { fill: 'yellow' });
        
        var backButton = this.add.image(400, 500, 'back_button');
        backButton.setInteractive({
            useHandCursor: true
        }).on('pointerdown', this.clickBackButton, this);
    }

    clickBackButton() {
        this.scene.switch('titleScene');
    }

}
