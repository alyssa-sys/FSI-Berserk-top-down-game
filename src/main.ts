import { Color, DisplayMode, Engine, FadeInOut } from "excalibur";
import { loader } from "./config/resources";
import { MyLevel } from "./scenes/level";
import { GameOverScene } from "./scenes/game_over";



const game = new Engine({
  width: 800,  // Resolução fixa da arena
  height: 600,
  displayMode: DisplayMode.FitScreen, // Redimensiona o jogo proporcionalmente sem cortar
  pixelArt: true, 
  backgroundColor: Color.Black,
  scenes: {
    start: MyLevel,
    gameover: GameOverScene
  }
});

// força o viewport da câmera a se atualizar sempre que a janela for redimensionada
window.addEventListener('resize', () => {
  game.screen.applyResolutionAndViewport();
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