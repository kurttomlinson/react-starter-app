import { exec } from "child_process";

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
