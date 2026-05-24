// client

import IPInfo from "../src/packages/client/IPInfo.js"

// packages

import inputService from "../src/packages/InputService.js"
import { Select, Form, Input } from "../src/packages/QuestionService.js"

// libs

import path from 'path'

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { io } from "socket.io-client"
import readline from 'node:readline'

import fs from "fs"
import { v4 as uuid } from "uuid"

// files

const errors = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/status-codes/error.json'), 'utf-8')
);
//const success = JSON.parse(fs.readFileSync("./status-codes/success.json", "utf-8"))

// main

async function main() {
    let serverAddress = await IPInfo.IPInfo();

    const socket = io(serverAddress)

    // Login & Message Send

    let l = false;
    
    async function messageLoop() {
        while (true) {
            if (l == true) {
                inputService.clearLine();
                const answer = await inputService.newInput("Enter Message: ")
                process.stdout.moveCursor(0,-1);
                process.stdout.cursorTo(0);
                process.stdout.clearLine(0);
                socket.emit("message", {msg : answer})
            }
        }
    }

    async function loginpanel() {
        const chose = await Select("Login or Register?", [{ name: "Login" }, { name: "Register" }])
        const examplePassword = uuid();

        if (chose == "Register") {
            const form = await Form("Register Form", [
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
            const form = await Form("Login Form", [
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

export {main as cl_main}