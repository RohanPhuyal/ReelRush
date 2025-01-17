// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { waitTime } from "./GameConfig";
import GameManager from "./GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FreeGame extends cc.Component {
    public static instance: FreeGame = null;
    @property(cc.Node)
    freeWinImage: cc.Node = null;
    @property(cc.Node)
    freeBG: cc.Node = null;
    @property(cc.Node)
    freeGameLabelBG: cc.Node = null;
    @property(cc.Node)
    totalFreeWin: cc.Node = null;
    @property(cc.Node)
    totalWinPopup: cc.Node = null;

    @property(cc.Label)
    currentFGLabel: cc.Label = null;
    @property(cc.Label)
    totalFGLabel: cc.Label = null;
    @property(cc.Label)
    totalFreeWinLabel: cc.Label = null;

    public currentFGNumber: number = 0;
    public totalFGNumber: number = 0;
    onLoad() {
        if (!FreeGame.instance) {
            FreeGame.instance = this;
        }
        this.currentFGLabel.string = this.currentFGNumber.toString();
        this.totalFGLabel.string = this.totalFGNumber.toString();
    }
    async startFreeGame(): Promise<void> {
        if (GameManager.instance.isFreeGameWin) {

            return new Promise<void>((resolve) => {
                cc.tween(this.freeWinImage)
                    .to(1, { scale: 2 }, { easing: 'cubicOut' })
                    .call(() => {
                        this.freeWinImage.scale = 0.2;
                        this.freeBG.active = true;
                        this.addTotalFGNumber();
                        this.freeGameLabelBG.active = true;
                        GameManager.instance.isFreeGameRunning = true;
                        resolve(); // Resolve the promise after the tween finishes
                    })
                    .start();
            });
        } else {
            return Promise.resolve(); // Resolve immediately if the condition is not met
        }
    }
    increaseCurrentFGNumber() {
        this.currentFGNumber++;
        this.currentFGLabel.string = this.currentFGNumber.toString();
    }
    resetCurrentFGNumber() {
        this.currentFGNumber = 0;
        this.currentFGLabel.string = this.currentFGNumber.toString();
    }
    addTotalFGNumber() {
        cc.log("ADING")
        this.totalFGNumber += 5;
        this.totalFGLabel.string = this.totalFGNumber.toString();
        cc.log(this.totalFGLabel)
    }
    async onFreeGamesOver() {
        cc.log("TOTAL WIN: " + GameManager.instance.totalFreeWinAmount);
        await waitTime(1);
        this.totalFreeWin.active=true;
        this.totalFreeWinLabel.string = GameManager.instance.totalFreeWinAmount.toFixed(2).toString();
        await this.totalFreeWinAmount();
        await waitTime(1);
        this.totalFreeWin.active=false;
        this.totalWinPopup.scale = 0.2;
        GameManager.instance.isFreeGameWin = false;
        GameManager.instance.totalFreeWinAmount = 0;
        GameManager.instance.isFreeGameRunning = false;
        this.freeBG.active = false;
        this.freeGameLabelBG.active = false;
        this.currentFGNumber = 0;
        this.totalFGNumber = 0;
        this.currentFGLabel.string = this.currentFGNumber.toString();
        this.totalFGLabel.string = this.totalFGNumber.toString();
    }
    async totalFreeWinAmount(): Promise<void> {
        return new Promise<void>((resolve) => {
            cc.tween(this.totalWinPopup)
                .to(1, { scale: 1 }, { easing: 'cubicOut' })
                .call(() => {
                    resolve(); // Resolve the promise after the tween finishes
                })
                .start();
        });
    }
}
