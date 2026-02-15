// client

const getip = require("./packages/client/GetIP.js");

// packages

const inputService = require("./packages/InputService.js")
const questionService = require("./packages/QuestionService.js");

// libs

const io = require("socket.io-client");

const fs = require("fs");
const uuid = require("uuid");

// files

const errors = JSON.parse(fs.readFileSync("./status-codes/error.json", "utf-8"))
//const success = JSON.parse(fs.readFileSync("./status-codes/success.json", "utf-8"))

// main

async function main() {
    let serverAddress = await getip.getIP();

    const socket = io(serverAddress)

    // Login & Message Send

    let l = false;
    
    async function messageLoop() {
        while (true) {
            if (l == true) {
                inputService.clearLine();
                const answer = await inputService.newInput("Enter Message: ")
                socket.emit("message", {token : "123", msg : answer})
            }
        }
    }

    async function loginpanel() {
        const chose = await questionService.Select("Login or Register?", [{ name: "Login" }, { name: "Register" }])
        const examplePassword = uuid.v4();

        if (chose == "Register") {
            const form = await questionService.Form("Register Form", [
                { name: "username", message: "User name?", initial: "Alex" },
                { name: "pass", message: "Password", initial: examplePassword },
                { name: "pass_rep", message: "Password Confirm", initial: examplePassword }
            ])

            socket.emit("register", form, (response) => {
                if (response.type == "error" && errors[response.id]) {
                    inputService.printmsg(`Error: ${response.msg}`)
                    return loginpanel();
                } else {
                    l = true
                    inputService.printmsg(response.msg)
                    messageLoop();
                }
            })
        } else {
            const form = await questionService.Form("Login Form", [
                { name: "username", message: "User name?", initial: "Alex" },
                { name: "pass", message: "Password", initial: examplePassword },
            ])
            socket.emit("login", form, (response) => {
                if (response.type == "error" && errors[response.id]) {
                    inputService.printmsg(`Error: ${response.msg}`)
                    return loginpanel();
                } else {
                    l = true
                    inputService.printmsg(response.msg)
                    messageLoop();
                }
            })
        }
    }

    socket.on("connect", async () => {
        console.log(`Sunucuya bağlantı sağlandı. (${socket.id})`)

        await loginpanel()
    })

    socket.on("message", (data) => {
        inputService.printmsg(data)
    })

    socket.on("chatHistory", (data) => {
        data.forEach(message => {
            inputService.printmsg(message)
        });
    })

    // Login Procedures

    socket.on("success", (data) => {
        console.log(data)
    })

    socket.on("error", (data) => {
        console.log(data)
    })
}

main();
