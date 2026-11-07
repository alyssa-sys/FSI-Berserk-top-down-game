import { Color, DisplayMode, Engine, FadeInOut } from "excalibur";
import { loader } from "./config/resources";
import { MyLevel } from "./scenes/level";
import { GameOverScene } from "./scenes/game_over";



const game = new Engine({
  width: 800, // Largura lógica do jogo
  height: 600, // Altura lógica do jogo
  displayMode: DisplayMode.FitScreen, // Mantém a proporção 4:3 sem distorcer
  pixelArt: true, 
  backgroundColor: Color.Black,
  scenes: {
    start: MyLevel,
    gameover: GameOverScene
  }
  
});

game.start('start', { 
  loader, 
  inTransition: new FadeInOut({ 
    duration: 500,
    direction: 'in',
    color: Color.Black
  })
// }).then(() => {
//   // Do something after the game starts
});