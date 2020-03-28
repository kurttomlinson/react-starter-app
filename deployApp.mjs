import { run } from "./utilities.mjs";

export const deployApp = async appName => {
  console.log("BUILDING REACT APP");
  await run(`cd ./${appName} && yarn build`);

  console.log("DEPLOYING REACT APP");
  await run(`cd ./${appName} && yarn deploy`);

  console.log(`http://${appName}.s3-website-us-east-1.amazonaws.com/`);
};
