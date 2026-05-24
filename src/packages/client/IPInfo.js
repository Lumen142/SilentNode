import { Form, Select } from '../QuestionService.js';

async function IPInfo() {
    let serverInfo = {
        ip: "localhost",
        port: 8080,
        ssl: false
    }

    let serverAddress = "http://localhost:8080"

    const form = await Form("Server Info", [
        { name: "ip", message: "Server IP?", initial: "localhost" },
        { name: "port", message: "Server Port?", initial: "8080" },
    ])

    serverInfo.ip = form.ip
    serverInfo.port = form.port
    serverInfo.ssl = await Select("Would you like to use SSL?", [{ name: "Yes." }, { name: "No." }])

    if (serverInfo.ssl == true) {
        serverAddress = `https://${serverInfo.ip}:${serverInfo.port}`
    } else {
        serverAddress = `http://${serverInfo.ip}:${serverInfo.port}`
    }

    return serverAddress;
}

export default {
    IPInfo
};
