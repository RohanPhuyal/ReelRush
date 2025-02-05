import AssetsLoader from "./AssetsLoader";
import AudioManager from "./AudioManager";
import FreeGame from "./FreeGame";
import { waitTime, winLine } from "./GameConfig";
import GameStateManager, { GameState } from "./GameStateManager";
import UIManager from "./GameUIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {


    @property(cc.Node)
    rollBG: cc.Node = null;


    @property(cc.Node)
    rollSymbols: cc.Node = null;


    @property(cc.Node)
    winLinesParent: cc.Node = null;

    rollSymbolsChilds: cc.Node[] = [];

    betAmountDuringRolling = null;


    //migrating from rollpanel
    private elapsedTime = 0;
    public symbols: cc.Node[][] = [];
    private rollSpeed = 2500;
    @property(cc.JsonAsset)
    resultJson: cc.JsonAsset = null
    // symbols: cc.Node[] = [];

    //freewin section
    public isFreeGameWin = false;
    @property(cc.Node)
    freeGame: cc.Node = null;
    isFreeGameRunning = false;

    @property(cc.Prefab)
    symbolFX: cc.Prefab = null;
    @property(cc.Node)
    fxNode: cc.Node = null;
    //singleton
    public static instance: GameManager = null;

    async onLoad() {
        //singleton
        if (!GameManager.instance) {
            GameManager.instance = this;
        }

        await this.startGameManager();

    }

    //function to execute the necessary assets loading and positioning for game
    async startGameManager() {
        this.rollSymbolsChilds = this.rollSymbols.children;
        // Initialize the symbols array as a 2D array
        this.rollSymbolsChilds.forEach((rollNode) => {
            this.symbols.push([...rollNode.children]); // Use spread operator to ensure a proper 2D array
        });
        await this.setSymbolsPositions3x5(this.rollBG);
        await AssetsLoader.instance.assignSymbolsFrame(this.rollSymbolsChilds);
        GameStateManager.currentGameState = GameState.Ready;
    }
    async resetSymbolsPositions() {
        this.clampPoints = [];
        this.isFreeGameWin = false;
        this.position3x3 = [];
        this.fxNode.removeAllChildren();
        await this.disableWinLineNodes();
        await this.setSymbolsPositions3x5(this.rollBG);
    }

    //function to get node boundary
    public getNodeBoundary(node: cc.Node, boundary: 'top' | 'bottom' | 'left' | 'right', axis: 'x' | 'y'): number {
        const position = node.getPosition();
        const width = node.width;
        const height = node.height;
        const anchorX = node.anchorX;
        const anchorY = node.anchorY;


        switch (axis) {
            case 'y':
                switch (boundary) {
                    case 'top':
                        return position.y + (height * (1 - anchorY));
                    case 'bottom':
                        return position.y - (height * anchorY);
                }
                break;

            case 'x':
                switch (boundary) {
                    case 'left':
                        return position.x - (width * anchorX);
                    case 'right':
                        return position.x + (width * (1 - anchorX));
                }
                break;
        }
        return 0;
    }
    botPosition = 0;
    topPosition = 0;
    clampPoints = [];
    position3x3 = [];
    //function to set symbols positions in 3x5 grid size
    public async setSymbolsPositions3x5(node: cc.Node): Promise<void> {
        return new Promise((resolve) => {
            const topBoundary = this.getNodeBoundary(node, 'top', 'y');
            const bottomBoundary = this.getNodeBoundary(node, 'bottom', 'y');
            const leftBoundary = this.getNodeBoundary(node, 'left', 'x');
            const rightBoundary = this.getNodeBoundary(node, 'right', 'x');

            const rows = 5; // 5 total, but top 2 are hidden
            const cols = 3;

            const verticalGap = (topBoundary - bottomBoundary) / 3;  // 3 visible rows
            const horizontalGap = (rightBoundary - leftBoundary) / cols;

            this.botPosition = bottomBoundary + verticalGap * (-0.5);
            this.topPosition = bottomBoundary + verticalGap * (4.5);

            // Loop through each roll (column)
            for (let col = 0; col < cols; col++) {
                const rollNode = this.rollSymbolsChilds[col]; // Roll_0, Roll_1, Roll_2
                const rollSymbols = rollNode.children; // Symbols under Roll_X (1, 4, 7,...)

                // Initialize the sub-array for this column
                this.position3x3[col] = [];

                // Place symbols in a vertical stack for each roll
                for (let row = 0; row < rows; row++) {
                    if (row >= rollSymbols.length) break;

                    const xPos = leftBoundary + horizontalGap * (col + 0.5);
                    const yPos = bottomBoundary + verticalGap * (row + 0.5);

                    if (col === 0) {
                        this.clampPoints.push(yPos);
                    }
                    // Collect the first 3x3 visible symbols' positions
                    // Collect the first 3x3 visible symbols' positions
                    if (row < 3) {
                        this.position3x3[col].push([xPos, yPos]);
                    }
                    // Set symbol position in its column
                    rollSymbols[row].setPosition(new cc.Vec2(xPos, yPos));
                }
            }

            resolve();
        });
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
                symbol.position = symbol.position.add(new cc.Vec3(0, -dt * this.rollSpeed, 0));

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
        const clampPoints = this.clampPoints;

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
        AudioManager.instance.stopAllAudio();
        await this.calculateResult(this.symbols);
    }

    async calculateResult(symbols: cc.Node[][]) {
        if (GameStateManager.currentGameState === GameState.Result) {
            const spriteIdentifier = await AssetsLoader.instance.getVisibleSprite(symbols);
            const winningLines = await this.checkWinLines(spriteIdentifier);
            cc.log("print win line");
            cc.log(winningLines);
            if (winningLines && winningLines.length > 0) {
                this.addWinAmount(winningLines.length);
                // Show the winning lines one by one
                await this.showWinningLines(winningLines);
            }
            if (this.isFreeGameWin) {
                await waitTime(1);
                this.freeGame.active = true;
                this.disableWinLineNodes();
                await FreeGame.instance.startFreeGame();
                this.freeGame.active = false;

            }
            if (this.isFreeGameRunning && FreeGame.instance.currentFGNumber >= FreeGame.instance.totalFGNumber) {
                await FreeGame.instance.onFreeGamesOver();
            }
            GameStateManager.currentGameState = GameState.Ready;
            UIManager.instance.enableGameButtons();
        } else {
            return;
        }
    }
    public totalFreeWinAmount: number = 0;
    async addWinAmount(winningLinesLength: number) {
        if (winningLinesLength > 0) {
            let winAmount = 0;
            if (this.betAmountDuringRolling === 1) {
                winAmount = this.betAmountDuringRolling * winningLinesLength;
            } else if (this.betAmountDuringRolling === 2) {
                winAmount = this.betAmountDuringRolling * winningLinesLength * 2;
            } else if (this.betAmountDuringRolling === 3) {
                winAmount = this.betAmountDuringRolling * winningLinesLength * 3;
            } else if (this.betAmountDuringRolling === 4) {
                winAmount = this.betAmountDuringRolling * winningLinesLength * 4;
            } else if (this.betAmountDuringRolling === 5) {
                winAmount = this.betAmountDuringRolling * winningLinesLength * 5;
            }
            if (this.isFreeGameRunning) {
                this.totalFreeWinAmount += winAmount;
            }
            UIManager.instance.addWinAmount(winAmount);
        }
    }
    // This function will check which lines are winning
    async checkWinLines(spriteIdentifier) {
        const winLines = winLine;
        cc.log("Sprite Identifier: ");
        cc.log(spriteIdentifier);
        const winningLines: number[] = [];
        let isTripleBar = false;

        // Iterate through each win line and check if the symbols match
        for (let i = 0; i < winLines.length; i++) {
            const line = winLines[i];
            const [a, b, c] = line;

            // Check if all three cells in this line have the same value
            if (
                spriteIdentifier[0][a] === spriteIdentifier[1][b] &&
                spriteIdentifier[0][a] === spriteIdentifier[2][c]
            ) {
                winningLines.push(i); // Add the index of the winning line
                this.startSymbolFx(a,b,c,spriteIdentifier[0][a]);
                // Check if the line specifically matches `8, 8, 8`
                if (spriteIdentifier[0][a] === 8) {
                    isTripleBar = true;
                }
            }
        }

        // Log or process if `8, 8, 8` was found
        if (isTripleBar) {
            this.isFreeGameWin = true;
            cc.log("Found a winning line with identifier 8, 8, 8!");
        }

        return winningLines; // Return the indices of all winning lines
    }

    startSymbolFx(a,b,c, identifier) {
        cc.log('3x3pos');
        cc.log(this.position3x3);
        cc.log("Identifier: "+identifier);
        // Instantiate the prefab at the position of each node in the winning line
        for (const [col, row] of [[0, a], [1, b], [2, c]]) {
            const position = this.position3x3[col]?.[row]; // Access the position from position3x3
            if (position) {
                const [xPos, yPos] = position; // Destructure x and y positions
                const parentNode = this.fxNode; // Get the parent node for this column

                // Instantiate the prefab
                const instantiatedFX = cc.instantiate(this.symbolFX);
                instantiatedFX.setPosition(new cc.Vec2(xPos, yPos)); // Set the position from position3x3
                parentNode.addChild(instantiatedFX); // Add the prefab to the column's parent node
                this.playSymbolFXAnimationByIndex(instantiatedFX, identifier); // Play the animation

            } else {
                cc.warn(`No position found in position3x3 at column ${col}, row ${row}`);
            }
        }
    }
    playSymbolFXAnimationByIndex(instantiatedFX: cc.Node, clipIndex: number) {
        const symbolfxNode = instantiatedFX; // Get the 'symbolfx' node from the prefab
    
        const animation = symbolfxNode.getComponent(cc.Animation); // Get the Animation component
        if (!animation) {
            cc.warn("Animation component not found on 'symbolfx' node!");
            return;
        }
    
        const clips = animation.getClips(); // Get all clips
        if (clipIndex < 0 || clipIndex >= clips.length) {
            cc.warn(`Invalid clip index '${clipIndex}'. Available range: 0-${clips.length - 1}`);
            return;
        }
    
        cc.log("YETA CLIP PLAy")
        const clip = clips[clipIndex]; // Retrieve the clip by index
        animation.play(clip.name); // Play the clip by its name
    }
    
    
    

    // async checkWinLines(spriteIdentifier) {
    //     const winLines = winLine;
    //     cc.log("Sprite Identifier: ");
    //     cc.log(spriteIdentifier);
    //     const winningLines: number[] = [];
    //     let isTripleBar = false;

    //     // Iterate through each win line and check if the symbols match
    //     for (let i = 0; i < winLines.length; i++) {
    //         const line = winLines[i];
    //         const [a, b, c] = line;

    //         // Check if all three cells in this line have the same value
    //         if (
    //             spriteIdentifier[a[0]][a[1]] === spriteIdentifier[b[0]][b[1]] &&
    //             spriteIdentifier[a[0]][a[1]] === spriteIdentifier[c[0]][c[1]]
    //         ) {
    //             winningLines.push(i); // Add the index of the winning line

    //             // Check if the line specifically matches `8, 8, 8`
    //             if (spriteIdentifier[a[0]][a[1]] === 8) {
    //                 isTripleBar = true;
    //             }
    //         }
    //     }

    //     // Log or process if `8, 8, 8` was found
    //     if (isTripleBar) {
    //         this.isFreeGameWin=true;
    //         cc.log("Found a winning line with identifier 8, 8, 8!");
    //     }

    //     return winningLines; // Return the indices of all winning lines
    // }
    // This function will enable the win lines one by one with animation
    async showWinningLines(winningLines: number[]) {
        // Add a 700ms delay right at the beginning of the function
        await new Promise(resolve => setTimeout(resolve, 700)); // Wait for 700ms before starting

        // Ensure that all win line nodes are initially disabled
        await this.disableWinLineNodes();
        const tempLine = [];
        // Loop through each winning line index and enable the corresponding win line node
        for (let i = 0; i < winningLines.length; i++) {
            const lineIndex = winningLines[i];
            const lineNode = this.winLinesParent.children[lineIndex];

            // Enable the win line node corresponding to the winning line index
            lineNode.active = true;


            tempLine.push(lineNode);
            // Optionally, add a delay before showing the next winning line
            await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for 1000ms before hiding the line
            lineNode.active = false;
            if (i === winningLines.length - 1) {
                lineNode.active = false;
                await new Promise(resolve => setTimeout(resolve, 500));
                tempLine.forEach(line => {
                    line.active = true;
                })
            }
        }
    }
    async disableWinLineNodes() {
        // Ensure that all win line nodes are initially disabled
        this.winLinesParent.children.forEach(child => {
            child.active = false;
        });
    }

    update(dt) {
        if (GameStateManager.currentGameState === GameState.Rolling && this.elapsedTime <= 5) {
            this.rollingDown(dt);
        } else if (GameStateManager.currentGameState === GameState.Slowdown) {
            this.rollingDownSlow();
        }
    }

}
