const express = require("express");
const router = express.Router();
const {
  getPublicToken,
  getAuth3LegCode,
  generateAuth3LegToken,
} = require("./oauth");
const { getDataInit, refreshToken } = require("./forgeApisBase");

router.post("/getDataInit", async (req, res, next) => {
  try {
    const payload = await getDataInit(
      req.body.token3legs,
      req.body.lpmProjectId
    );
    res.status(200).json(payload);
  } catch (err) {
    res.status(500).send("Error");
  }
});
router.get("/oauth/tokenForge_2Legs", async (req, res, next) => {
  try {
    const token = await getPublicToken();
    res.json({
      access_token: token.access_token,
      expires_in: token.expires_in,
    });
  } catch (err) {
    res.status(500).send("Error");
  }
});

router.get("/oauth/tokenForge_3LegsCode", async (req, res, next) => {
  try {
    const client_3Legs = await getAuth3LegCode();
    res.status(200).send(client_3Legs);
  } catch (error) {
    res.status(500).send("error");
  }
});

//get code from auth3Leg
router.get("/oauth/tokenForge_3Legs", async (req, res) => {
  var code  = req.query.code;
  try {
    if (code !== null) {
      const payload = await generateAuth3LegToken(code);
      res.render('autodeskRedirect', {accessToken : payload.data.access_token, refreshToken: payload.data.refresh_token, expireIn: payload.data.expires_in});
     // res.status(payload.status).send(payload.data);

    } else {
      res.status(200).send([]);
    }
  } catch (error) {
    res.status(500).send([]);
  }
});

router.get("/oauth/refreshToken", async (req, res) => {
  var refresh = req.query.refresh;
  const payload = await refreshToken(refresh);
  res.status(200).send(payload);
})

module.exports = router;
