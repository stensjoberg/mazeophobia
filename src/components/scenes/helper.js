import { FontLoader } from "three";

export function getFont() {
    const floader = new FontLoader();
    const fontPromise = floader.loadAsync("src/components/fonts/Inconsolata_Condensed_SemiBold_Regular.json");
    fontPromise.then((font) => {
        console.log(font)
        return(font);
    });
}

export function isWithinRange (text, min, max) {
    // check if text is between min and max length
}
