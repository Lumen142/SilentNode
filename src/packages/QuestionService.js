import enquirer from "enquirer"
const { Select, Form, Input } = enquirer

async function InputFunc(title) {
  const promptInstance = new Input({
    name: 'answer',
    message: title
  });

  const response = await promptInstance.run();

  process.stdin.setRawMode(false);
  process.stdin.resume();

  return response; 
}

async function SelectFunc(title, choices) {
  const promptInstance = new Select({
    name: 'answer',
    message: title,
    choices: choices
  })

  const response = await promptInstance.run();

  process.stdin.setRawMode(false);
  process.stdin.resume();
  return response;
}

async function FormFunc(title, choices) {
  const promptInstance = new Form({
    name : "answer",
    message : title,
    choices : choices
  })

  const response = await promptInstance.run();

  process.stdin.setRawMode(false);
  process.stdin.resume();
  return response;
}

export { InputFunc as Input, FormFunc as Form, SelectFunc as Select };