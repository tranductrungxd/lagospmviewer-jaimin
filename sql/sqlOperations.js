const sql = require("mssql");
const { pools } = require("./configDB");

class SQL_LPM {
  //get drawings by Id
  async getWirs() {
    return new Promise(async (resolve) => {
      try {
        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);

        request
          .execute("GetAllWirs")
          .then((result) => {
            resolve({ status: 200, data: result.recordset });
          })
          .catch((err) => {
            console.log("Error occurred during GetAllWirs " + err);
            resolve({ status: 500, data: [] });
          });
      } catch (error) {
        console.log(error);
      }
    });
  }
  async getPunch(punchId) {
    return new Promise(async (resolve) => {
      try {
        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);
        request.input("PunchID", sql.Int, punchId);

        request
          .execute("PunchList_Bim360_Select_Id")
          .then((result) => {
            resolve({ status: 200, data: result.recordset });
          })
          .catch((err) => {
            console.log("lineeeeeeeeeeeee PunchList_Bim360_Select_Id " + err);
            resolve({ status: 500, data: [] });
          });
      } catch (error) {
        console.log(error);
      }
    });
  }
  async deletePunchList(projectId, punchId) {
    return new Promise(async (resolve) => {
      try {
        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);
        request.input("ProjectID", sql.Int, projectId);
        request.input("PunchID", sql.Int, punchId);

        request
          .execute("PunchList_Bim360_Delete")
          .then((result) => {
            resolve({ status: 200, message: "success" });
          })
          .catch((err) => {
            console.log("lineeeeeeeeeeeee PunchList_Bim360_Delete " + err);
            resolve({ status: 500, message: "error" });
          });
      } catch (error) {
        console.log(error);
      }
    });
  }
  async getContracts(projectId) {
    return new Promise(async (resolve) => {
      try {
        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);
        request.input("DBprojectId", sql.Int, projectId);
        request
          .execute("Contract_Bim360_Select_ByProject")
          .then((result) => {
            resolve({ status: 200, data: result.recordset });
          })
          .catch((err) => {
            console.log(
              "lineeeeeeeeeeeee Contract_Bim360_Select_ByProject " + err
            );
            resolve({ status: 500, data: [] });
          });
      } catch (error) {
        console.log(error);
      }
    });
  }
  async getItemNumber(projectId) {
    return new Promise(async (resolve) => {
      try {
        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);
        request.input("ProjectId", sql.Int, projectId);
        request
          .execute("PunchList_Bim360_Select_GetNumber")
          .then((result) => {
            const itemnumber = result.recordset[0].result + 1;
            const punchId = result.recordset[1].result + 1;
            resolve({ status: 200, data: { itemnumber, punchId } });
          })
          .catch((err) => {
            console.log(
              "lineeeeeeeeeeeee PunchList_Bim360_Select_GetNumber " + err
            );
            resolve({ status: 500, data: [] });
          });
      } catch (error) {
        console.log(error);
      }
    });
  }
  createNewWIR = async (wir) => {
    return new Promise(async (resolve) => {
      try {
        const {
          dateOfTesting,
          timeOfTesting,
          locationOfTesting,
          structure,
          typeOfStructure,
          rdNo,
          statementRef,
          consent,
          yesConsent,
          noConsent,
          reviewNot,
          inspectionType
        } = wir;
       
        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);
        request.input("dateOfTesting", sql.VarChar(50), dateOfTesting);
        request.input("timeOfTesting", sql.VarChar(50), timeOfTesting);
        request.input("locationOfTesting", sql.VarChar(50), locationOfTesting);
        request.input("structure", sql.VarChar(50), structure);
        request.input("typeOfStructure", sql.VarChar(50), typeOfStructure);
        request.input("rdNo", sql.VarChar(50), rdNo);
        request.input("statementRef", sql.VarChar(50), statementRef);
        request.input("consent", sql.Int, consent);
        request.input("yesConsent", sql.Int, yesConsent);
        request.input("noConsent", sql.Int, noConsent);
        request.input("reviewNot", sql.Int, reviewNot);
        request.input("inspectionType", sql.VarChar(50), inspectionType);
        request
          .execute("Wir_Write_New")
          .then(() => {
            resolve({ status: 200, message: "success" });
          })
          .catch((err) => {
            console.log(err);
            resolve({ status: 500, message: "server failed" });
          });
      } catch (err) {
        resolve({ status: 500, message: "server failed" });
        console.log("lineeeeeeeeeeeee PunchList_Bim360_Write_New" + err);
      }
    });
  };
}

module.exports = SQL_LPM;
