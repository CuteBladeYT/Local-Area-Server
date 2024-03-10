import * as room from "../script.mjs";

// Create the menu element
let menu = document.createElement("div");
document.addEventListener("DOMContentLoaded", () => {
    menu.id = "las_context_menu";
    document.body.appendChild(menu);

    document.body.addEventListener("click", (e) => {
        if (e.target != menu) {
            // menu.style.display = "none";
        };
    });
});


export function createCtx(position = {x: 0, y: 0}, buttons = []) {
    menu.childNodes.forEach(child => {
        menu.removeChild(child);
    });

    buttons.forEach(dat => {
        let btn = document.createElement("button");
        btn.innerText = dat.label;
        btn.onclick = dat.onclick;
        menu.appendChild(btn);
    });

    menu.style.top = position.y+"px";
    menu.style.left = position.x+"px";
    menu.style.display = "unset";
    menu.style.height = menu.clientHeight+"px";
}