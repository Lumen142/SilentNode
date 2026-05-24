import readline from 'node:readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function newInput(title) {
    return new Promise(resolve => {
        rl.question(title, answer => {
            resolve(answer);
        });
    });
}

function closeInput() {
    rl.close();
}

function clearLine() {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
}

function printmsg(msg) {
    clearLine();
    console.log(msg);
    rl.prompt(true);
}

export default {
    newInput,
    closeInput,
    printmsg,
    clearLine
};
