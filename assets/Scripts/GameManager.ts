import AssetsLoader from "./AssetsLoader";
import GameStateManager, { GameState } from "./GameStateManager";
import GameUIManager from "./GameUIManager";
import UIManager from "./GameUIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

    //necessary nodes and jsonasset for assets and game
    @property(cc.JsonAsset)
    assetsData: cc.JsonAsset = null;

    @property(cc.Node)
    rollBG: cc.Node = null;


    @property(cc.Node)
    rollSymbols: cc.Node = null;


    @property(cc.Node)
    winLinesParenet: cc.Node = null;

    rollSymbolsChilds: cc.Node[] = [];

    betAmountDuringRolling = null;

    // symbols: cc.Node[] = [];

    //singleton
    public static instance: GameManager = null;

    async onLoad() {
        //singleton
        if (!GameManager.instance) {
            GameManager.instance = this;
        }
        this.rollSymbolsChilds = this.rollSymbols.children;

    }

    //function to execute the necessary assets loading and positioning for game
    async startGameManager() {
        await this.setSymbolsPositions3x5(this.rollBG);
        await AssetsLoader.instance.randomizeSymbols(this.assetsData);
        await AssetsLoader.instance.assignSymbolsFrame(this.rollSymbolsChilds);
        GameStateManager.currentGameState = GameState.Ready;
    }
    async resetSymbolsPositions() {
        this.clampPositions = [];
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
    clampPositions = [];
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

                // Place symbols in a vertical stack for each roll
                for (let row = 0; row < rows; row++) {
                    if (row >= rollSymbols.length) break;

                    const xPos = leftBoundary + horizontalGap * (col + 0.5);
                    const yPos = bottomBoundary + verticalGap * (row + 0.5);

                    if (col === 0) {
                        cc.log("Col: " + col);
                        this.clampPositions.push(yPos);
                    }
                    // Set symbol position in its column
                    rollSymbols[row].setPosition(new cc.Vec2(xPos, yPos));
                }
            }

            resolve();
        });
    }

    async calculateResult(symbols: cc.Node[][]) {
        if (GameStateManager.currentGameState === GameState.Result) {
            const spriteIdentifier = await AssetsLoader.instance.getVisibleSprite(symbols);
            const winningLines = await this.checkWinLines(spriteIdentifier);
            if (winningLines && winningLines.length > 0) {

                this.addWinAmount(winningLines.length);
                cc.log(winningLines);
                // Show the winning lines one by one
                await this.showWinningLines(winningLines);
            }
            GameStateManager.currentGameState = GameState.Ready;
            UIManager.instance.enableGameButtons();
        } else {
            return;
        }
    }
    async addWinAmount(winningLinesLength: number) {
        if (winningLinesLength > 0) {
            let winAmount=0;
            if(this.betAmountDuringRolling === 1){
                winAmount = this.betAmountDuringRolling*winningLinesLength;
            }else if(this.betAmountDuringRolling === 2){
                winAmount = this.betAmountDuringRolling*winningLinesLength*2;
            }else if(this.betAmountDuringRolling === 3){
                winAmount = this.betAmountDuringRolling*winningLinesLength*3;
            }else if(this.betAmountDuringRolling === 4){
                winAmount = this.betAmountDuringRolling*winningLinesLength*4;
            }else if(this.betAmountDuringRolling === 5){
                winAmount = this.betAmountDuringRolling*winningLinesLength*5;
            }
            UIManager.instance.addWinAmount(winAmount);
        }
    }
    // This function will check which lines are winning
    async checkWinLines(spriteIdentifier) {
        const winLines = [
            [[0, 0], [1, 0], [2, 0]], // Bottom horizontal line
            [[0, 1], [1, 1], [2, 1]], // Middle horizontal line
            [[0, 2], [1, 2], [2, 2]], // Top horizontal line
            [[0, 0], [1, 1], [2, 2]], // Bot left to top right diagonal
            [[0, 2], [1, 1], [2, 0]]  // Bot right to top left diagonal
        ];

        const winningLines: number[] = [];

        // Iterate through each win line and check if the symbols match
        for (let i = 0; i < winLines.length; i++) {
            const line = winLines[i];
            const [a, b, c] = line;

            // Check if all three cells in this line have the same value
            if (spriteIdentifier[a[0]][a[1]] === spriteIdentifier[b[0]][b[1]] && spriteIdentifier[a[0]][a[1]] === spriteIdentifier[c[0]][c[1]]) {
                winningLines.push(i); // Add the index of the winning line
            }
        }

        return winningLines; // Return the indices of all winning lines
    }
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
            const lineNode = this.winLinesParenet.children[lineIndex];

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
        this.winLinesParenet.children.forEach(child => {
            child.active = false;
        });
    }


}
