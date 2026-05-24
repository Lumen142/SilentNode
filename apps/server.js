import { createServer } from "http";
import { Server } from 'socket.io';
import fs from 'fs/promises';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: { origin: "*" }
});

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import usermanager from "../src/packages/server/userManager.js";
import { Form, Select, Input } from "../src/packages/QuestionService.js";
import returnService from "../src/helper/returnService.js";

import { detect } from 'detect-port';

import chalk from "chalk";
import path from "path";

const colors = ['red', 'green', 'cyan']; // White and yellow are not recommended.

const prefix = chalk.yellow("[SilentNode]: ")

const chatHistoryBeta = []; // Chats are temporarily saved.
let clients = []

function timestamp() {
    const now = new Date();

    const year = String(now.getFullYear())
    const month = String(now.getMonth()).padStart(2, "0")
    const day = String(now.getDay()).padStart(2, "0")

    const h = String(now.getHours()).padStart(2, "0")
    const m = String(now.getMinutes()).padStart(2, "0")
    const s = String(now.getSeconds()).padStart(2, "0")
    return `[${day}:${month}:${year} - ${h}:${m}:${s}]`
}

async function SetupServer() {
    return new Promise(async (resolve, reject) => {
        const form = await Form("Server Form", [
            { name: "port", message: "Port", inital: "8080" }
        ])

        const port = Number(form.port)

        if (!isNaN(port)) {
            if (port > 1024 && port < 64000) {
                const iPort = await detect(port).then(e => e === port)

                if (!iPort) {
                    console.log(returnService.nok("The port you entered is in use."))
                    port = iPort // Start the server via the suggested port.
                }
            } else {
                console.log(returnService.nok("Please make sure the number you enter is greater than 1024 and less than 6400."))
                resolve(false)
            }
        } else {
            console.log(returnService.nok("Please enter a number."))
            resolve(false)
        }

        resolve(port)
    })
}

async function main(port) {
    let rawData = await fs.readFile(path.join(__dirname, "..", "src", "data", "users.json"), 'utf-8');
    let userData = JSON.parse(rawData);

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('message', (data) => {
            try {
                let clientInfo = clients.find(user => user.id == socket.id)
                if (!clientInfo) return;

                const msg = data.msg;
                if (msg.trim() == "") return;
                console.log(`${clientInfo.username}: ${msg}`);
                const formated = `${chalk[clientInfo.color](clientInfo.username)} ${chalk.yellow(timestamp())}: ${msg}`;
                socket.broadcast.emit('message', formated);
                chatHistoryBeta.push(formated);

            } catch (err) {
                console.log(err)
            }
        });

        socket.on('register', async (data, callback) => {
            try {
                const res = await usermanager.register(data, userData);

                if (res.type && res.type == "error") {
                    callback(res);
                    return;
                }

                const colorName = colors[Math.floor(Math.random() * colors.length)]

                userData[data.username] = res;
                clients.push(
                    {
                        "username": data.username,
                        "id": socket.id,
                        "color": colorName
                    }
                )

                callback({ id: 2, msg: "Registration completed." });

                socket.emit(`chatHistory`, chatHistoryBeta);
                socket.emit(`message`, `Your ID: ${socket.id}`);
            } catch (error) {
                console.log(error)
            }
        });

        socket.on('login', async (data, callback) => {
            let rawUser = userData[data.username];

            try {
                const res = await usermanager.login(data, userData, rawUser, clients);
                if (res != true) {
                    callback(res);
                    return;
                }

                const colorName = colors[Math.floor(Math.random() * colors.length)]

                clients.push(
                    {
                        "username": data.username,
                        "id": socket.id,
                        "color": colorName
                    }
                )

                callback({ type: "success", id: 1, msg: "Password compatible!" })
                socket.emit(`chatHistory`, chatHistoryBeta);
                socket.emit(`message`, `Your ID: ${socket.id}`);
            } catch (err) {
                console.log(err)
                callback({ id: 5, msg: 'An error occurred while confirming the password.' });
                return;
            }

        });

        socket.on('disconnect', () => {
            clients.filter(user => user.id == socket.id)
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    async function saveJSON() {
        await fs.writeFile(path.join(__dirname, "..", "src", "data", "users.json"), JSON.stringify(userData, null, 2))
        process.exit(0);
    }

    async function exitProgram() {
        await saveJSON();
    }

    ["SIGINT", "SIGQUIT", "SIGTERM"].forEach(e => {
        process.addListener(e, () => {
            exitProgram();
        })
    })

    httpServer.listen(port, () => {
        console.log("Server listen on port 8080");
    });
}

export {
    main as sv_main,
    SetupServer
};
