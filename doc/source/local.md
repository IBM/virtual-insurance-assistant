# Run Locally

This document shows how to run the application using on your local machine.

## Steps

1. [Configure credentials](#1-configure-credentials)
1. [Run the application](#2-run-the-application)

### 1. Configure credentials

Copy the local `env.sample` file and rename it `.env`:

```bash
cp env.sample .env
```

Edit the `.env` file. Use the credentials and IDs that you gathered in the earlier steps. Uncomment the required settings and set the values.

#### `env.sample:`

```bash
# Copy this file to .env and replace the credentials with
# your own before starting the app.

# Watson Assistant
ASSISTANT_ID=<add_assistant_id>
ASSISTANT_URL=<add_assistant_url>
ASSISTANT_APIKEY=<add_assistant_apikey>

# # NLU for mechanic recommender
NATURAL_LANGUAGE_UNDERSTANDING_APIKEY=<add_nlu_apikey>
NATURAL_LANGUAGE_UNDERSTANDING_URL=<add_nlu_url>
NATURAL_LANGUAGE_UNDERSTANDING_MODEL_ID=<add_nlu_wks_model>

# # Watson Discovery (if not using the search skill)
# DISCOVERY_APIKEY=<add_discovery_apikey>
# DISCOVERY_URL=<add_discovery_url>
# DISCOVERY_ENVIRONMENT_ID=<add_discovery_environment_id>
# DISCOVERY_COLLECTION_ID=<add_discovery_collection_id>

# Run locally on a non-default port (default is 8080)
# PORT=8080
```

### 2. Run the application

1. Install [Node.js](https://nodejs.org/en/) runtime or NPM.
1. Start the app by running `npm install`, followed by `npm start`.
1. Use the chatbot at `localhost:8080`.
1. Go back to the README.md for instructions on how to use the web app.

[![return](https://raw.githubusercontent.com/IBM/pattern-utils/master/deploy-buttons/return.png)](../../README.md#6-use-the-app)