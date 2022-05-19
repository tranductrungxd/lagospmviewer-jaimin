// Autodesk Forge configuration
module.exports = {
  // Set environment variables or hard-code here
  credentials: {
    client_id: process.env.FORGE_CLIENT_ID,
    client_secret: process.env.FORGE_CLIENT_SECRECT,
    callback_url:
      process.env.NODE_ENV === "production"
        ? process.env.FORGE_CALLBACK_URL_BUILD
        : process.env.FORGE_CALLBACK_URL_DEV,
  },
  scopes: {
    // Required scopes for the server-side application
    internal: [
      "bucket:create",
      "bucket:read",
      "bucket:delete",
      "data:read",
      "data:create",
      "data:write",
      "account:read",
      "viewables:read",
      "data:search",
    ],
    // Required scope for the client-side viewer
    public: ["viewables:read", "data:read", "bucket:read", "data:search"],
  },
};
