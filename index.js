/*
    UnitedCatdom 2023
    DSMS-v1.2 license
*/



// ======================
// Import core modules

// const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");

// Filesystem access
const fs = require("fs");

// For password hashing
const sha256 = require("sha256");


// =========================
// Configure local server
const SERVER_PORT = JSON.parse(fs.readFileSync("./data/config.json")).server.port;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

// Create the server
const app = express();
app.use(express.static(__dirname + "/site"));

const server = app.listen(SERVER_PORT, 
() => {
    console.log(`Server listened on ${SERVER_URL}`);
});

// Configure socketio
const io = socketio(server);

// ==========================
// Handle HTTP requests

// index
// > redirect to dashboard
app.get("/", 
(req, res) => {
    res.redirect("/dashboard");
});

// dashboard AKA index
app.get("/dashboard", 
(req, res) => {
    renderHTML(res, "");
});

// login page
// app.get("/login", 
// (req, res) => {
//     renderHTML(res, "/login");
// });

// 
// Variables
// 
const
// PATHS
PATH_DIR_APPLICATIONS = "site/fs/applications/";

// Renderer functions
// render HTML file
function renderHTML(res, path) 
{
    res.sendFile(__dirname + "/site" + path + "/index.html");
}
// render plain text
function sendTEXT(res, text) 
{
    res.send(text);
}


// ====================================
function generateToken(length = 32) 
{
    let tkn = "";
    let _tk = "";

    while (true) {
        let str = Math.random().toString(36).substr(2);
        _tk = _tk + str;
        if (_tk.length > length) {
            for (let i = 0; i < length; i++) {
                tkn = tkn + _tk[i];
            };
            break;
        };
    };
    return tkn
}



// =============================
// Socket.io

// chat db
let SOCKET_CHAT = 
{
    "users": {},
    "messages": {}
}

// connected sockets
let SOCKET_CONNECTIONS = 
{};

// socket handler
io.on("connection", 
async (socket) => {
    // once the socket is connected
    // store the data in connections
    // variable
    SOCKET_CONNECTIONS[socket.id] = {
        "socket": socket
    };

    // on user connect request
    // aka login
    socket.on("login", 
    (username, password) => {
        onSocketConnected(socket, username, password);
    });

    // on user register request
    socket.on("register", 
    (username, password) => {
        onSocketRegister(socket, username, password);
    });

    // send the list of connections
    socket.on("list_connections", 
    (response_channel) => {
        let cons = SOCKET_CONNECTIONS;
        for (let i = 0; i < Object.keys(cons).length; i++)
        {
            let obj = Object.keys(cons)[i];
            delete cons[obj].token;
        };
        socket.emit(response_channel, (cons));
    });

    // suspend server
    socket.on("server_suspend", 
    async () => {
        server.close();
    });

    // on socket disconnected
    socket.on("disconnect", 
    () => {
        onSocketDisconnected(socket);
    });

    // 
    // DESKTOP FUNCTIONALITY
    // 

    // List all programs and fetch their metadata
    socket.on("get_programs_list", 
    (response_channel) => {
        let programs = {};
        let paths = fs.readdirSync(PATH_DIR_APPLICATIONS);
        paths.forEach(prog_dir => {
            let dat = JSON.parse(fs.readFileSync(PATH_DIR_APPLICATIONS + prog_dir + "/app.json"));
            dat.dirname = prog_dir;
            programs[dat.meta.id] = dat;
        });
        socket.emit(response_channel, programs);
    });
});

// generate user token
function generateUserToken(length) 
{
    let token = "";

    // iterate through connections
    // and store already used tokens
    let usedTokens = [];
    for (let i = 0; i < Object.keys(SOCKET_CONNECTIONS).length; i++)
    // obtain user's token
    {
        let con = SOCKET_CONNECTIONS[Object.keys(SOCKET_CONNECTIONS)[i]];
        let tkn = con.token;
        usedTokens.push(tkn);
    };
    // iterate through used tokens
    for (let i = 0; i < usedTokens.length; i++) 
    {
        // generate token
        let tkn = generateToken(length);

        let usedTkn = usedTokens[i];
        // compare tokens
        // regenerate if token is used
        if (tkn == usedTkn) tkn = generateToken(length);
        // save if token is clear
        else token = tkn;
    };
    // return the token
    return token
}

