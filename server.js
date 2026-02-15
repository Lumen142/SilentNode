const { createServer } = require("http");
const { Server } = require('socket.io');
const fs = require('fs').promises;

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: { origin: "*" }
});

const usermanager = require("./packages/server/userManager.js");

const chatHistoryBeta = []; //for beta
let clients = []

async function main() {
    let rawData = await fs.readFile("./users.json", 'utf-8');
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
                const formated = `${clientInfo.username}: ${msg}`;
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

                userData[data.username] = res;
                clients.push(
                    {
                        "username": data.username,
                        "id": socket.id
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

                clients.push(
                    {
                        "username": data.username,
                        "id": socket.id
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
        await fs.writeFile("users.json", JSON.stringify(userData, null, 2))
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

    httpServer.listen(8080, () => {
        console.log("Server listen on port 8080");
    });
}

main();
