// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameManager from "./GameManager";
import GameStateManager, { GameState } from "./GameStateManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private elapsedTime = 0;

    private symbols: cc.Node[] = [];

    async onLoad() {
        await GameManager.instance.startGameManager();
        const roll = GameManager.instance.rollSymbolsChilds;
        roll.forEach((node) => {
            node.children.forEach((symbol) => {
                this.symbols.push(symbol);
            })
        })
    }

    start() {

    }
    private rollingDown(dt) {
        this.elapsedTime += dt;

        for (let i = 0; i < this.symbols.length; i++) {
            const element = this.symbols[i];
            element.position = element.position.add(new cc.Vec3(0, -dt * 500, 0));
            if (element.position.y <= GameManager.instance.botP) {
                element.position = new cc.Vec3(element.position.x, GameManager.instance.topP, element.position.z);
            }
        }
        if (this.elapsedTime >= 5) {
            GameStateManager.currentGameState = GameState.Slowdown;
        }
    }
    calculateDistanceToNextPoint(i: number): number {
        const currentSymbolPosition = this.symbols[i].position.y;
        
        const yPositions: number[] = GameManager.instance.vertG;
        if(currentSymbolPosition <= yPositions[0]){
            cc.log("reset");
            this.symbols[i].position=new cc.Vec3(this.symbols[i].position.x,GameManager.instance.topP,this.symbols[i].position.z);
            return null;
        }
    
        // Filter out Y positions greater than the current position
        const filteredYPositions = yPositions.filter((y) => y <= currentSymbolPosition);
    
        // If there are no valid positions, return the current position (or handle gracefully)
        if (filteredYPositions.length === 0) {
            return currentSymbolPosition; // Or handle as needed
        }
    
        // Get the largest Y value that is less than or equal to currentSymbolPosition
        const closestY = Math.max(...filteredYPositions);
    
        return closestY;
    }
    
    private rollingDownSlow() {
        for (let i = 0; i < this.symbols.length; i++) {
            cc.log("i"+i);
            const targetY = this.calculateDistanceToNextPoint(i);
            if(targetY!=null){
                cc.tween(this.symbols[i])
                .to(0.1, { position: cc.v3(this.symbols[i].position.x, targetY, this.symbols[i].position.z) })
                .start();
            }
            
        }
        GameStateManager.currentGameState = GameState.Ready;
    }
    
    update(dt) {
        if (GameStateManager.currentGameState === GameState.Rolling && this.elapsedTime <= 5) {
            this.rollingDown(dt);
        } else if (GameStateManager.currentGameState === GameState.Slowdown) {
            this.rollingDownSlow();
        }
    }

}

