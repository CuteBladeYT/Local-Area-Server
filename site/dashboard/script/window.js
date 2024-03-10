// Import modules
import * as root from "../script.mjs";
import * as tb from "./taskbar.js";

import WinBox from "../../winbox/js/winbox.js";

// Store all windows in a variable
var WINDOWS = {};
var WinBoxMaxHeight = 0;

// Update max height
export function updateWinBoxMaxHeight(height) {
    WinBoxMaxHeight = height;
}

// Create a window
export function createWindow(params = {}) 
{
    params["root"] = root.WM_ROOT;
    let win = new WinBox(params);
    WINDOWS[win.id] = win;

    win.addClass("lasWindowStyle");

    win.maxheight = WinBoxMaxHeight;

    win.move("center", "center");

    win.removeControl("wb-full");

    return win
}

export function closeWindow(window, force = false)
{
    let res = 1;
    for (let i = 0; i < Object.keys(WINDOWS).length; i++) 
    {
        let winID = Object.keys(WINDOWS)[i];
        if (WINDOWS[winID] == window) 
        {
            res = 0;
            window.body.remove();
            window.close(force);
            delete WINDOWS[winID];
            break;
        };
    };
    return res
}

export function showWindow(window) 
{
    let keys = Object.keys(WINDOWS);
    for (let i = 0; i < keys.length; i++) 
    {
        let winID = keys[i];
        let win = WINDOWS[winID];
        let winFound = false;
        if (typeof(window) == "string")
        {
            if (window == winID)
            {
                winFound = true;
            };
        } else {
            if (window == win)
            {
                winFound = true;
            };
        };
        if (winFound == true)
        {
            win.restore();
            win.focus();
            break;
        };
    };
}

export function hideWindow(window, minimize = true) 
{
    let keys = Object.keys(WINDOWS);
    for (let i = 0; i < keys.length; i++) 
    {
        let winID = keys[i];
        let win = WINDOWS[winID];
        let winFound = false;
        if (typeof(window) == "string")
        {
            if (window == winID)
            {
                winFound = true;
            };
        } else {
            if (window == win)
            {
                winFound = true;
            };
        };
        if (winFound == true)
        {
            if (minimize == true)
            {
                win.minimize();
            } else {
                win.hide();
            };
            break;
        };
    };

}