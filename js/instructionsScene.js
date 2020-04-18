export class InstructionsScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'instructionsScene'
        });
    }
    
    preload() {
        this.load.image('instruction_background', 'assets/instruction_background.png');
        this.load.image('back_button', 'assets/back_button.png');
    }

    create() {
        this.add.image(400, 300, 'instruction_background');

        var backButton = this.add.image(400, 550, 'back_button');
        backButton.setInteractive({
            useHandCursor: true
        }).on('pointerdown', this.clickBackButton, this);
    }

    clickBackButton() {
        this.scene.switch('titleScene');
    }

}
