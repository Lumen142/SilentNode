const template = () => ({
    "success": true,
    "content": ""
})

function ok(description) {
    let newReturn = template()
    newReturn.success = true
    newReturn.content = description

    return newReturn
}

function nok(description) {
    let newReturn = template()
    newReturn.success = false
    newReturn.content = description

    return newReturn
}

export default {ok, nok};
