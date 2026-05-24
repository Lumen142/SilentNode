// import { ok, nok } from "./src/helper/returnService.js"

import { Select } from "./src/packages/QuestionService.js"

import figlet from "figlet"

import { sv_main, SetupServer } from "./apps/server.js"
import { cl_main } from "./apps/client.js"

async function main() {

    await figlet("SilentNode", function (err, data) {
        if (err) {
            console.error(err)
            process.exit(0)
        }
        console.log(data)
    })

    const answer = await Select("Client or Server", [
        {name:"client", message:"Client"},
        {name:"server", message:"Server"}
    ])

    if ( answer === "server" ) {
        SetupServer().then(info => {
            if (info != false) {
                sv_main(info)
            } else {
                process.exit(0)
            }
        })
    } else if ( answer === "client" ) {
        cl_main()
    }
}

main();