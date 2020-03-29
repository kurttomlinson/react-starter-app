import { run } from "./utilities.mjs";

export const setupS3 = async bucketName => {
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
