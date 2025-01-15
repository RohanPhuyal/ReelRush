// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

import { audioType } from "./GameConfig";
@ccclass
export default class AudioManager extends cc.Component {

    @property(cc.AudioSource)
    audioSource: cc.AudioSource = null;

    @property(cc.AudioClip)
    buttonAudio: cc.AudioClip = null;
    @property(cc.AudioClip)
    rollingAudio: cc.AudioClip = null;
    @property(cc.AudioClip)
    betAudio: cc.AudioClip = null;
    // LIFE-CYCLE CALLBACKS:
    public static instance: AudioManager = null;
    playAudio(audio: number) {
        if (audio === audioType.ui) {
            this.audioSource.clip = this.buttonAudio;
            this.audioSource.loop = false;
            this.audioSource.play();
        }
        if (audio === audioType.bet) {
            this.audioSource.clip = this.betAudio;
            this.audioSource.loop = false;
            this.audioSource.play();
        }
        if (audio === audioType.rolling) {
            this.audioSource.clip = this.rollingAudio;
            this.audioSource.loop = true;
            this.audioSource.play();
        }
    }

    stopAudio() {
        this.audioSource.stop();
    }
    onLoad() {

        if (!AudioManager.instance) {
            AudioManager.instance = this;
        }
    }
    muteAudio() {
        if (this.audioSource.mute) {
            this.audioSource.mute = false;
        } else {
            this.audioSource.mute = true;
        }
    }

    // update (dt) {}
}
