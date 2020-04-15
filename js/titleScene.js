export class TitleScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'titleScene'
        });
    }
    
    preload() {
        this.load.image('title_background', 'assets/title_background.png');
        this.load.image('title_text', 'assets/title_text.png');
        this.load.image('title_play_button', 'assets/title_play_button.png');
        this.load.image('title_instructions_button', 'assets/title_instructions_button.png');
    }

    create() {
        this.add.image(400, 300, 'title_background');
        this.add.image(400, 200, 'title_text');
        
        var playButton = this.add.image(400, 400, 'title_play_button');
        playButton.setInteractive({
            useHandCursor: true
        }).on('pointerdown', this.clickPlayButton, this);
        var instructionsButton = this.add.image(400, 500, 'title_instructions_button');
        instructionsButton.setInteractive({
            useHandCursor: true
        }).on('pointerdown', this.clickInstructionsButton, this);
    }

    clickPlayButton() {
        this.scene.switch('battleScene');
    }

    clickInstructionsButton() {
        this.scene.switch('instructionsScene');
    }

}
