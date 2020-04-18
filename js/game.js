import {TitleScene} from './titleScene.js';
import {InstructionsScene} from './instructionsScene.js';
import {BattleScene} from './battleScene.js';
import {ShopScene} from './shopScene.js';

var titleScene = new TitleScene();
var instructionsScene = new InstructionsScene();
var battleScene = new BattleScene();
var shopScene = new ShopScene();

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade'
    }
};

var game = new Phaser.Game(config);

game.scene.add('titleScene', titleScene);
game.scene.add('instructionsScene', instructionsScene);
game.scene.add('battleScene', battleScene);
game.scene.add('shopScene', shopScene);

game.scene.start('titleScene');

