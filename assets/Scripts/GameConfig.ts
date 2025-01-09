//config for game reel speeds
export type GameConfig = {
    speed: number
}

//Interface for json asset data
export interface AssetItem {
    name: string;
    path: string;
    assetType: string;
    identifier : number;
}

//Interface for json asset data
export interface AssetData {
    [key: string]: AssetItem[];  // Dynamic keys like spineData, audioData
}

//Interface for json asset data
export interface SymbolAsset {
    name: string;
    spriteFrame: cc.SpriteFrame;
    path: string;
    identifier : number;
}