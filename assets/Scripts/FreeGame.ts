// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FreeGame extends cc.Component {
    public static instance: FreeGame = null;
    @property(cc.Node)
    freeWinImage: cc.Node = null;
    onLoad() {
        if (!FreeGame.instance) {
            FreeGame.instance = this;
        }

    }
    async startFreeGame(): Promise<void> {
        if (GameManager.instance.isFreeGameWin) {

            return new Promise<void>((resolve) => {
                cc.tween(this.freeWinImage)
                    .to(1, { scale: 2 }, { easing: 'cubicOut' })
                    .call(() => {
                        this.freeWinImage.scale=0.2;
                        resolve(); // Resolve the promise after the tween finishes
                    })
                    .start();
            });
        } else {
            return Promise.resolve(); // Resolve immediately if the condition is not met
        }
    }

}
