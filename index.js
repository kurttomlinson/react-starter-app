#!/usr/bin/env node

const prompt = require("prompt");
const colors = require("colors/safe");
const { exec } = require("child_process");
const fs = require("fs");

const getAppName = () => {
  return new Promise(resolve => {
    return resolve("mini-app-tipping");
    prompt.message = "";
    prompt.start();
    prompt.get(
      {
        properties: {
          name: {
            description: colors.white("New app name")
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

const run = command => {
  return new Promise(resolve => {
    exec(command, (error, stdout, stderr) => {
      console.log("command", command);
      if (error) {
        console.log("error", error);
        // return;
      }
      if (stderr) {
        console.log("stderr", stderr);
        // return;
      }
      console.log("stdout", stdout);
      resolve(stdout);
    });
  });
};

const createS3Bucket = async bucketName => {
  await run(`aws s3api create-bucket --acl public-read --bucket ${bucketName}`);
  await run(`aws s3 website s3://${bucketName}/ --index-document index.html`);

  let policyJson = JSON.stringify({
    Statement: [
      {
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: `arn:aws:s3:::${bucketName}/*`
      }
    ]
  });
  policyJson = JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "AllowPublicReadAccess",
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucketName}/*`]
      }
    ]
  });
  const policyCommand = `aws s3api put-bucket-policy --bucket ${bucketName} --policy '${policyJson}'`;
  console.log("policyCommand", policyCommand);
  await run(policyCommand);
};

const createReactApp = async appName => {
  console.log("Creating your react app. This might take a couple minutes...");
  await run(`npx create-react-app ${appName}`);
  console.log("before addDeployScript");
  await addDeployScript(appName);
};

const addDeployScript = async appName => {
  console.log("addDeployScript");
  const packagePath = `${appName}/package.json`;
  const package = JSON.parse(fs.readFileSync(packagePath));
  console.log("package", package);
  package.scripts.deploy = `aws s3 sync build/ s3://${appName}`;

  const packageJson = JSON.stringify(package, null, 2);
  fs.writeFileSync(packagePath, packageJson);
};

const main = async () => {
  // get subfolder name
  let appName = "tipping-mini-app";
  appName = "";

  // if there is no subfolder
  if (!appName) {
    // ask for an app name
    appName = await getAppName();
    console.log("appName", appName);
    // make an s3 bucket with that name
    await createS3Bucket(appName);
    // create react app
    await createReactApp(appName);
  }
  // build react app
  console.log("appName", appName);
  console.log("building react app");
  await run(`cd ./${appName} && yarn build`);

  // upload react app
  console.log("deploying react app");
  await run(`cd ./${appName} && yarn deploy`);

  // print link to react app
  console.log(`http://${appName}.s3-website-us-east-1.amazonaws.com/`);
};

main();
