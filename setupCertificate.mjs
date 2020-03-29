import { run } from "./utilities.mjs";

export const setupCertificate = async domainName => {
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