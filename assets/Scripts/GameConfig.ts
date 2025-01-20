//config for game reel speeds
export type GameConfig = {
    speed: number
}

//Interface for json asset data
export interface AssetItem {
    name: string;
    path: string;
    assetType: string;
    identifier: number;
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
    identifier: number;
}

// export const winLine = [
//     [[0, 0], [1, 0], [2, 0]], // Bottom horizontal line
//     [[0, 1], [1, 1], [2, 1]], // Middle horizontal line
//     [[0, 2], [1, 2], [2, 2]], // Top horizontal line
//     [[0, 0], [1, 1], [2, 2]], // Bot left to top right diagoal
//     [[0, 2], [1, 1], [2, 0]]  // bot right to top left diagonal
// ];
export const winLine = [
    [0,0,0], // Bottom horizontal line
    [1,1,1], // Middle horizontal line
    [2,2,2], // Top horizontal line
    [0,1,2], // Bot left to top right diagoal
    [2,1,0]  // bot right to top left diagonal
];

export const audioType = {
    "bet":0, "ui":1, "rolling":2
}
export async function waitTime(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}