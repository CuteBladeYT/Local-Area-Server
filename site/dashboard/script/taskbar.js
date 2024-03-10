// Import modules
import * as root from "../script.mjs";
import * as wm from "./window.js";
import * as launcher from "./programlauncher.js";

import WinBox from "../../winbox/js/winbox.js";

// DOM elements
export var TASKBAR = document.body.querySelector("div#taskbar");
export var META_BUTTON = TASKBAR.querySelector("button#meta");
export var E_PROGRAMS = TASKBAR.querySelector("div#programs");
export var TRAY = TASKBAR.querySelector("div#tray");
export var TRAY_ELEMENTS = 
{
    "tray_resize": TRAY.querySelector("div#tray_resize"),
    "clock": {
        "time": TRAY.querySelector("div#clock > span:nth-child(1)"),
        "date": TRAY.querySelector("div#clock > span:nth-child(2)")
    },
    "notif": TRAY.querySelector("div#notif")
};

// Variables
export var PROGRAMS = {};

// Clock
export var CLOCK_INTERVAL

// Initialize the functionality
export function _init() 
{
    // Meta button
    META_BUTTON.onclick = 
    () => {
        launcher.showLauncher();
    };

    // Clock
    CLOCK_INTERVAL = 
    setInterval(
    () => {
        let d = new Date();
        
        let fmt = 
        (number) => {
            return number.toLocaleString("en-US", {minimumIntegerDigits: 2, useGrouping: false});
        };

        let time = 
        {
            "h": fmt(d.getHours()),
            "m": fmt(d.getMinutes()),
            "s": fmt(d.getSeconds())
        };

        let date = 
        {
            "d": fmt(d.getDate()),
            "m": fmt(d.getMonth()+1),
            "y": fmt(d.getFullYear())
        };

        TRAY_ELEMENTS.clock.time.textContent = 
        `${time.h}:${time.m}:${time.s}`;

        TRAY_ELEMENTS.clock.date.textContent = 
        `${date.d}.${date.m}.${date.y}`;
    }, 1000);
}

export function newProgram(window = new WinBox(), name, icon = "fs/system/icons/app.png") 
{
    PROGRAMS[window.id] = 
    {
        "name": name,
        "icon": icon,
        "id": window.id,
        "win": window
    };

    let btn = document.createElement("button");
    btn.className = window.id;
    btn.classList.add("open");
    btn.title = name;

    btn.onclick = 
    () => {
        if (window.min == true || window.hidden == true)
        {
            wm.showWindow(window);
        } else {
            wm.hideWindow(window, true);
        };
    };

    window.onminimize = 
    () => {
        btn.classList.contains("focus") ? btn.classList.remove("focus") : 0;
    };
    window.onhide = window.onminimize;
    window.onrestore = 
    () => {
        btn.classList.contains("focus") ? 0 : btn.classList.add("focus");
    };
    window.onshow = window.onrestore;
    window.onclose = 
    () => {
        btn.remove();
    };

    let img = document.createElement("img");
    img.src = icon;
    img.draggable = false;

    btn.appendChild(img);

    E_PROGRAMS.appendChild(btn);
}