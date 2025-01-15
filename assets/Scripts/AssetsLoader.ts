// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { AssetData, AssetItem, SymbolAsset } from "./GameConfig";
import StringToAssetType from "./StringToAssetsType";

const { ccclass, property } = cc._decorator;
//asstsdata json contains name path for assets

@ccclass
export default class AssetsLoader extends cc.Component {
    //varible to hold assets datas
    allAssets = [];
    //variable to store Symbols data
    symbolsData: SymbolAsset[] = [];

    //Singleton instance (without attaching to node)
    private static _instance: AssetsLoader = null;


    public static get instance(): AssetsLoader {
        if (!this._instance) {
            this._instance = new AssetsLoader();
        }
        return this._instance;
    }

    public static destroyInstance(): void {
        if (this._instance) {
            this._instance = null; // Clear the instance
        }
    }
    
    //function to execure the randomize symbols one by one
    public async preloadAndRandomizeSymbols(assetsData: cc.JsonAsset, onProgress: (progress: number) => void): Promise<void> {
        await this.getAllAssetsFromJSON(assetsData);
        await this.preloadAssets(this.allAssets, () => { cc.log("Loaded"); }, onProgress);
        await this.shuffleArray(this.symbolsData);
    }
    


    // Function to get assets from JSON
    async getAllAssetsFromJSON(assetsData: cc.JsonAsset) {
        const assetData: AssetData = assetsData.json;
        // Iterate over all keys (spineData, audioData, etc.)
        for (const key in assetData) {
            if (assetData.hasOwnProperty(key)) {
                const assets = assetData[key];  // Get the array of AssetItem
                assets.forEach(asset => {
                    this.allAssets.push(asset);
                });
            }
        }
    }
    //function to preload assets and store in respective variables
    async preloadAssets(allAssets: AssetItem[], cbPass: Function, onProgress: (progress: number) => void) {
        const totalAssets = allAssets.length;
        let loadedAssets = 0;
        const promises = allAssets.map(asset => {
            return new Promise<void>((resolve, reject) => {
                cc.resources.preload(asset.path, StringToAssetType.stringToAssetType(asset.assetType), (err) => {
                    if (err) {
                        cc.error(err);
                        reject(err);
                        return;
                    }
                    cc.resources.load(asset.path, StringToAssetType.stringToAssetType(asset.assetType), (err, resource) => {
                        if (err) {
                            cc.error(err);
                            reject(err);
                            return;
                        }
                        if (asset.assetType === 'sprite') {
                            this.symbolsData.push({
                                name: asset.name,
                                spriteFrame: resource as cc.SpriteFrame,
                                path: asset.path,
                                identifier: asset.identifier
                            });
                        }
                        loadedAssets++;
                        const progress = loadedAssets / totalAssets;
                        onProgress(progress); // Notify progress
                        resolve();
                    });
                });
            });
        });
    
        await Promise.all(promises);
        cbPass();
    }
    

