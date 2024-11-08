const {
  AuthClientThreeLeggedV2,
  AuthClientTwoLeggedV2,
} = require("forge-apis");

const config = require("../config");
const fs = require("fs");

function getClient() {
  const { client_id, client_secret } = config.credentials;

  return new AuthClientTwoLeggedV2(
    client_id,
    client_secret,
    config.scopes.internal,
    true
  );
}

async function getToken_2Legs() {
  try {
    const client = getClient();
    let credentials = await client.authenticate();
    return credentials;
  } catch (error) {
    console.log(error)
    return null;
  }
}

/**
 * Retrieves a 2-legged authentication token for preconfigured public scopes.
 * @returns Token object: { "access_token": "...", "expires_at": "...", "expires_in": "...", "token_type": "..." }.
 */
async function getPublicToken() {
  return getToken_2Legs();
}

async function getAuth3LegCode() {
  try {
    const scopes = config.scopes.internal;
    const { client_id, client_secret, callback_url } = config.credentials;
    const autoRefresh = true;
    const client_3Legs = new AuthClientThreeLeggedV2(
      client_id,
      client_secret,
      callback_url,
      scopes,
      autoRefresh
    );

    const authUrl = client_3Legs.generateAuthUrl();
    return { authUrl };
  } catch (error) {
    return null;
  }
}

async function generateAuth3LegToken(code) {
  try {
    const scopes = config.scopes.internal;
    const { client_id, client_secret, callback_url } = config.credentials;

    const autoRefresh = true;
    const client_3Legs = new AuthClientThreeLeggedV2(
      client_id,
      client_secret,
      callback_url,
      scopes,
      autoRefresh
    );
    const token = await client_3Legs.getToken(code);
    console.log(token)
    return { status: 200, data: token };
  } catch (error) {
    console.log(error);
    return { status: 500, data: null };
  }
}

module.exports = {
  getToken_2Legs,
  getClient,
  getPublicToken,
  getAuth3LegCode,
  generateAuth3LegToken,
};
