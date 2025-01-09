import AssetsLoader from "./AssetsLoader";
import GameStateManager, { GameState } from "./GameStateManager";

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

    rollSymbolsChilds: cc.Node[] = [];

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
    botP = 0;
    topP = 0;
    vertG = [];
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

            this.botP = bottomBoundary + verticalGap * (-0.5);
            this.topP = bottomBoundary + verticalGap * (4.5);

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
                        this.vertG.push(yPos);
                    }
                    // Set symbol position in its column
                    rollSymbols[row].setPosition(new cc.Vec2(xPos, yPos));
                }
            }

            resolve();
        });
    }


}
