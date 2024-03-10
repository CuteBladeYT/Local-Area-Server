import * as room from "../script.mjs";

// Create the menu element
let menu = document.body.querySelector("div#las_context_menu");
document.addEventListener("DOMContentLoaded", () => {
    menu = document.body.querySelector("div#las_context_menu");
    document.body.addEventListener("click", (e) => {
        if (
            e.pageX > menu.clientLeft + menu.clientWidth + 15 || 
            e.pageX < menu.clientLeft - 15 || 
            e.pageY > menu.clientTop + menu.clientHeight + 15 || 
            e.pageY < menu.clientTop - 15) {
                menu.style.display = "none";
        }
    });
});

export function hideCtx() {
    menu.style.display = "none";
}


export function createCtx(position = {x: 0, y: 0}, buttons = []) {
    menu.childNodes.forEach(child => {
        menu.removeChild(child);
    });

    buttons.forEach(dat => {
        let btn = document.createElement("button");
        btn.innerText = dat.label;
        btn.onclick = () => {
            dat.onclick();
            hideCtx();
        };
        menu.appendChild(btn);
    });

    menu.style.top = position.y+"px";
    menu.style.left = position.x+"px";
    menu.style.display = "unset";
    menu.style.height = menu.clientHeight+"px";
}