import { ImageSource, Loader } from "excalibur";

export const Resources = {
  Sword: new ImageSource("./images/sword.png"),
  SmallBug: new ImageSource("./images/smallbug_sheet.png"),
  BigBug: new ImageSource("./images/bigbug_sheet.png")
} as const; 


export const loader = new Loader();
for (const res of Object.values(Resources)) {
  loader.addResource(res);
}