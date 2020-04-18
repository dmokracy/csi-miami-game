export class ShopScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'shopScene'
        });
    }
    
    preload() {
        this.load.image('done_button', 'assets/done_button.png');
    }

    create() {
        // Add background elements
        this.add.image(400, 300, 'battleground');

        var instructionsText = this.add.text(100, 200,
            "SHOP",
            { fill: 'yellow' });

        var doneButton = this.add.image(400, 500, 'done_button');
        doneButton.setInteractive({
            useHandCursor: true
        }).on('pointerdown', this.clickBackButton, this);
    }

    clickBackButton() {
        this.scene.switch('battleScene');
    }

}
