// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AssetsLoader from "./AssetsLoader";
import SceneManager from "./SceneManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingMenu extends cc.Component {
    @property(cc.JsonAsset)
    assetsData: cc.JsonAsset = null;

    @property(cc.ProgressBar)
    loadingProgress: cc.ProgressBar = null;

    async onLoad() {
        this.loadingProgress.progress = 0;
        await this.loadAssets();
    }

    async loadAssets() {
        const updateProgress = (progress: number) => {
            cc.tween(this.loadingProgress)
                .to(1, { progress: progress }, { easing: "sineOut" }) // Smoothly animate progress over 1 second
                .call(() => {
                    if (progress >= 1) {
                        SceneManager.instance.setNewScene(SceneManager.instance.gameScene);
                    }
                })
                .start();
        };
    
        await AssetsLoader.instance.preloadAndRandomizeSymbols(this.assetsData, updateProgress);
    }
}
