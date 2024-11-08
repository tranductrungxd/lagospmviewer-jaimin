require("dotenv").config();
const cors = require("cors");

const SQL_LPM = require("./sql/sqlOperations");
const wirs = require('./wirs');

const express = require("express")
const bodyParser = require("body-parser")
const { response } = require('express');
const app = express()
const router = express.Router();
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
app.use('', router)

app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))

app.set('views', './views')
app.set('view engine', 'ejs')

router.use((request, response, next) => {
  next();
});

router.route("/").get(async (req, res) => {
  const payload = await new SQL_LPM().getWirs();
  res.render('index', { wirs: payload.data });
});

router.route("/deleteWirs").get(async (req, res) => {
  const payload = await new SQL_LPM().deleteWirs();
  res.render('index', { wirs: payload.data });
});

router.route("/wirs").get(async (req, res) => {
  try {
    const payload = await new SQL_LPM().getWirs();
    res.status(payload.status).send(payload.data);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

router.route("/wirs").post(async (req, res) => {
  try {
    const wir = req.body;
    const payload = await new SQL_LPM().createNewWIR(wir);

    switch (wir.inspectionType) {
      case "sbe":
        await new SQL_LPM().createNewSBE(wir, payload.id);
        break;
      case "swd":
        await new SQL_LPM().createNewSWD(wir, payload.id);
        break;
      default:
      // code block
    }

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("");
  }
});

router.route("/updateWir").post(async (req, res) => {
  try {
    const wir = req.query.wirid;
    const issueId = req.query.issueid;
    const payload = await new SQL_LPM().updateWir(wir,issueId);
    res.status(payload.status).send(payload.data);
  } catch (err) {
    console.log(err);
    res.redirect("");
  }
});

router.route('/getWir').get(async (req,res) => {
  try {
    var id = req.query.id;
    const payload = await new SQL_LPM().getSingleWir(id);
    res.status(payload.status).send(payload.data);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

router.route('/getWirChecklist').get(async (req,res) => {
  try {
    var id = req.query.id;
    var type = req.query.type;
    if(type=="sbe") {
      var table = "wir_insp_sand_blast";
    } else if(type=="swd") {
      var table = "wir_insp_sea_wall";
    } else {
      res.status(500).send("Error");
    }
    const payload = await new SQL_LPM().getSingleWirChecklist(id,table);
    res.status(payload.status).send(payload.data);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

router.route("/removeWir").get(async (req,res) => {
  var id = req.query.id;
  var type = req.query.type;
  
  const payload = await new SQL_LPM().removeWirById(id);

  if(type=="sbe") {
    await new SQL_LPM().removeWirChecklistById(id,"wir_insp_sand_blast");
  } else if(type=="swd") {
    await new SQL_LPM().removeWirChecklistById(id,"wir_insp_sea_wall");
  }

  res.status(payload.status).send(payload.data);

});

router.route("/getLatestIdWir").get(async (req,res) => {

  const payload = await new SQL_LPM().getLatestIdWir();
  res.status(payload.status).send(payload.data);

});

router.use("/forge", require("./forge/forgeApis"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
