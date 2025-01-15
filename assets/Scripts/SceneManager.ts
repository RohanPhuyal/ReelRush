// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AssetsLoader from "./AssetsLoader";
import AudioManager from "./AudioManager";
import GameManager from "./GameManager";
import GameUIManager from "./GameUIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneManager extends cc.Component {
    @property(cc.Prefab)
    mainMenuScene: cc.Prefab = null;
    @property(cc.Prefab)
    loadingMenuScene: cc.Prefab = null;
    @property(cc.Prefab)
    gameScene: cc.Prefab = null;
    private currentScene: cc.Node = null;
    public static instance: SceneManager = null;
    public static coinAmount: number = 30;
    onLoad() {
        if(!localStorage.getItem('coin')){
            cc.log("no value found");
            localStorage.setItem('coin', SceneManager.coinAmount.toString());
        }else{
            cc.log("COIN FOUND");
            SceneManager.coinAmount = parseInt(localStorage.getItem('coin'));
        }
        if (!SceneManager.instance) {
            SceneManager.instance = this;
        }
        if (!this.currentScene) {
            this.setNewScene(this.mainMenuScene);
        }
    }
    changeCoinAmount(totalCoin: number){
        SceneManager.coinAmount = totalCoin;
        localStorage.setItem('coin', SceneManager.coinAmount.toString());
    }
    //function to set scene
    setNewScene(scenePrefab: cc.Prefab) {
        //check if current scene is not null
        if (this.currentScene) {
            this.currentScene.removeFromParent();
            this.currentScene = null;

            this.currentScene = cc.instantiate(scenePrefab);
            this.node.addChild(this.currentScene);
        } else {
            this.currentScene = cc.instantiate(scenePrefab);
            this.node.addChild(this.currentScene);
        }
    }
    exitToMenu() {
        this.destroyAllInstances();
        this.currentScene.removeFromParent();
        this.currentScene.destroy();
        this.currentScene = null;
        this.setNewScene(this.mainMenuScene);
    }

    destroyAllInstances(){
        AssetsLoader.destroyInstance();
        GameManager.instance=null;
        GameUIManager.instance=null;

    }
}
