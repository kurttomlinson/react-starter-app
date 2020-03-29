#!/usr/bin/env node
import { createApp } from "./createApp.mjs";
import { deployApp } from "./deployApp.mjs";
import { getDirectories, getInput, run } from "./utilities.mjs";
import { setupCertificate } from "./setupCertificate.mjs";
import { setupS3 } from "./setupS3.mjs";

const main = async () => {
  const existingAppName = getDirectories("./").find(
    dir => ![".git", "node_modules"].includes(dir)
  );

  let appName = "";

  if (!existingAppName) {
    const domainName = await getInput(
      "Enter your app's domain name (e.g. www.google.com)",
      "www.pricerpro.uk"
    );
    appName = await getInput(
      "Enter your app's name (e.g. mini-app-tipping)",
      "mini-app-tipping"
    );

    await setupS3(appName);

    // create acm certificate
    await setupCertificate(domainName);

    // create hosted zone in route 53
    await run(
      `aws route53 create-hosted-zone --name ${domainName} --caller-reference ${Math.random()}`
    );

    // print name servers to be given to registrar

    // create record set in route53 / verify domain ownership with cname

    // create cloudfront distribution

    // create record set in route53 / direct traffic to cloudfront with cname

    // disable direct access to s3 (require traffic go through chosen domain name and cloudfront)

    await createApp(appName);
  } else {
    appName = existingAppName;
  }
  await deployApp(appName);
  return;
};

main();
