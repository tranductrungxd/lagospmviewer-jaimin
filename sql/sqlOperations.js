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
          dateOfTesting, timeOfTesting, locationOfTesting, structure, typeOfStructure, rdNo,
          statementRef, consent, yesConsent, noConsent, reviewNot, inspectionType, issueid, seqid
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
        request.input("issueid", sql.VarChar(50), issueid);
        request.input("seqid", sql.VarChar(50), seqid);
        request
          .execute("Wir_Write_New")
          .then((response) => {
            resolve({ status: 200, message: "success", id: response.recordset[0][''] });
          })
          .catch((err) => {
            console.log(err);
            resolve({ status: 500, message: "server failed" });
          });
      } catch (err) {
        resolve({ status: 500, message: "server failed" });
        console.log("Error occurred while saving WIR data, Procedure : Wir_Write_New :" + err);
      }
    });
  };

  createNewSBE = async (wir, id) => {
    return new Promise(async (resolve) => {
      try {
        const {
          scg1, scg2, siteg1, siteg2, qcg1, qcg2, engg1, engg2, scwp1, scwp2, scwp3, qcwp1, qcwp2, qcwp3, sitewp1, sitewp2,
          sitewp3, engwp1, engwp2, engwp3, scsb1, scsb2, scsb3, scsb4, sitesb1, sitesb2, sitesb3, sitesb4, qcsb1, qcsb2,
          qcsb3, qcsb4, engsb1, engsb2, engsb3, engsb4, comments, sitedateso, qcdateso, engedateso, sitenameso, qcnameso, engnameso
        } = wir;

        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);
        request.input("wirid", sql.Int, id);
        request.input("general1_sc", sql.Int, scg1);
        request.input("general2_sc", sql.Int, scg2);
        request.input("general1_site", sql.Int, siteg1);
        request.input("general2_site", sql.Int, siteg2);
        request.input("general1_qa", sql.Int, qcg1);
        request.input("general2_qa", sql.Int, qcg2);
        request.input("general1_eng", sql.VarChar(50), engg1);
        request.input("general2_eng", sql.VarChar(50), engg2);
        request.input("wp1_sc", sql.Int, scwp1);
        request.input("wp2_sc", sql.Int, scwp2);
        request.input("wp3_sc", sql.Int, scwp3);
        request.input("wp1_qa", sql.Int, qcwp1);
        request.input("wp2_qa", sql.Int, qcwp2);
        request.input("wp3_qa", sql.Int, qcwp3);
        request.input("wp1_site", sql.Int, sitewp1);
        request.input("wp2_site", sql.Int, sitewp2);
        request.input("wp3_site", sql.Int, sitewp3);
        request.input("wp1_eng", sql.VarChar(50), engwp1);
        request.input("wp2_eng", sql.VarChar(50), engwp2);
        request.input("wp3_eng", sql.VarChar(50), engwp3);
        request.input("sb1_sc", sql.Int, scsb1);
        request.input("sb2_sc", sql.Int, scsb2);
        request.input("sb3_sc", sql.Int, scsb3);
        request.input("sb4_sc", sql.Int, scsb4);
        request.input("sb1_site", sql.Int, sitesb1);
        request.input("sb2_site", sql.Int, sitesb2);
        request.input("sb3_site", sql.Int, sitesb3);
        request.input("sb4_site", sql.Int, sitesb4);
        request.input("sb1_qa", sql.Int, qcsb1);
        request.input("sb2_qa", sql.Int, qcsb2);
        request.input("sb3_qa", sql.Int, qcsb3);
        request.input("sb4_qa", sql.Int, qcsb4);
        request.input("sb1_eng", sql.VarChar(50), engsb1);
        request.input("sb2_eng", sql.VarChar(50), engsb2);
        request.input("sb3_eng", sql.VarChar(50), engsb3);
        request.input("sb4_eng", sql.VarChar(50), engsb4);
        request.input("comments", sql.VarChar(50), comments);
        request.input("so_date_site", sql.VarChar(50), sitedateso);
        request.input("so_date_qc", sql.VarChar(50), qcdateso);
        request.input("so_date_eng", sql.VarChar(50), engedateso);
        request.input("so_name_site", sql.VarChar(50), sitenameso);
        request.input("so_name_qc", sql.VarChar(50), qcnameso);
        request.input("so_name_eng", sql.VarChar(50), engnameso);
        request
          .execute("Wir_Write_Sand_Blast")
          .then((response) => {
            resolve({ status: 200, message: "success" });
          })
          .catch((err) => {
            console.log(err);
            resolve({ status: 500, message: "server failed" });
          });
      } catch (err) {
        resolve({ status: 500, message: "server failed" });
        console.log("Error occurred while saving checklist data, Procedure : Wir_Write_Sand_Blast : " + err);
      }
    });
  };

  createNewSWD = async (wir, id) => {
    return new Promise(async (resolve) => {
      try {
        const { seascg1,seascg2,seascg3,seasiteg1,seasiteg2,seasiteg3,seaqcg1,seaqcg2,seaqcg3,seaengg1,seaengg2,seaengg3,
          seascwp1,seascwp2,seasitewp1,seasitewp2,seaqcwp1,seaqcwp2,seaengwp1,seaengwp2,seascsw1,seascsw2,seascsw3,
          seascsw4,seascsw5,seasitesw1,seasitesw2,seasitesw3,seasitesw4,seasitesw5,seaqcsw1,seaqcsw2,seaqcsw3,seaqcsw4,
          seaqcsw5,seaengsw1,seaengsw2,seaengsw3,seaengsw4,seaengsw5,seastjvcom,seaengcom,seasitedateso,seaqcdateso,seaengedateso,
          seasitenameso,seaqcnameso,seaengnameso } = wir;

        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);
        request.input("wirid", sql.Int, id);
        request.input("seascg1", sql.Int, seascg1);
        request.input("seascg2", sql.Int, seascg2);
        request.input("seascg3", sql.Int, seascg3);
        request.input("seasiteg1", sql.Int, seasiteg1);
        request.input("seasiteg2", sql.Int, seasiteg2);
        request.input("seasiteg3", sql.Int, seasiteg3);
        request.input("seaqcg1", sql.Int, seaqcg1);
        request.input("seaqcg2", sql.Int, seaqcg2);
        request.input("seaqcg3", sql.Int, seaqcg3);
        request.input("seaengg1", sql.VarChar(50), seaengg1);
        request.input("seaengg2", sql.VarChar(50), seaengg2);
        request.input("seaengg3", sql.VarChar(50), seaengg3);
        request.input("seascwp1", sql.Int, seascwp1);
        request.input("seascwp2", sql.Int, seascwp2);
        request.input("seasitewp1", sql.Int, seasitewp1);
        request.input("seasitewp2", sql.Int, seasitewp2);
        request.input("seaqcwp1", sql.Int, seaqcwp1);
        request.input("seaqcwp2", sql.Int, seaqcwp2);
        request.input("seaengwp1", sql.VarChar(50), seaengwp1);
        request.input("seaengwp2", sql.VarChar(50), seaengwp2);
        request.input("seascsw1", sql.Int, seascsw1);
        request.input("seascsw2", sql.Int, seascsw2);
        request.input("seascsw3", sql.Int, seascsw3);
        request.input("seascsw4", sql.Int, seascsw4);
        request.input("seascsw5", sql.Int, seascsw5);
        request.input("seasitesw1", sql.Int, seasitesw1);
        request.input("seasitesw2", sql.Int, seasitesw2);
        request.input("seasitesw3", sql.Int, seasitesw3);
        request.input("seasitesw4", sql.Int, seasitesw4);
        request.input("seasitesw5", sql.Int, seasitesw5);
        request.input("seaqcsw1", sql.Int, seaqcsw1);
        request.input("seaqcsw2", sql.Int, seaqcsw2);
        request.input("seaqcsw3", sql.Int, seaqcsw3);
        request.input("seaqcsw4", sql.Int, seaqcsw4);
        request.input("seaqcsw5", sql.Int, seaqcsw5);
        request.input("seaengsw1", sql.VarChar(50), seaengsw1);
        request.input("seaengsw2", sql.VarChar(50), seaengsw2);
        request.input("seaengsw3", sql.VarChar(50), seaengsw3);
        request.input("seaengsw4", sql.VarChar(50), seaengsw4);
        request.input("seaengsw5", sql.VarChar(50), seaengsw5);
        request.input("seastjvcom", sql.VarChar(50), seastjvcom);
        request.input("seaengcom", sql.VarChar(50), seaengcom);
        request.input("seasitedateso", sql.VarChar(50), seasitedateso);
        request.input("seaqcdateso", sql.VarChar(50), seaqcdateso);
        request.input("seaengedateso", sql.VarChar(50), seaengedateso);
        request.input("seasitenameso", sql.VarChar(50), seasitenameso);
        request.input("seaqcnameso", sql.VarChar(50), seaqcnameso);
        request.input("seaengnameso", sql.VarChar(50), seaengnameso);
        request
          .execute("Wir_Write_Sea_Wall")
          .then((response) => {
            console.log(response);
            resolve({ status: 200, message: "success" });
          })
          .catch((err) => {
            console.log(err);
            resolve({ status: 500, message: "server failed" });
          });
      } catch (err) {
        resolve({ status: 500, message: "server failed" });
        console.log("Error occurred while saving checklist data, Procedure : Wir_Write_Sand_Blast : " + err);
      }
    });
  };

  async getSingleWir(id) {
    return new Promise(async (resolve) => {
      try {
        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);
        request.query("select * from dbo.wir where wirid="+id)
          .then((result) => {
            console.log(result);
            resolve({ status: 200, data: result.recordset });
          })
          .catch((err) => {
            console.log("Error occurred during getting single wir " + err);
            resolve({ status: 500, data: [] });
          });
      } catch (error) {
        console.log(error);
      }
    });
  }

  async getSingleWirChecklist(id,table) {
    return new Promise(async (resolve) => {
      try {
        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);
        request.query("select * from dbo."+table+" where wirid="+id)
          .then((result) => {
            console.log(result);
            resolve({ status: 200, data: result.recordset });
          })
          .catch((err) => {
            console.log("Error occurred during getting single wir checklist " + err);
            resolve({ status: 500, data: [] });
          });
      } catch (error) {
        console.log(error);
      }
    });
  }

  async removeWirById(id) {
    return new Promise(async (resolve) => {
      try {
        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);
        request.query("delete from dbo.wir where wirid="+id)
          .then((result) => {
            resolve({ status: 200 });
          })
          .catch((err) => {
            console.log("Error occurred during deleting " + err);
            resolve({ status: 500, data: [] });
          });
      } catch (error) {
        console.log(error);
      }
    });
  }

  async removeWirChecklistById(id,table) {
    return new Promise(async (resolve) => {
      try {
        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);
        request.query("delete from dbo."+table+" where wirid="+id)
          .then((result) => {
            resolve({ status: 200 });
          })
          .catch((err) => {
            console.log("Error occurred during deleting " + err);
            resolve({ status: 500, data: [] });
          });
      } catch (error) {
        console.log(error);
      }
    });
  }

  async deleteWirs() {
    return new Promise(async (resolve) => {
      try {
        const pool = await pools.poolWebConnect;
        const request = new sql.Request(pool);
        request.query("select * from dbo.wir")
          .then((result) => {
            console.log(result);
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

}

module.exports = SQL_LPM;
