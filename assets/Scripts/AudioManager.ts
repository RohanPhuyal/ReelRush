const { ccclass, property } = cc._decorator;

import { audioType } from "./GameConfig";

@ccclass
export default class AudioManager extends cc.Component {

    @property(cc.AudioClip)
    buttonAudio: cc.AudioClip = null;

    @property(cc.AudioClip)
    rollingAudio: cc.AudioClip = null;

    @property(cc.AudioClip)
    betAudio: cc.AudioClip = null;

    public static instance: AudioManager = null;

    public mute: boolean = false; // Add a mute state property

    playAudio(audio: number) {
        if (this.mute) return; // Skip playing if muted

        let clip: cc.AudioClip = null;
        let loop: boolean = false;

        if (audio === audioType.ui) {
            clip = this.buttonAudio;
        } else if (audio === audioType.bet) {
            clip = this.betAudio;
        } else if (audio === audioType.rolling) {
            clip = this.rollingAudio;
            loop = true;
        }

        if (clip) {
            cc.audioEngine.play(clip, loop, 1); // Play the audio directly
        }
    }

    stopAllAudio() {
        cc.audioEngine.stopAll(); // Stop all audio
    }

    muteAudio() {
        this.mute = !this.mute; // Toggle mute state
        const volume = this.mute ? 0 : 1;
        cc.audioEngine.setEffectsVolume(volume); // Set effects volume
        cc.audioEngine.setMusicVolume(volume);  // Set music volume
    }

    onLoad() {
        if (!AudioManager.instance) {
            AudioManager.instance = this;
        }
    }
}
