import { exec } from "child_process";
import { readdirSync } from "fs";
import colors from "colors";
import prompt from "prompt";

export const run = command => {
  return new Promise(resolve => {
    exec(command, (error, stdout, stderr) => {
      console.log("COMMAND", command);
      if (error) {
        console.log("ERROR", error);
        // return;
      }
      if (stderr) {
        console.log("STDERR", stderr);
        // return;
      }
      console.log("STDOUT", stdout);
      resolve(stdout);
    });
  });
};

export const getDirectories = path =>
  readdirSync(path, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

export const getInput = (question, answer) => {
  return new Promise(resolve => {
    if (answer) {
      return resolve(answer);
    }
    prompt.message = "";
    prompt.start();
    prompt.get(
      {
        properties: {
          name: {
            description: colors.white(question)
          }
        }
      },
      function(err, result) {
        console.log("err", err);
        resolve(result.name);
      }
    );
  });
};
