class StaticContractService {
    constructor (contractSets, contractDetailsArr) {
        this.contractSets = contractSets
        this.allStaticContracts = []
        this.allContracts = []
        this.newSetId = null

        this.getNewContractSet(contractDetailsArr)
    }

    setAllContracts(data) {
        this.allContracts = data
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

    getInfoStruct () {
        const infoStruct = {
            "NAME": "",
            "MAIN OR ASSOCIATED": "",
            "DOCUMENT/FILE NAME": "",
            "FILE NAME": "",
            "CONTRACT NO.": "",
            "LANGUAGE": "",
            "RESOURCE": "",
            "TYPE OF COMMODITY": "",
            "SIGNATUR DATE": "",
            "EXPIRATION": "",
            "DOCUMENT TYPE": "",
            "GOVERNMENT ENTITY": "",
            "CONTACT INFORMATION": "",
            "COMPANY ADDRESS": "",
            "MINERAL RESERVATION": "",
            "REGION": "",
            "PROVINCE": "",
            "MUNICIPALITY": "",
            "AREA (Has.)": "",
            "STATUS": "",
        }
        return infoStruct
    }

    getYearSigned(signDate){
		if (signDate) {
			return signDate.split('/')[2];
        }
        return null
    }
    

    getNewContractSet(contractDetailsArr) {
        /** Init details properties */
        this.contractSets.forEach((c,setIdx)=>{
            c.contractDetails = contractDetailsArr[setIdx]
        })

        /**
         * Get contracts set with isNew property and get the setId
         * setId is (basically) the current year
        */
        const res = this.contractSets.filter(s => {
            return s.isNew
        })
        if (res.length > 0 && res[0]) {
            this.newSetId = res[0].setId
        }
        this.setStaticContracts()
    }

    mapContractDetails (setId, fileName, subFolder, contractDetails) {
        var newContract = Object.assign({}, this.getContractStruct())
        const infoRes = contractDetails.filter(d => {
            return d["FILE NAME"] === fileName
        })
        if (infoRes.length > 0) {
            if (infoRes[0]) {
                try {
                    newContract['year_signed'] = null

                    if (infoRes[0]["SIGNATUR DATE"]) {   
                        const yearSigned = this.getYearSigned(infoRes[0]["SIGNATUR DATE"])
                        if (yearSigned !== null) {
                            newContract['year_signed'] = parseInt(yearSigned,10);
                        }
                    }
                    /** Set Id */
                    newContract["id"] = `offline-contract-${setId}-${this.allStaticContracts.length}`

                    /** Set 'New' flag */
                    if (setId === this.newSetId) {
                        newContract["isNew"] = true
                    } else {
                        newContract["isNew"] = false
                    }
                    
                    if (infoRes[0]['GOVERNMENT ENTITY']) {
                        newContract['government_entity'].push({
                            name: infoRes[0]['GOVERNMENT ENTITY'],
                            identity: ""
                        });
                    }

                    if (infoRes[0]['DOCUMENT TYPE']) {
                        newContract['contract_type'] = infoRes[0]['DOCUMENT TYPE'];
                    }

                    if (infoRes[0]["SIGNATUR DATE"]) {
                        newContract['date_signed'] = infoRes[0]["SIGNATUR DATE"]
                    }

                    if (infoRes[0]['RESOURCE']) {
                        newContract['resource'] = [ infoRes[0]['RESOURCE'] ];
                    }

                    var companyName = ''
                    if (infoRes[0]["NAME"]) {
                        companyName = infoRes[0]["NAME"]
                    }
                    

                    if (infoRes[0]['DOCUMENT/FILE NAME'] !== '') {
                        newContract['name'] = infoRes[0]['DOCUMENT/FILE NAME']
                    } else {
                        newContract['name'] = `${companyName} ${infoRes[0]['CONTRACT NO.']}`
                    }                    

                    var companyAddress = ''
                    if (infoRes[0]["COMPANY ADDRESS"]) {
                        companyAddress = infoRes[0]["COMPANY ADDRESS"]
                    }
                    
                    newContract['participation'].push({
                        company : {
                            name : companyName,
                            address: companyAddress,
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
                        const contractData = this.mapContractDetails(s.setId, contractFileName, s.subFolder, s.contractDetails)
                        this.allStaticContracts.push(contractData)
                    })
                }
            })
        }
    }

    newContractsOnly () {
        return this.allStaticContracts.filter(nc => {
            return nc.isNew
        })
    }
}