// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from "./AudioManager";
import { audioType } from "./GameConfig";
import SceneManager from "./SceneManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MainMenuUI extends cc.Component {
    

    @property(cc.Button)
    startButton: cc.Button = null;

    @property(cc.Label)
    coinLabel:cc.Label = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.coinLabel.string = SceneManager.coinAmount.toString();
        this.startButton.node.on(cc.Node.EventType.TOUCH_START, this.startGame, this);
    }

    startGame() {
        SceneManager.instance.setNewScene(SceneManager.instance.loadingMenuScene);
        AudioManager.instance.playAudio(audioType.ui);
    }
    start () {

    }

    // update (dt) {}
}
