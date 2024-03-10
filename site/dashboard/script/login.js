// Import modules
import * as root from "../script.mjs";
import * as wm from "./window.js";
import * as launcher from "./programlauncher.js";

import WinBox from "../../winbox/js/winbox.js";

// export var LOGIN_WINDOW = new WinBox();
export var LOGIN_WINDOW;

// Show the login screen
export function showScreen() 
{
    // Create iframe
    let frame = document.createElement("iframe");
    frame.src = "subsites/login/index.html";
    
    // Create window
    let winParams = 
    {
        modal: true
    };
    let win = wm.createWindow(winParams);
    LOGIN_WINDOW = win;

    win.addClass("modern");
    win.removeControl("wb-close");
    win.body.appendChild(frame);
    win.show();

    frame.onload = 
    () => {
        // while (true) 
        // {
        let form = frame.contentDocument.querySelector("table#form");

        let inUsername = form.querySelector("input#in_username");
        let inPassword = form.querySelector("input#in_password");
        
        let loginbtn = form.querySelector("button#btn_login");
        let registerbtn = form.querySelector("button#btn_register");

        let last_login_creds = window.localStorage.getItem("last_login_creds");
        if (last_login_creds)
        {
            last_login_creds = JSON.parse(last_login_creds);
            inUsername.value = last_login_creds.username;
            inPassword.value = last_login_creds.password;
        };
        
        loginbtn.onclick = 
        () => {
            socket.emit("login", inUsername.value, inPassword.value);
            window.localStorage.setItem("last_login_creds", JSON.stringify({"username": inUsername.value, "password": inPassword.value}));
        };
        registerbtn.onclick = 
        () => {
            socket.emit("register", inUsername.value, inPassword.value);
        };

        if (last_login_creds) loginbtn.click();

        //     if (form != null) break;
        // };
    };
}

socket.on("login_successful", 
(data, token) => {
    console.log(data);

    data.cred.token = token;
    root.setUser(data);
    // LOGIN_WINDOW.body.childNodes[0].remove();
    // LOGIN_WINDOW.close();
    root.updateDesktopEnv();
    wm.closeWindow(LOGIN_WINDOW);
    launcher._init();
});

socket.on("login_failed", 
(err) => {
    console.error(err);
});