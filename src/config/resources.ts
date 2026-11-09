import { ImageSource, Loader } from "excalibur";

export const Resources = {
  Sword: new ImageSource("./images/sword.png"),
  SmallBug: new ImageSource("./images/smallbug_sheet.png"),
  BigBug: new ImageSource("./images/bigbug_sheet.png"),
  PlayerSheet: new ImageSource("./images/player_sheet.png"),
  Heart: new ImageSource("./images/heart.png"),
  WindowFrame: new ImageSource('./images/window_frame.png'),

  //sprites das pastas
  Folder100: new ImageSource("./images/pasta_100.png"),
  Folder75: new ImageSource("./images/pasta_75.png"),
  Folder50: new ImageSource("./images/pasta_50.png"),
  Folder25: new ImageSource("./images/pasta_25.png"),
  Folder0: new ImageSource("./images/pasta_0.png"),

  // sprites de animacao do virus
  Virus1: new ImageSource("./images/virus-1.png"),
  Virus2: new ImageSource("./images/virus-2.png"),
  Virus3: new ImageSource("./images/virus-3.png"),
  Virus4: new ImageSource("./images/virus-4.png"),
  Virus5: new ImageSource("./images/virus-5.png"),
  Virus6: new ImageSource("./images/virus-6.png"),
} as const; 


export const loader = new Loader();
for (const res of Object.values(Resources)) {
  loader.addResource(res);
}