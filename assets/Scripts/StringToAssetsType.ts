// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class StringToAssetType extends cc.Component {
    public static stringToAssetType(assetType: string): typeof cc.Asset | null {
        switch (assetType) {
            case "sprite":
                return cc.SpriteFrame as typeof cc.Asset;
            case "audio":
                return cc.AudioClip as typeof cc.Asset;
            default:
                cc.error("Asset Type not found");
                return null;
        }
    }
    
}
