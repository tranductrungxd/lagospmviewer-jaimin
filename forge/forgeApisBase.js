const axios = require("axios");
const { HubsApi, ProjectsApi } = require("forge-apis");

const { getClient, getToken_2Legs } = require("./oauth");

const getHubs = async () => {
  try {
    const oauth_client = getClient();
    const oauth_token = await getToken_2Legs();
    const data = await new HubsApi().getHubs({}, oauth_client, oauth_token);
    return data.body.data;
  } catch (error) {
    return null;
  }
};

const getAllProjectInHub = async (hubId) => {
  try {
    const oauth_client = getClient();
    const oauth_token = await getToken_2Legs();

    const data = await new ProjectsApi().getHubProjects(
      hubId,
      {},
      oauth_client,
      oauth_token
    );
    return data.body.data;
  } catch (error) {
    return [];
  }
};

const refreshToken = async (refresh) => {
  try {
    if(refresh) {
      const url = `https://developer.api.autodesk.com/authentication/v1/refreshtoken`; 
      
      let req = {
          'client_id' : process.env.FORGE_CLIENT_ID, 
        	'client_secret' : process.env.FORGE_CLIENT_SECRECT,
        	'grant_type' : 'refresh_token',
        	'refresh_token' : refresh,
        	'scope' : 'data:read'
      };
      
      const payload = await axios.post(url, req, { headers : {'Content-Type' : 'application/x-www-form-urlencoded'} });
      return { status: payload.status, data: payload.data };
    }
  } catch (error) {
      console.log(error.response);
      return { status: error.response.status, data: [] };
  }
};

const getIssues = async (container_id, token) => {
  try {
    if (token) {
      const auth_token = "Bearer " + token;

      const configHeader = {
        headers: {
          Authorization: auth_token,
        },
      };

      const url = `https://developer.api.autodesk.com/issues/v2/containers/${container_id}/quality-issues?page[limit]=100`;
      const payload = await axios.get(url, configHeader);
      return { status: payload.status, data: payload.data };
    } else {
      return { status: 500, data: [] };
    }
  } catch (error) {
    return { status: error.response.status, data: [] };
  }
};

const getDataInit = async (token3Legs, lpmProjectId) => {
  try {
    //try to get hub
    const hubs = await getHubs();
    if (hubs && hubs.length) {
      const hubId = hubs[0].id;
      //get all projects in this hub
      const projects = await getAllProjectInHub(hubId);
      const project = projects.length
        ? projects.find((f) => f.attributes.name === "LagosPM")
        : null;
      const containerId = project ? project.relationships.issues.data.id : null;
      const projectId = project ? project.id : null;
      if (containerId) {
        //get snags
        const payloadSnags = await getSnags(lpmProjectId);
        // const dataBack = processDataSnag(payload.data.data, payloadSnags.data);
        return {
            status: 404,
            data: { hubId: null, projectId: null, containerId: null, snags: [] },
          };
        /*if (payloadSnags.status === 200) {
          return {
            status: payloadSnags.status,
            data: { hubId, containerId, projectId, snags: payloadSnags.data },
          };
        } else {
          //get token again
          return {
            status: payloadSnags.status,
            data: { hubId, containerId, projectId, snags: [] },
          };
        }*/
      } else {
        return {
          status: 404,
          data: { hubId: null, projectId: null, containerId: null, snags: [] },
        };
      }
    } else {
      return {
        status: 404,
        data: { hubId: null, projectId: null, containerId: null, snags: [] },
      };
    }
  } catch (error) {
    return {
      status: 500,
      data: { hubId: null, projectId: null, containerId: null, snags: [] },
    };
  }
};

module.exports = {
  getIssues,
  getDataInit,
  getHubs,
  getAllProjectInHub,
  refreshToken
};
