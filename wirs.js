class Wirs{
    constructor(wirid,pid,dateOfInspection,timeOfInspection,location,
        structure,typeOfStructure,refDrawNo,methodStaRefNo,consentProceed,
        consentProceedComment,noConsent,revNotReq,inspectionType) {
        this.wirid = wirid;
        this.pid = pid;
        this.dateOfInspection = dateOfInspection;
        this.timeOfInspection = timeOfInspection;
        this.location = location;
        this.structure = structure;
        this.typeOfStructure = typeOfStructure;
        this.refDrawNo = refDrawNo;
        this.methodStaRefNo = methodStaRefNo;
        this.consentProceed = consentProceed;
        this.consentProceedComment = consentProceedComment;
        this.noConsent = noConsent;
        this.revNotReq = revNotReq;
        this.inspectionType = inspectionType;
    }
}

module.exports = Wirs;