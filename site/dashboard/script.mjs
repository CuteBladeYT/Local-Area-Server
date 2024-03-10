// Import modules
import * as wm from "./script/window.js";
import * as tb from "./script/taskbar.js";
import * as loginjs from "./script/login.js";
import * as keybinds from "./script/keybinds.js";
import * as launcher from "./script/programlauncher.js";

import WinBox from "../winbox/js/winbox.js";

// Declare variables
export var DESKTOP = document.querySelector("div#app_desktop");
export var WM_ROOT = document.querySelector("div#app_windowmanager");

export var SCREEN_SIZE = {x:0,y:0};

// Set main loop
var MAINLOOP = setInterval(_MAINLOOP(), 1000);

// User data
export var USER = 
{
    "name": "",
    "displayname": "",
    "id": "",
    "cred": {
        "pass": "",
    },
    "image": "fs/system/icons/user.png",
    "config": {
        "desktop": {
            "wallpaper": "fs/system/images/wallpaper.png",
            "taskbar": {
                "position": "bottom",
                "height": 52,
                "programs": [],
                "tray": {
                    "width": 256
                }
            },
            "colors": {
                "theme": "dark",
                "accent": "#03fc03"
            }
        }
    }
};
export function setUser(data)
{
    USER = data;
}

// Update desktop env
export function updateDesktopEnv() 
{
    let data = USER;
    
    // theme
    if (data.config.desktop.colors.theme == "dark")
    {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    };
    
    // colors
    let colorstyle = document.createElement("style");
    colorstyle.innerText = `
        :root {
            --accent: ${data.config.desktop.colors.accent};
        }
    `;
    document.head.appendChild(colorstyle);
    // winbox height
    let winboxcss = document.createElement("style");
    document.head.appendChild(winboxcss);

    // wallpaper
    let wallpaper = DESKTOP.querySelector("img#wallpaper");
    wallpaper.src = data.config.desktop.wallpaper;

    // taskbar
    let taskbar = tb.TASKBAR
    taskbar.style.height = data.config.desktop.taskbar.height + "px";
    taskbar.style.display = "";
    
    if (data.config.desktop.taskbar.position == "top")
    {
        taskbar.style.top = "0";
    } else {
        taskbar.style.top = `calc(100% - ${taskbar.style.height})`;

        wallpaper.style.top = "0";
        wallpaper.style.height = taskbar.style.top;
        // taskbar.style.bottom = "0";
    };

    let tray = tb.TRAY;
    let tray_resize = tb.TRAY_ELEMENTS.tray_resize;
    let programList = tb.E_PROGRAMS;

    let screenWidth = SCREEN_SIZE.x;
    let screenHeight = SCREEN_SIZE.y;

    WM_ROOT.style.height = screenHeight - parseInt(taskbar.style.height) + "px";
    wm.updateWinBoxMaxHeight(parseInt(WM_ROOT.style.height));
    // winboxcss.innerText = `
    //     :root {
    //         --winbox-max-height: ${WM_ROOT.style.height};
    //     }
    // `;

    tray_resize.ondrag = 
    (e) => {
        let trayWidth = screenWidth - e.pageX;
        tray.style.width = `${trayWidth}px`;

        programList.style.width = `calc(100% - ${tray.style.width} - ${taskbar.style.height})`;
    };
    tray_resize.ondragend = tray_resize.ondrag;
    tray_resize.ondragend({pageX: screenWidth - data.config.desktop.taskbar.tray.width});
}   

// On document loaded
document.addEventListener("DOMContentLoaded", 
() => {
    tb._init();
    keybinds._init();
    loginjs.showScreen();
    launcher.hideLauncher();

    // let win = wm.createWindow({
    //     class: "modern"
    // });
    // tb.newProgram(win, "SUS");
    // win.setTitle("SUS");
    // win.show();
});


// Mainloop function
function _MAINLOOP() 
{
    // Update screen size info
    SCREEN_SIZE = {
        x: document.body.clientWidth,
        y: document.body.clientHeight
    };
}