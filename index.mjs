#!/usr/bin/env node

import prompt from "prompt";
import colors from "colors";
import { readdirSync } from "fs";

import { createApp } from "./createApp.mjs";
import { deployApp } from "./deployApp.mjs";
import { run } from "./utilities.mjs";

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

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

const setupCertificate = async domainName => {
  const requestCertificateResult = JSON.parse(
    await run(
      `aws acm request-certificate --domain-name ${domainName} --validation-method DNS`
    )
  );
  console.log("requestCertificateResult", requestCertificateResult);
  const certificateArn = requestCertificateResult.CertificateArn;
  // {
  //   "CertificateArn": "arn:aws:acm:us-east-1:541693649649:certificate/b2a92b12-6649-4601-9891-6accd3fbc340"
  // }

  let cnameName;
  let cnameValue;
  let retryCount = 0;
  while ((!cnameName || !cnameValue) && retryCount < 10) {
    try {
      const describeCertificateResult = JSON.parse(
        await run(
          `aws acm describe-certificate --certificate-arn ${certificateArn}`
        )
      );
      cnameName =
        describeCertificateResult.Certificate.DomainValidationOptions[0]
          .ResourceRecord.Name;
      cnameValue =
        describeCertificateResult.Certificate.DomainValidationOptions[0]
          .ResourceRecord.Value;
    } catch (e) {}
    retryCount++;
  }
  console.log("cnameName", cnameName);
  console.log("cnameValue", cnameValue);
  // create cname record for certificate verification
  // aws route53 change-resource-record-sets --hosted-zone-id Z1R8UBAEXAMPLE --change-batch file://C:\awscli\route53\change-resource-record-sets.json
};

const main = async () => {
  // get subfolder name
  const existingAppName = getDirectories("./").find(
    dir => ![".git", "node_modules"].includes(dir)
  );
  console.log("existingAppName", existingAppName);
  // let appName = "tipping-mini-app";
  let appName = "";
  const domainName = "www.pricerpro.uk";

  if (!existingAppName) {
    appName = await getAppName();
    await createS3Bucket(appName);

    // create hosted zone in route 53
    await run(
      `aws route53 create-hosted-zone --name ${domainName} --caller-reference ${Math.random()}`
    );

    // print name servers
    // create record set in route 53

    // create acm certificate
    await setupCertificate(domainName);
    // create cloudfront distribution

    await createApp(appName);
  } else {
    appName = existingAppName;
    console.log("main -> appName", appName);
  }
  await deployApp(appName);
  return;
};

main();
