// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneManager extends cc.Component {
    private currentScene: cc.Node = null;
    //function to set scene
    setNewScene(scenePrefab: cc.Prefab) {
        //check if current scene is not null
        if (this.currentScene) {
            this.currentScene.removeFromParent();
            this.currentScene = null;

            this.currentScene = cc.instantiate(scenePrefab);
            this.node.addChild(this.currentScene);
        }else{
            this.currentScene = cc.instantiate(scenePrefab);
            this.node.addChild(this.currentScene);
        }
    }
}
