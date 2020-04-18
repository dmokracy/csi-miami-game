export class ShopScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'shopScene'
        });
    }
    
    preload() {
        this.load.image('back_button', 'assets/back_button.png');
    }

    create() {
        // Add background elements
        this.add.image(400, 300, 'battleground');

        var instructionsText = this.add.text(100, 200,
            "SHOP",
            { fill: 'yellow' });

        var backButton = this.add.image(400, 500, 'back_button');
        backButton.setInteractive({
            useHandCursor: true
        }).on('pointerdown', this.clickBackButton, this);
    }

    clickBackButton() {
        this.scene.switch('battleScene');
    }

}
