import { Color, DisplayMode, Engine, FadeInOut } from "excalibur";
import { loader } from "./config/resources";
import { MyLevel } from "./scenes/level";


const game = new Engine({
  width: 800, // tamanho/resolução do jogo
  height: 600,
  displayMode: DisplayMode.FitScreenAndFill, 
  pixelArt: true,
  scenes: {
    start: MyLevel
  },
  
});

game.start('start', {
  loader, // tela de carregamento opcional
  inTransition: new FadeInOut({
    duration: 1000,
    direction: 'in',
    color: Color.ExcaliburBlue
  })
}).then(() => {

});