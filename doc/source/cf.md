# Run on IBM Cloud with Cloud Foundry

This document shows how to run the application using Cloud Foundry on IBM Cloud.

[![Deploy to IBM Cloud](https://cloud.ibm.com/devops/setup/deploy/button_x2.png)](https://cloud.ibm.com/devops/setup/deploy?repository=https://github.com/IBM/virtual-insurance-assistant.git)

## Steps

1. Press the above `Deploy to IBM Cloud` button and then click on the `Delivery Pipeline` tool integration.

   ![cf-deploy](images/cf_deploy.png)

   * Create an API key by pressing the `New +` button located next to the `IBM Cloud API key` field and then `OK` in the pop-up.
   * Select your region, organization, and space (or use the defaults).
   * Click `Create` to start the deployment process.

2. From the Toolchains view, click on the `Delivery Pipeline` to watch while the app is deployed. Here you'll be able to see logs about the deployment.

3. Go back to your IBM Cloud resource list and click on the Cloud Foundry application named `virtual-insurance-assistant` with a timestamp suffix. Click on `Runtime environment` and add `ASSISTANT_ID`, `ASSISTANT_APIKEY` and `ASSISTANT_URL` with the values that you collected earlier. The app will restart with the new runtime environment.

## Run the web app

To see the app created and configured for this code pattern, use the IBM Cloud dashboard. The Cloud Foundry app is named `virtual-insurance-assistant` with a timestamp suffix. Click on the app and then click on `Visit App URL`.

Go back to the README.md for instructions on how to use the web app.

[![return](https://raw.githubusercontent.com/IBM/pattern-utils/master/deploy-buttons/return.png)](../../README.md#3-deploy-the-application)

<!-- TODO: link to "next" section when that is settled -->