// check used ID
function checkIfIDused(id) 
{
    let res = 0;
    let newID = "";

    // iterate through database
    // and store already used IDs
    let usedIds = [];

    let users = fs.readdirSync("./data/users");
    for (let i = 1; i < users.length; i++)
    // obtain user's ID
    {
        let user_fileName = users[i-1];
        if (user_fileName.endsWith(".json"))
        {
            // let user = require("./data/users/" + user_fileName);
            let user = JSON.parse(fs.readFileSync("./data/users/" + user_fileName));
            let id = user.id;
            usedIds.push(id);
        };
    };
    // iterate through used IDs
    for (let i = 1; i < usedIds.length; i++) 
    {
        let usedId = usedIds[i-1];
        // compare IDs
        // set to 1 if ID is used
        if (id == usedId) res = 1;
        else res = 0;
    };
    // generate suggested ID
    for (let i = 1; i < usedIds.length; i++) 
    {
        // generate token
        let genId = generateToken(16);

        let usedId = usedId[i-1];
        if (usedId != genId)
        {
            newID = genId;
            break;
        };
    };
    // return the token
    return res, newID
}

// check login
function onSocketConnected(socket, username, password) 
{
    // save socket info
    SOCKET_CONNECTIONS[socket.id] = 
    {
        "socket": socket,
        "timestamp": 0,
        "user": {},
        "token": ""
    };

    // generate token
    let userToken = generateUserToken(32);

    SOCKET_CONNECTIONS[socket.id].token = userToken;

    // hash password
    let passhash = sha256(password);

    // get data and list of all users
    let users = fs.readdirSync("./data/users");
    // iterate through every user


    for (let i = 0; i < users.length; i++) 
    {
        let user_fileName = users[i];
        // obtain user data from file
        // let user = require("./data/users/" + user_fileName);
        let user = JSON.parse(fs.readFileSync("./data/users/" + user_fileName));

        // check if credentials are correct
        if (username == user.name ||
            username == user.id)
        {
            if (passhash == user.cred.pass) 
            {
                // if login successful
                // send data and token to user
                // and store user data into variable
                SOCKET_CONNECTIONS[socket.id].timestamp = new Date().getTime();
                SOCKET_CONNECTIONS[socket.id].user = user;
                socket.emit("login_successful", user, userToken);
            } 
            // send message on failed
            else socket.emit("login_failed", "INVALID_PASSWORD");
        } else socket.emit("login_failed", "INVALID_CREDENTIALS");
    };
}
// register socket
function onSocketRegister(socket, username, password) 
{
    // save socket info
    // SOCKET_CONNECTIONS[socket.id] = 
    // {
    //     "socket": socket,
    //     "timestamp": 0,
    //     "user": {
    //         "id": "",
    //         "name": "",
    //         "displayName": ""
    //     },
    //     "token": ""
    // };

    // generate id
    let userId = generateToken(16);
    let idUsed, newUserId = checkIfIDused(userId);
    if (idUsed == 1) userId = newUserId;

    // generate token
    let userToken = generateUserToken(32);

    SOCKET_CONNECTIONS[socket.id].token = userToken;

    // hash password
    let passhash = sha256(password);

    // save data into a dict
    let user = {
        "name": username,
        "displayName": username,
        "id": userId,
        "cred": {
            "pass": passhash
        },
        "image": "fs/system/icons/user.png",
        "config": {
            "desktop": {
                "wallpaper": "fs/system/images/wallpaper.png",
                "taskbar": {
                    "position": "top",
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

    // create user profile
    fs.writeFileSync("./data/users/" + userId + ".json", JSON.stringify(user));
    socket.emit("register_successful", true);
};

// on socket disconnected
function onSocketDisconnected(socket) 
{
    delete SOCKET_CONNECTIONS[socket.id];
}