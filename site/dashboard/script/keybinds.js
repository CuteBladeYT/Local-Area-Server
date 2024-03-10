// Import modules
import * as root from "../script.mjs";

import * as launcher from "./programlauncher.js";

export function _init() 
{
    document.addEventListener("keyup", 
    (event) => {
        // console.log(event.key);
        switch (event.key)
        {
            case "Meta":
                if (launcher.visible == true)
                {
                    launcher.hideLauncher();
                } else launcher.showLauncher();
        }
    });
}