const argon2 = require('argon2');
const { v4: uuidv4 } = require('uuid');

async function register(data, userData) {
    try {
        const { username, pass, pass_rep } = data;
        if (userData[username]) {
            return { type : "error", id: 1, msg: "The user is already registered." };
        }

        if (pass !== pass_rep) {
            return { type : "error", id: 2, msg: `The passwords aren't the same!` };
        }

        const hashedPass = await argon2.hash(pass);
        const uuid = uuidv4();
        let userX = {
            pass: hashedPass,
            uuid: uuid,
        };

        return userX;
    } catch (err) {
        console.log(err);
        return { id: 3, msg: `Hash failed.` }
    }
}

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
    login,
    register
}
