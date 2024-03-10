// Import modules
import * as root from "../script.mjs";
import * as wm from "./window.js";
import * as paths from "./paths.js";
import * as tb from "./taskbar.js";
import * as ctx from "./contextmenu.js";

import WinBox from "../../winbox/js/winbox.js";

// Launcher variable(s)
export var launcher = new WinBox(
    {
        root: root.WM_ROOT,
        modal: true,
        title: "Launcher",
        icon: "fs/system/icons/app2.png",
        mount: document.body.querySelector("div#program_launcher"),
        class: "lasWindowStyle",
        id: "program_launcher"
    }
)

export var visible = !launcher.hidden;

export function _init()
{
    launcher.hide();
    launcher.removeControl("wb-close");
    launcher.addControl({
        index: 0,
        class: "wb-close",
        image: "winbox/img/close.svg",
        click: () => {
            hideLauncher();
        }
    });
    visible = !launcher.hidden;

    let panel = launcher.dom.querySelector(".wb-body > div > div#panel");
    let profile = panel.querySelector("div#profile");
    profile.querySelector("img").src = root.USER.image;
    profile.querySelector("span").textContent = root.USER.displayname;

    let actions = panel.querySelector("div#actions");
    actions.querySelector("button#settings").onclick = () => {};
    actions.querySelector("button#quit").onclick = () => window.close();
    actions.querySelector("button#restart").onclick = () => window.location.reload();
    actions.querySelector("button#stop_server").onclick = () => on_server_suspend();

    socket.emit("get_programs_list", "programlauncher__program_list");
}

export function showLauncher()
{
    launcher.move("20%", "10%");
    launcher.resize("60%", "80%");
    launcher.restore();
    launcher.show();
    launcher.focus();
    visible = !launcher.hidden;
}

export function hideLauncher()
{
    launcher.hide();
    visible = !launcher.hidden;
}

// export function addProgram(params)

export function on_server_suspend() {
    let win = wm.createWindow({
        modal: true,
        title: "Suspending",
        html: "<h2>Suspending server... Please wait.</h2>"
    });
    hideLauncher();
    win.show();
    socket.emit("server_suspend");

    setTimeout(() => {
        window.location.reload();
    }, 5000);
}

export function launch_program(data) {
    let meta = data.meta;
    let cfg = data.application;


    let win = wm.createWindow();
    win.setTitle(meta.name);
    win.id = meta.id;

    console.log(data);

    win.setUrl(paths.DIR_APPLICATIONS + data.dirname + "/" + cfg.executable);

    win.show();

    tb.newProgram(win, meta.name, cfg.icon);
};

// Update programs list
socket.on("programlauncher__program_list", (programs) => {
    let keys = Object.keys(programs);
    keys.forEach(prog_id => {
        let prog = programs[prog_id];
        let meta = prog.meta;
        let appcfg = prog.application;

        let prog_dir = prog.dirname;

        let btn = document.createElement("button");
        btn.id = prog_id;
        
        let img = document.createElement("img");
        img.src = 
            appcfg.icon.startsWith("~") 
            ? appcfg.icon 
            : paths.DIR_APPLICATIONS + prog_dir + "/" + appcfg.icon;

        appcfg.icon = img.src;
        
        let span = document.createElement("span");
        span.innerText = meta.name;

        btn.appendChild(img);
        btn.appendChild(span);
        
        // btn.onclick = () => { 
        //     hideLauncher();
        //     launch_program(prog);
        // };
        btn.onmousedown = (e) => {
            switch (e.which) {
                case 1: // LEFT BUTTON
                    hideLauncher();
                    launch_program(prog);
                    break;
                case 3: // RIGHT BUTTON
                    let buttons = [
                        {
                            "label": "Execute",
                            "onclick": launch_program.bind(null, prog)
                        }
                    ];
                    ctx.createCtx({x:e.pageX,y:e.pageY}, buttons);
                    break;
            };
        };
        // btn.oncontextmenu = (e) => {
        //     let buttons = [
        //         {
        //             "label": "Execute",
        //             "onclick": launch_program(prog)
        //         }
        //     ];
        //     ctx.createCtx({x:e.pageX,y:e.pageY}, buttons);
        // };
        // <button>
        //     <img src="fs/system/icons/app.png">
        //     <span>Program</span>
        // </button>

        launcher.body.querySelector("div#program_launcher > div#programs").appendChild(btn);
    });
});