import { ImageSource, Loader } from "excalibur";

export const Resources = {
  Sword: new ImageSource("./images/sword.png"),
  PlayerSheet: new ImageSource("./images/player_sheet.png"),
  Heart: new ImageSource("./images/heart.png"),
  BoldFont: new ImageSource("./images/BoldPixels.png"),
} as const; 


export const loader = new Loader();
for (const res of Object.values(Resources)) {
  loader.addResource(res);
}