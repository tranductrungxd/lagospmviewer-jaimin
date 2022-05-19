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
  createNewSnag = async (snag) => {
    return new Promise(async (resolve) => {
      try {
        const {
          ProjectID,
          PunchID,
          dateSubmitted,
          dateCompleted,
          bidPackageId,
          Location,
          Item,
          ResponsibleParty,
          Status,
          SubSignOff,
          ContractorSignOff,
          FinalSignOff,
          Origin,
          Originator,
          Comments,
          listnumber,
          itemnumber,
          history,
          attachment,
          Drawing_Link,
        } = snag;

        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);
        request.input("ProjectID", sql.Int, ProjectID);
        request.input("PunchID", sql.Int, PunchID);
        request.input("dateSubmitted", sql.DateTime, dateSubmitted);
        request.input("dateCompleted", sql.DateTime, dateCompleted);
        request.input("bidPackageId", sql.Int, bidPackageId);
        request.input("Location", sql.VarChar(255), Location);
        request.input("Item", sql.Text, Item);
        request.input("ResponsibleParty", sql.VarChar(255), ResponsibleParty);
        request.input("Status", sql.VarChar(255), Status);
        request.input("SubSignOff", sql.VarChar(255), SubSignOff);
        request.input("ContractorSignOff", sql.VarChar(255), ContractorSignOff);
        request.input("FinalSignOff", sql.VarChar(50), FinalSignOff);
        request.input("Origin", sql.VarChar(255), Origin);
        request.input("Originator", sql.VarChar(255), Originator);
        request.input("Comments", sql.NVarChar(sql.MAX), Comments);
        request.input("listnumber", sql.Int, listnumber);
        request.input("itemnumber", sql.Int, itemnumber);
        request.input("history", sql.Text, history);
        request.input("attachment", sql.NVarChar(100), attachment);
        request.input("Drawing_Link", sql.NVarChar(256), Drawing_Link);
        request
          .execute("PunchList_Bim360_Write_New")
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
