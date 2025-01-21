// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Symbolfx extends cc.Component {

    // LIFE-CYCLE CALLBACKS:
    public static instance : Symbolfx = null;

    onLoad () {
        if(!Symbolfx.instance){
            Symbolfx.instance = this;
        }
    }

    // update (dt) {}
}
