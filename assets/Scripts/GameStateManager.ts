//Gamestates
export enum GameState{
    Start=0,
    Ready=1,
    Rolling=2,
    Slowdown=3,
    Result=4,
    End=5
}
const { ccclass, property } = cc._decorator;

//function to handle GameStates
@ccclass
export default class GameStateManager extends cc.Component {

    public static currentGameState: GameState = GameState.Start;

    //function to set current GameState
    public static setCurrentGameState(gameState: GameState){
        this.currentGameState = gameState;
    }

}