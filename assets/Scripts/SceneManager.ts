// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

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
    onLoad() {
        if (!SceneManager.instance) {
            SceneManager.instance = this;
        }
        if (!this.currentScene) {
            this.setNewScene(this.mainMenuScene);
        }
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
}
