# Run on Red Hat OpenShift

This document shows how to run the application in a container running on Red Hat OpenShift.

## Prerequisites

You will need a running OpenShift cluster, or OKD cluster. You can provision [OpenShift on the IBM Cloud](https://cloud.ibm.com/kubernetes/catalog/openshiftcluster).

## Steps

1. [Create an OpenShift project](#1-create-an-openshift-project)
1. [Create the config map](#2-create-the-config-map)
1. [Get a secure endpoint](#3-get-a-secure-endpoint)
1. [Run the web app](#4-run-the-web-app)

## 1. Create an OpenShift project

* Using the OpenShift web console, select the `Application Console` view.

  ![console-options](https://raw.githubusercontent.com/IBM/pattern-utils/master/openshift/openshift-app-console-option.png)

* Use the `+Create Project` button to create a new project, then click on your project to open it.

* In the `Overview` tab, click on `Browse Catalog`.

  ![Browse Catalog](https://raw.githubusercontent.com/IBM/pattern-utils/master/openshift/openshift-browse-catalog.png)

* Choose the `Node.js` app container and click `Next`.

  ![Choose Node.js](https://raw.githubusercontent.com/IBM/pattern-utils/master/openshift/openshift-choose-nodejs.png)

* Give your app a name and add `https://github.com/IBM/virtual-insurance-assistant` for the github repo, then click `Create`.

  ![Add github repo](https://raw.githubusercontent.com/IBM/pattern-utils/master/openshift/openshift-add-github-repo.png)

## 2. Create the config map

* Click on the `Resources` tab and choose `Config Maps` and then click the `Create Config Map` button.
  * Provide a `Name` for the config map.
  * For each of the following key/value pairs, click `Add Item` to add the key, and then paste the value in the `Enter a value...` field.

Use the credentials and IDs that you gathered in the earlier steps.

| Key | Value |
| --- | --- |
| ASSISTANT_ID | <add_assistant_id> |
| ASSISTANT_URL | <add_assistant_url> |
| ASSISTANT_APIKEY | <add_assistant_apikey> |
| NATURAL_LANGUAGE_UNDERSTANDING_APIKEY | <add_nlu_apikey> |
| NATURAL_LANGUAGE_UNDERSTANDING_URL | <add_nlu_url> |
| NATURAL_LANGUAGE_UNDERSTANDING_MODEL_ID | <add_nlu_wks_model> |

If you are **NOT** using the search skill, configure Discovery the same way with the following information.

| Key | Value |
| --- | --- |
| DISCOVERY_APIKEY | <add_discovery_apikey> |
| DISCOVERY_URL | <add_discovery_url> |
| DISCOVERY_ENVIRONMENT_ID | <add_discovery_environment_id> |
| DISCOVERY_COLLECTION_ID | <add_discovery_collection_id> |

Create the config map and add it to your application.

* Hit the `Create` button.
* Click on your new Config Map's name.
* Click the `Add to Application` button.
* Select your application from the pulldown.
* Click `Save`.
* Go to the `Applications` tab, choose `Deployments` to view the status of your application.

## 3. Get a secure endpoint

* From the OpenShift or OKD UI, under `Applications` ▷ `Routes` you will see your app.
  * Click on the application `Name`.
  * Under `TLS Settings`, click on `Edit`.
  * Under `Security`, check the box for `Secure route`.
  * Hit `Save`.

## 4. Run the web app

* Under `Applications` ▷ `Routes` you will see your app. Click on the `Hostname` to see your application in action.
* Go back to the README.md for instructions on how to use the web app.

[![return](https://raw.githubusercontent.com/IBM/pattern-utils/master/deploy-buttons/return.png)](../../README.md#6-use-the-app)