const questionService = require("../packages/QuestionService.js");

async function getIP() {
    let serverInfo = {
        ip: "localhost",
        port: 8080,
        ssl: false
    }

    let serverAddress = "http://localhost:8080"

    const form = await questionService.Form("Server Info", [
        { name: "ip", message: "Server IP?", initial: "localhost" },
        { name: "port", message: "Server Port?", initial: "8080" },
    ])

    serverInfo.ip = form.ip
    serverInfo.port = form.port
    serverInfo.ssl = await questionService.Select("Would you like to use SSL?", [{ name: "Yes." }, { name: "No." }])

    if (serverInfo.ssl == true) {
        serverAddress = `https://${serverInfo.ip}:${serverInfo.port}`
    } else {
        serverAddress = `http://${serverInfo.ip}:${serverInfo.port}`
    }

    return serverAddress;
}

module.exports = {
    getIP
}
