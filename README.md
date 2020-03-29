# What is this?

react-start-app is a script that creates and deploys a react app to S3 with a minimal amount of interaction.

# Prerequsities

1. In AWS IAM, create a user with "Programmatic Access" and "Administrator Access". Record the user's "Access key ID" and "Secret access key".
2. Install awscli: `brew install awscli`.
3. Run `aws configure` Enter the "Access key ID" and "Secret access key" from step 1. Enter "us-east-1" for the default region name and "json" for the default output format.
4. Install Node.js and Yarn: `brew install yarn`.

# Usage

1. Duplicate this repository.
2. Run `node --experimental-modules index.mjs` to create and deploy an empty React app to S3.
3. Run `node --experimental-modules index.mjs` whenever you want to update your deployed React app with your changes.

# What does this script do?

- First run only:
  - Creates an S3 bucket with the same name as your app.
  - Gives the bucket public read access.
  - Configures the bucket to serve a static website.
  - Requests a certificate from Amazon Certificate Management (ACM).
  - Creates a hosted zone in Route 53 to manage DNS settings for your domain.
  - Prints the nameservers to be used for your domain. (These need to be given to your domain registrar).
  - Creates a CNAME record in Route 53 to verify ownership of your domain to ACM.
  - Creates a Cloudfront distributions to serve content from the S3 bucket with the certificate that was just created.
  - Creates a CNAME record in Route 53 to direct traffic from your domain to the Cloudfront distribution.
  - Disables direct access to the S3 bucket, so the bucket can only be accessed through your domain and Cloudfront.
  - Creates a React application with creat-react-app.
  - Adds a `deploy` script to the React application's package.json file that syncs the applications `build` folder to the S3 bucket.
- Every run:
  - Builds and deploys the React application.

# To be added

- React snapshot
- Styled components
