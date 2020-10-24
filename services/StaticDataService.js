class StaticContractService {
    constructor (contractSets, contractDetails) {
        this.contractSets = contractSets
        this.contractDetails = contractDetails
        this.allStaticContracts = []
        this.newSetId = null
        this.getNewContractSet()
    }

    getContractStruct () {
        const contractStruct = {
            amla_url: "",
            associated : [],
            concession: [],
            contract_type: [],
            country: {code:"", name: ""},
            created_at: "",
            date_signed: "",
            deal_number: "",
            file: [],
            government_entity: [],
            id: "",
            identifier: "",
            is_annexes_missing: false,
            is_associated_document: false,
            is_contract_signed: true,
            is_ocr_reviewed: true,
            is_pages_missing: false,
            language: "en",
            matrix_page: "",
            name: "",
            note: "",
            number_of_pages: 0,
            open_contracting_id: "",
            parent : [],
            participation : [],
            project: {name:"", identifier:""},
            publisher: {type:"", note: ""},
            resource: [],
            retrieved_at: "",
            source_url:"",
            supporting_contracts_extra:"",
            type:"",
            year_signed:"",
            isNew: false
        }
        return contractStruct
    }

    getYearSigned(signDate){
		if (signDate) {
			return signDate.split('/')[2];
        }
        return null
    }
    

    getNewContractSet() {
        const res = this.contractSets.filter(s => {
            return s.isNew
        })
        if (res.length > 0 && res[0]) {
            this.newSetId = res[0].setId
        }
        this.setStaticContracts()
    }

    mapContractDetails (setId, fileName, subFolder) {
        var newContract = Object.assign({}, this.getContractStruct())
        const infoRes = this.contractDetails.filter(d => {
            return d["FILE NAME"] === fileName
        })
        if (infoRes.length > 0) {
            if (infoRes[0]) {
                try {
                    const yearSigned = this.getYearSigned(infoRes[0]["SIGNATUR DATE"])
                    newContract['year_signed'] = null
                    if (yearSigned !== null) {
                        newContract['year_signed'] = parseInt(yearSigned,10);
                    }
                    /** Set Id */
                    newContract["id"] = `offline-contract-${setId}-${this.allStaticContracts.length}`
                    /** Set 'New' flag */
                    if (setId === this.newSetId) {
                        newContract["isNew"] = true
                    } else {
                        newContract["isNew"] = false
                    }
                    newContract['name'] = infoRes[0]['DOCUMENT/FILE NAME'];
                    newContract['government_entity'].push({
                        name: infoRes[0]['GOVERNMENT ENTITY'],
                        identity: ""
                    });
                    newContract['contract_type'] = infoRes[0]['DOCUMENT TYPE'];
                    newContract['date_signed'] = infoRes[0]["SIGNATUR DATE"];
                    newContract['resource'] = [ infoRes[0]['RESOURCE'] ];
                    newContract['participation'].push({
                        company : {
                            name : infoRes[0]["NAME"],
                            address: infoRes[0]["COMPANY ADDRESS"],
                            corporate_grouping : "",
                            founding_date : "",
                            identifier: { 
                                id: "",
                                creator : {
                                    name : "",
                                    spatial: ""
                                }
                            },
                            opencorporates_url : "",
                            is_operator : "",
                            share : null
                        }
                    });
                    /** Set file location of contract file */
                    var fileLocation = "/Main-Company-Contracts/"
                    if (subFolder !== '') {
                        fileLocation += `${subFolder}/`
                    }
                    newContract['file'].push({
                        url : `${fileLocation}${fileName}.pdf`,
                        media_type: "application/pdf"
                    })
                } catch(maperror) {
                    console.log(maperror)
                }
            }
        } else {
            newContract["id"] = `offline-contract-${setId}-${this.allStaticContracts.length}`
        }
        return newContract
    }

    setStaticContracts () {
        this.allStaticContracts = []
        if (this.contractSets.length > 0) {
            this.contractSets.forEach(s => {
                if (s.contracts.length > 0) {
                    s.contracts.forEach(contractFileName => {
                        const contractData = this.mapContractDetails(s.setId, contractFileName, s.subFolder)
                        this.allStaticContracts.push(contractData)
                    })
                }
            })
        }
    }
}