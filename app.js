require("dotenv").config();

const SQL_LPM = require("./sql/sqlOperations");
var wirs = require('./wirs');

const express = require("express")
var bodyParser = require("body-parser")
var cors = require("cors");
const { response } = require('express');
const app = express()
var router = express.Router();
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
        // code block
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

router.use("/forge", require("./forge/forgeApis"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
