// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameStateManager, { GameState } from "./GameStateManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIManager extends cc.Component {

    //Buttons present in UI
    @property(cc.Button)
    startSpinButton: cc.Button = null;
    @property(cc.Button)
    increaseBetButton: cc.Button = null;
    @property(cc.Button)
    decreaseBetButton: cc.Button = null;

    //Labels in UI
    @property(cc.Label)
    betAmountLabel: cc.Label = null;
    @property(cc.Label)
    winAmountLabel: cc.Label = null;
    @property(cc.Label)
    coinLabel: cc.Label = null;

    //Limititations
    maxBetAmount = 5;
    minBetAmount = 1;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.setInitialValue();
        this.startSpinButton.node.on(cc.Node.EventType.TOUCH_START, this.startRolling, this);
        this.increaseBetButton.node.on(
            cc.Node.EventType.TOUCH_START,
            () => this.updateBet("increase"),
            this
        );

        this.decreaseBetButton.node.on(
            cc.Node.EventType.TOUCH_START,
            () => this.updateBet("decrease"),
            this
        );


    }
    //function to start rolling
    private startRolling() {
        //check game status
        if (GameStateManager.currentGameState != GameState.Ready) {
            cc.log("Game is not ready");
            return;
        }

        const currentBet = parseInt(this.betAmountLabel.string);
        let totalCoin = parseInt(this.coinLabel.string);
        if (currentBet > totalCoin) {
            cc.log("Not enough coins");
            return;
        } else if (currentBet <= totalCoin) {
            totalCoin -= currentBet;
            this.coinLabel.string = totalCoin.toString();
            GameStateManager.currentGameState = GameState.Rolling;
            cc.log("Starting Spin");
        }
    }

    //function to set initial value to labels
    private setInitialValue() {
        this.betAmountLabel.string = '1';
        this.winAmountLabel.string = '0.00';
    }

    // function to decease/increase bet
    private updateBet(betBehaviour: string) {
        const currentBet = parseInt(this.betAmountLabel.string);
        if (betBehaviour === "increase") {
            if (currentBet < this.maxBetAmount) {
                this.betAmountLabel.string = (currentBet + 1).toString();
            }
        } else if (betBehaviour === "decrease") {
            if (currentBet > this.minBetAmount) {
                this.betAmountLabel.string = (currentBet - 1).toString();
            }
        }
    }
    //function to disable game buttons
    public disableGameButtons() {
        this.startSpinButton.interactable = false;
        this.increaseBetButton.interactable = false;
        this.decreaseBetButton.interactable = false;
    }
 //function to enable game buttons
    public enableGameButtons() {
        this.startSpinButton.interactable = true;
        this.increaseBetButton.interactable = true;
        this.decreaseBetButton.interactable = true;
    }

    //function to add win amount to coin 
    public addWinAmount(amount:number){
        let totalCoin = parseInt(this.coinLabel.string);
        totalCoin += amount;
        this.coinLabel.string = totalCoin.toString();
    }

    start() {

    }

    // update (dt) {}
}