    //function to shuffle the array
    async shuffleArray(array) {
        // Fisher-Yates Sorting Algorithm
        const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };
        return shuffle(array); // Directly return the result of shuffle
    }

    //function to assign frame to symbols in each column
    async assignSymbolsFrame(rollSymbolsChilds: cc.Node[]) {

        for (let i = 0; i < rollSymbolsChilds.length; i++) {
            const symbolNodes = rollSymbolsChilds[i].children;

            // Clone and shuffle the symbols data for the current column
            const columnSymbols = [...this.symbolsData];
            this.shuffleArray(columnSymbols);

            for (let j = 0; j < symbolNodes.length; j++) {
                // Ensure the symbol index is within the bounds of the shuffled columnSymbols
                const symbolIndex = j % columnSymbols.length;

                const sprite = symbolNodes[j].getComponent(cc.Sprite);
                if (sprite) {
                    sprite.spriteFrame = columnSymbols[symbolIndex].spriteFrame;
                }
            }
        }
    }

    //function to get visible sprite (not masked)
    async getVisibleSprite(symbols: cc.Node[][]) {
        const visibleSprite: string[][] = []; // Explicitly define the type as a 2D array of strings

        for (let i = 0; i < symbols.length; i++) {
            const rollSymbols = symbols[i]; // Each roll (e.g., Roll_0, Roll_1, Roll_2)

            if (!visibleSprite[i]) {
                visibleSprite[i] = []; // Ensure the subarray exists
            }

            for (let j = 0; j < 3; j++) {
                cc.log("In J");
                const symbol = rollSymbols[j];
                const sprite = symbol.getComponent(cc.Sprite);

                if (sprite && sprite.spriteFrame) {
                    visibleSprite[i].push(sprite.spriteFrame.name); // Push the name of the spriteFrame
                }
            }
        }
        const identifier = await this.mapSpriteIdentifier(visibleSprite);
        return identifier;
    }
    //mapping assets indentifier from their name
    async mapSpriteIdentifier(visibleSprite: string[][]) {
        const visibleSpriteIdentifier: number[][] = [];
        for (let i = 0; i < visibleSprite.length; i++) {
            const symbolNames = visibleSprite[i]; // Each roll (e.g., Roll_0, Roll_1, Roll_2)
            if (!visibleSpriteIdentifier[i]) {
                visibleSpriteIdentifier[i] = []; // Ensure the subarray exists
            }
            symbolNames.forEach(name => {
                const symbolData = this.symbolsData.find(symbol => symbol.name === name);
                if (symbolData) {
                    visibleSpriteIdentifier[i].push(symbolData.identifier);
                }
            });
        }
        return visibleSpriteIdentifier;
    }
    //change the sprite for win assets
    assignWinSymbols(symbols: cc.Node[][], result: cc.JsonAsset) {
        const winningConfig = result.json.winningConfig;

        // Loop through each roll in the winning configuration
        Object.entries(winningConfig).forEach(([rollKey, identifiers]) => {
            const rollIndex = parseInt(rollKey.split('_')[1]); // Extract roll index (e.g., "roll_0" -> 0)

            // Ensure the roll index is within the symbols array bounds
            if (rollIndex < symbols.length) {
                const rollSymbols = symbols[rollIndex]; // Get the symbols for this roll
                const winningIdentifiers = identifiers as number[]; // Get the winning identifiers for this roll

                // Loop through the identifiers and assign the spriteFrame
                for (let i = 0; i < winningIdentifiers.length; i++) {
                    const identifier = winningIdentifiers[i];
                    const symbol = rollSymbols[i]; // Get the corresponding symbol node
                    const sprite = symbol.getComponent(cc.Sprite); // Get the sprite component

                    // Find the matching SymbolAsset using the identifier
                    const matchingSymbol = this.symbolsData.find((data) => data.identifier === identifier);

                    if (sprite && matchingSymbol) {
                        sprite.spriteFrame = matchingSymbol.spriteFrame; // Assign the spriteFrame
                        // cc.log(`Updated SpriteFrame for roll_${rollIndex} index ${i} to ${matchingSymbol.name}`);
                    } else {
                        cc.warn(`No matching SymbolAsset found for identifier: ${identifier}`);
                    }
                }
            }
        });
    }

    //randomizing sprite when spinning (not used)
    randomSymbolAssign(symbols: cc.Node[]) {
        let randomSymbolNumber = 3;
        for (let i = 0; i < randomSymbolNumber; i++) {
            const randomSymbolIndex = this.getRandomNumber(symbols.length - 1);
            const randomSymbolDataIndex = this.getRandomNumber(this.symbolsData.length - 1);

            const sprite = symbols[randomSymbolIndex].getComponent(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = this.symbolsData[randomSymbolDataIndex].spriteFrame;
            }

            // cc.log(`Randomized symbol at index: ${randomSymbolIndex} with data index: ${randomSymbolDataIndex}`);
        }
    }

    //function to get random number between 0 and passed argument
    public getRandomNumber(max: number): number {
        return Math.floor(Math.random() * (max + 1));
    }


}
