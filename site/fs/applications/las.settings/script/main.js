// init collapsibles

document.addEventListener("DOMContentLoaded", () => {
    
    document.body.querySelectorAll("div.collapsible_content").forEach(div => {
        div.style.display = "none";
    });

    document.body.querySelectorAll("button.collapsible_btn").forEach(btn => {

        let contentNode = document.querySelector(`div.collapsible_content[name="${btn.name}"]`);

        btn.onclick = () => {
            contentNode.style.dispay = contentNode.style.dispay == "none" ? "block" : "none";
        };

    });

});