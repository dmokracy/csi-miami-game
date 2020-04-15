class TitleScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'titleScene'
        });
    }
    
    preload() {
        this.load.image('title_background', 'assets/title_background.png');
        this.load.image('title_play_button', 'assets/title_play_button.png');
    }

    create() {
        this.add.image(400, 300, 'title_background');
        
        var playButton = this.add.image(400, 400, 'title_play_button');
        playButton.setInteractive({
            useHandCursor: true
        }).on('pointerdown', this.clickPlayButton, this);
    }

    clickPlayButton() {
        this.scene.switch('battleScene');
    }

}

export default TitleScene;
