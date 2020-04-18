export class ShopScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'shopScene'
        });
    }
    
    preload() {
        this.load.image('shop_background', 'assets/shop_background.png');
        this.load.image('done_button', 'assets/done_button.png');
    }

    create() {
        // Add background elements
        this.add.image(400, 300, 'shop_background');

        var doneButton = this.add.image(400, 550, 'done_button');
        doneButton.setInteractive({
            useHandCursor: true
        }).on('pointerdown', this.clickBackButton, this);
    }

    clickBackButton() {
        this.scene.switch('battleScene');
    }

}
