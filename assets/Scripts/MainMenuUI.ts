// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioManager from "./AudioManager";
import SceneManager from "./SceneManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MainMenuUI extends cc.Component {
    

    @property(cc.Button)
    startButton: cc.Button = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.startButton.node.on(cc.Node.EventType.TOUCH_START, this.startGame, this);
    }

    startGame() {
        SceneManager.instance.setNewScene(SceneManager.instance.loadingMenuScene);
        AudioManager.instance.playButtonAudio();
    }
    start () {

    }

    // update (dt) {}
}
