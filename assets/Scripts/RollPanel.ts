// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AssetsLoader from "./AssetsLoader";
import GameManager from "./GameManager";
import GameStateManager, { GameState } from "./GameStateManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private elapsedTime = 0;

    // private randomSpriteTime=0;

    private rollSymbolsChilds: cc.Node[] = [];
    private symbols: cc.Node[][] = [];
    private clampPoint: number[] = [];

    @property(cc.JsonAsset)
    resultJson: cc.JsonAsset = null;

    async onLoad() {
        await GameManager.instance.startGameManager();
        this.rollSymbolsChilds = GameManager.instance.rollSymbolsChilds;
        // Initialize the symbols array as a 2D array
        this.rollSymbolsChilds.forEach((rollNode) => {
            this.symbols.push([...rollNode.children]); // Use spread operator to ensure a proper 2D array
        });
        this.clampPoint = GameManager.instance.clampPositions;
    }

    start() {

    }
    private rollingDown(dt) {
        this.elapsedTime += dt;
        // Iterate through each roll (row in the 2D array)
        for (let i = 0; i < this.symbols.length; i++) {
            const rollSymbols = this.symbols[i];

            // Iterate through each symbol in the roll
            for (let j = 0; j < rollSymbols.length; j++) {
                const symbol = rollSymbols[j];

                // Move the symbol down
                symbol.position = symbol.position.add(new cc.Vec3(0, -dt * 2500, 0));

                // Check if the symbol moves past the bottom boundary
                if (symbol.position.y <= GameManager.instance.botPosition) {
                    // Move the symbol to the top
                    symbol.position = new cc.Vec3(symbol.position.x, GameManager.instance.topPosition, symbol.position.z);

                    // Update the 2D array to reflect the new order
                    const movedSymbol = rollSymbols.splice(j, 1)[0]; // Remove the symbol from the current position
                    rollSymbols.push(movedSymbol); // Add the symbol to the end of the roll array

                    // Adjust the index to account for the removed element
                    j--;
                }
            }
        }
        if (this.elapsedTime >= 5) {
            GameStateManager.currentGameState = GameState.Slowdown;
            this.elapsedTime = 0;
        }
    }

    async rollingDownSlow() {
        const clampPoints = this.clampPoint;

        for (let i = 0; i < this.symbols.length; i++) {
            const rollSymbols = this.symbols[i]; // Each roll (e.g., Roll_0, Roll_1, Roll_2)

            for (let j = 0; j < rollSymbols.length; j++) {
                const symbol = rollSymbols[j];
                const currentY = symbol.position.y;

                if (currentY < clampPoints[0]) {
                    // If the symbol goes below the lowest clamp point, wrap it to the top
                    symbol.position = new cc.Vec3(symbol.position.x, clampPoints[clampPoints.length - 1], symbol.position.z);

                    // Update the 2D array to reflect the new order
                    const movedSymbol = rollSymbols.splice(j, 1)[0]; // Remove the symbol from the current position
                    rollSymbols.push(movedSymbol); // Add the symbol to the end of the roll array

                    // Adjust the index to account for the removed element
                    j--;
                } else {
                    // Find the closest clamp point that is less than or equal to the current Y position
                    const targetY = clampPoints.reduce((closest, point) => {
                        return currentY >= point && point > closest ? point : closest;
                    }, clampPoints[0]);

                    // Tween the symbol to the target position
                    cc.tween(symbol)
                        .to(0.1, { position: cc.v3(symbol.position.x, targetY, symbol.position.z) }, { easing: 'cubicOut' })
                        .start();
                }
            }
        }
        AssetsLoader.instance.assignWinSymbols(this.symbols, this.resultJson);
        GameStateManager.currentGameState = GameState.Result;
        cc.log(this.symbols);
        await GameManager.instance.calculateResult(this.symbols);
    }





    update(dt) {
        if (GameStateManager.currentGameState === GameState.Rolling && this.elapsedTime <= 5) {
            this.rollingDown(dt);
        } else if (GameStateManager.currentGameState === GameState.Slowdown) {
            this.rollingDownSlow();
        }
    }

}

