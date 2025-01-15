// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AssetsLoader from "./AssetsLoader";
import AudioManager from "./AudioManager";
import { audioType } from "./GameConfig";
import GameManager from "./GameManager";
import GameStateManager, { GameState } from "./GameStateManager";
import SceneManager from "./SceneManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameUIManager extends cc.Component {

    //Buttons present in UI
    @property(cc.Button)
    moreButton: cc.Button = null;
    @property(cc.Button)
    soundButton: cc.Button = null;
    @property(cc.Button)
    homeButton: cc.Button = null;
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
    public static instance: GameUIManager = null;

    onLoad() {
        if (!GameUIManager.instance) {
            GameUIManager.instance = this;
        }
        this.coinLabel.string = SceneManager.coinAmount.toString();
        this.setInitialValue();
        this.startSpinButton.node.on(cc.Node.EventType.TOUCH_START, this.startRolling, this);
        this.moreButton.node.on(cc.Node.EventType.TOUCH_START, this.onMoreButtonPressed, this);
        this.soundButton.node.on(cc.Node.EventType.TOUCH_START, this.onSoundButtonPressed, this);
        this.homeButton.node.on(cc.Node.EventType.TOUCH_START, this.onHomeButtonPressed, this);
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
    onSoundButtonPressed(){
        AudioManager.instance.muteAudio();
        if(AudioManager.instance.audioSource.mute){
            this.soundButton.interactable=false;
        }else{
            this.soundButton.interactable=true;
        }
    }
    private onMoreButtonPressed() {
        AudioManager.instance.playAudio(audioType.ui);
        if (this.homeButton.node.active) {
            this.homeButton.node.active = false;
        } else {
            this.homeButton.node.active = true;
        }
        if(this.soundButton.node.active){
            this.soundButton.node.active = false;
        }else{
            this.soundButton.node.active = true;
        }
    }
    private onHomeButtonPressed() {
        //check game status
        if (GameStateManager.currentGameState != GameState.Ready) {
            cc.log("Game is not ready");
            return;
        }

        AudioManager.instance.playAudio(audioType.ui);
        GameManager.instance.symbols = [];
        GameStateManager.currentGameState = GameState.Start;
        AudioManager.instance.stopAudio();
        SceneManager.instance.exitToMenu();
    }
    //function to start rolling
    private startRolling() {

        //check game status
        if (GameStateManager.currentGameState != GameState.Ready) {
            cc.log("Game is not ready");
            return;
        }

        AudioManager.instance.playAudio(audioType.ui);
        const currentBet = parseInt(this.betAmountLabel.string);
        let totalCoin = parseInt(this.coinLabel.string);
        if (currentBet > totalCoin) {
            cc.log("Not enough coins");
            return;
        } else if (currentBet <= totalCoin) {
            totalCoin -= currentBet;
            this.coinLabel.string = totalCoin.toString();
            SceneManager.instance.changeCoinAmount(totalCoin);
            this.winAmountLabel.string = "0.00";
            GameManager.instance.resetSymbolsPositions();
            GameManager.instance.betAmountDuringRolling = currentBet;
            GameStateManager.currentGameState = GameState.Rolling;
            AudioManager.instance.playAudio(audioType.rolling);
            this.disableGameButtons();
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
        if (GameStateManager.currentGameState != GameState.Ready) {
            return;
        }
        AudioManager.instance.playAudio(audioType.bet);
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

        this.homeButton.interactable = false;
    }
    //function to enable game buttons
    public enableGameButtons() {
        this.startSpinButton.interactable = true;
        this.increaseBetButton.interactable = true;
        this.decreaseBetButton.interactable = true;

        this.homeButton.interactable = true;
    }

    //function to add win amount to coin 
    public addWinAmount(amount: number) {
        let totalCoin = parseInt(this.coinLabel.string);
        totalCoin += amount;
        this.coinLabel.string = totalCoin.toString();
        SceneManager.instance.changeCoinAmount(totalCoin);
        this.winAmountLabel.string = amount.toFixed(2).toString();
    }

    start() {

    }

    // update (dt) {}
}
