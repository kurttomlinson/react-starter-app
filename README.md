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
