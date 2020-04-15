import {TitleScene} from './titleScene.js';
import {InstructionsScene} from './instructionsScene.js';
import {BattleScene} from './battleScene.js';

var titleScene = new TitleScene();
var instructionsScene = new InstructionsScene();
var battleScene = new BattleScene();

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    }
};

var game = new Phaser.Game(config);

game.scene.add('titleScene', titleScene);
game.scene.add('instructionsScene', instructionsScene);
game.scene.add('battleScene', battleScene);

game.scene.start('titleScene');

