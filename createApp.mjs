import fs from "fs";

import { run } from "./utilities.mjs";

const addDeployScript = async appName => {
  const pkgPath = `${appName}/package.json`;
  const pkg = JSON.parse(fs.readFileSync(pkgPath));
  pkg.scripts.deploy = `aws s3 sync build/ s3://${appName}`;

  const pkgJson = JSON.stringify(pkg, null, 2);
  fs.writeFileSync(pkgPath, pkgJson);
};

export const createApp = async appName => {
  console.log("CREATING YOUR REACT APP. THIS MIGHT TAKE A COUPLE MINUTES...");
  await run(`npx create-react-app ${appName}`);
  console.log("MODIFYING PACKAGE.JSON");
  await addDeployScript(appName);
};
