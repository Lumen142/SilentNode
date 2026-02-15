const argon2 = require('argon2');

async function login(data, userData, rawUser, clients) {
    if (!userData[data.username]) {
        return { type: "error", id: 4, msg: 'User not found.' };
    }

    if (await argon2.verify(rawUser.pass, data.pass)) {
        if (clients.find(user => user.username == data.username)) {
            return { type: "error", id: 6, msg: "This user is already active." }
        }
    }

    return true;
}

module.exports = {
    login
}
