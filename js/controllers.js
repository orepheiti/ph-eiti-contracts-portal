var myControllers = angular.module('myControllers', ['ngAnimate']);

const __SCS__ = new StaticContractService(STATIC_CONTRACTS, [
    NEW_CONTRACTS_INFO,
    NEW_CONTRACTS_INFO_2020,
    NEW_CONTRACTS_INFO_2021
])

var api = 'https://api.resourcecontracts.org/'; //'http://rc-api-stage.elasticbeanstalk.com/api/';
var options = "&country_code=ph"

myApp.factory('ContractsFactory',['$http',
  function($http){
    var wsurl = ['https://api.resourcecontracts.org','https://rc-api-stage.elasticbeanstalk.com/api'];
    var wsurl_idx = 0;
    var ContractsFactory = null;
    ContractsFactory = {
      get : {
        metadata : function(id){
          var promise = $http({
            url : wsurl[wsurl_idx]+'/contract/'+id+'/metadata',
            method : 'GET'
          });
          return promise;
        },
        supportingDocs : function(contractName) {
            return $http.get('/get_supporting_documents.php?contract_name=' + contractName, { cache: true })
        }
      }
    }
    return ContractsFactory;
}]);

myApp.factory('NewContractsFactory',['$http',function($http){
	var factory = {
		allData : []
	};
	return factory;
}])

myControllers.controller('MainController', ['$scope', '$rootScope', '$http', '$q','ContractsFactory',
  function($scope, $rootScope, $http,$q,ContractsFactory) {
  var resultIds = []
    
    $http.get(api + 'contracts/search?q=&from=0&per_page=10000&group=metadata&country_code=ph', { cache: true })
    .success(function(data) {
      var data = filterData(data);
      data.hydrocarbon_companies = hydrocarbon_companies;
      getCompaniesOfStaticContracts(data)
    })
    .error(function(error) {
      console.log('search error in main controller!');
      console.log(error)
      // window.location.reload();
    });

    function getCompaniesOfStaticContracts(data) {
        var companiesArr = data.company_name
        var uniqueCompanyNames = [...companiesArr]
        if (__SCS__.allStaticContracts.length > 0) {
            __SCS__.allStaticContracts.forEach(c => {
                if (c.participation && c.participation.length > 0) {
                    if (c.participation[0] && c.participation[0].company) {
                        const currCompanyName = c.participation[0].company.name
                        if (inArr(uniqueCompanyNames, currCompanyName) === false) {
                            uniqueCompanyNames.push(currCompanyName)
                        }
                    }
                }
            })
        }

      data.company_name = uniqueCompanyNames.sort()
      $rootScope.rootData = data;
        
      $(window).trigger('mainData.loaded')
      if (data.results) {
        var sResults = data.results;
        for (var idx=0;idx<sResults.length;idx++) {
          if ($.inArray(sResults[idx].id,resultIds)==-1) {
            resultIds.push(sResults[idx].id);
          }
        }
      }
    }

	function inArr(arr,needle) {
		if (arr) {
			for (var idx=0;idx<arr.length;idx++) {
				if (arr[idx]==needle) {
					return true;
				}
			}
		}
		return false;
	}

	function getIndexInArr(arr,attr,val){
		if (arr) {
			for (var idx=0;idx<arr.length;idx++) {
				if (arr[idx][attr]==val) {
					return idx;
				}
			}
		}
		return -1;
	}
}]);

myControllers.controller('IndexController', ['$scope', 'ngDialog', '$http',
function ($scope, ngDialog, $http) {
	$scope.openRegions = function() {
		ngDialog.open({
			template: '/partials/modal-regions.html',
			class: 'ngdialog-theme-default'
		});
	}

	function inArr(arr,needle) {
		if (arr) {
			for (var idx=0;idx<arr.length;idx++) {
				if (arr[idx]==needle) {
					return true;
				}
			}
		}
		return false;
	}

	function getIndexInArr(arr,attr,val){
		if (arr) {
			for (var idx=0;idx<arr.length;idx++) {
				if (arr[idx][attr]==val) {
					return idx;
				}
			}
		}
		return -1;
	}

	function getYearSigned(signDate){
		if (signDate) {
			return signDate.split('/')[2];
		}
	}

	function getResource(resourceStr) {
		if (resourceStr.match('/ and /gi')) {
			var tempData = resourceStr.split(' and ');
			if (tempData[0].match('/, /gi')) {
				var comData = tempData[0].split(', ');
				comData.push(tempData[1]);
				return comData;
			}
			else {
				return tempData;
			}
		}
		return [resourceStr];
	}

	/*  function getStaticContracts(){
        console.log(_SCS_.allStaticContracts)
        var _new_contracts_mapped = [];
        var contractsList = []
		for (var filename in NCONTRACTS_MAPPED) {
			var idx = getIndexInArr(NEW_CONTRACTS_INFO,'FILE NAME',filename);
			if (idx!=-1) {
				var newContractObj = Object.assign({},NCONTRACTS_MAPPED[filename]);
				newContractObj['name'] = NEW_CONTRACTS_INFO[idx]['DOCUMENT/FILE NAME'];
				newContractObj['government_entity'].push({
					name: NEW_CONTRACTS_INFO[idx]['GOVERNMENT ENTITY'],
					identity: ""
				});
				newContractObj['contract_type'] = [NEW_CONTRACTS_INFO[idx]['DOCUMENT TYPE']];
				newContractObj['date_signed'] = NEW_CONTRACTS_INFO[idx]["SIGNATUR DATE"];
				newContractObj['year_signed'] = parseInt(getYearSigned(NEW_CONTRACTS_INFO[idx]["SIGNATUR DATE"]),10);
				newContractObj['resource'] = [ NEW_CONTRACTS_INFO[idx]['RESOURCE'] ];
				newContractObj['participation'].push({
					company : {
						name : NEW_CONTRACTS_INFO[idx]["NAME"],
						address: NEW_CONTRACTS_INFO[idx]["COMPANY ADDRESS"],
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
				newContractObj['file'].push({
					url : "/Main-Company-Contracts/"+filename+".pdf",
					media_type: "application/pdf"
				})
				newContractObj["id"] = 'nc-'+_new_contracts_mapped.length;
				_new_contracts_mapped.push(newContractObj);
			}
        }
	}   */

	function getUniqueResource(){
		var uniqueRes = [];
		for (var idx=0;idx<NEW_CONTRACTS_INFO.length;idx++) {
			if (inArr(uniqueRes,NEW_CONTRACTS_INFO[idx]['RESOURCE'])==false) {
				uniqueRes.push(NEW_CONTRACTS_INFO[idx]['RESOURCE']);
			}
		}
    }
    
}]);

myControllers.controller('SearchController', ['$scope', '$http', '$routeParams', '$q','ContractsFactory','NewContractsFactory',
  function ($scope, $http, $routeParams, $q, ContractsFactory, NewContractsFactory) {
    
    $scope.total_num_of_contracts = 'Calculating';
    $scope.searchInProgress = false
    var q = getParam('q');
    var year = getParam('year');
    var resource = getParam('resource');
    var company = getParam('company_name');

    var query = '';

    $scope.searchTerm = '';
    /** Show search progress indicator */
    $('.search-loading').show();
    if (q) {
        $scope.searchTerm = "Search results for <span>" + decodeURIComponent(q) + "</span>";
        query += 'q=' + q + '&'
    }

    if (year) {
        $scope.searchTerm = 'Contracts signed in <span>' + year + '</span>';
        query += 'year=' + year + '&'
    }

    if (company) {
        $scope.searchTerm = 'Contracts from <span>' + decodeURIComponent(company) + '</span>';
        query += 'company_name=' + company + '&'
    }


    if (resource) {
        $scope.searchTerm = 'Contracts with resource: <span>' + decodeURIComponent(resource) + '</span>';
        query += 'resource=' + resource + '&'
    }

    if (year && company) {
        $scope.searchTerm = 'Contracts signed in <span>' + year + '</span>' + ' from <span>' + decodeURIComponent(company) + '</span>';
    }

    if (year && resource) {
        $scope.searchTerm = 'Contracts signed in <span>' + year + '</span>' + ' with resource: <span>' + resource + '</span>';
    }

    if (company && resource) {
        $scope.searchTerm = 'Contracts signed from <span>' + decodeURIComponent(company) + '</span>' + ' with resource: <span>' + resource + '</span>';
    }

    if (year && company && resource) {
        $scope.searchTerm = 'Contracts signed in <span>' + year + '</span>' + ' from <span>' + decodeURIComponent(company) + '</span>' + ' with resource: <span>' + resource + '</span>';
    }

    if (window.location.pathname == '/contracts') {
        query = '';
        $scope.searchTerm = '<span>Mining, Oil & Gas Contracts from the Philippines</span>';
    }

    if ($scope.searchTerm == '') {
        $scope.searchTerm = '<span>Mining, Oil & Gas Contracts from the Philippines</span>';
    }

    $scope.compareSupportDocs=function(contractIds){
        $scope.total_num_of_contracts = 'Calculating';
        var totalNumContracts = 0;
        if (contractIds.length > 0) {   
            var promiseArr = [];
            for (var idx=0;idx<contractIds.length;idx++) {
                promiseArr.push(ContractsFactory.get.metadata(contractIds[idx]));
            }
            $scope.bulkPromise = $q.all(promiseArr)
            $scope.bulkPromise
                .then(function(responseValues){
                    if (responseValues) {
                        if (responseValues.length) {
                            for (var kk=0;kk<responseValues.length;kk++) {
                                var returnData = responseValues[kk].data
                                if (returnData.type==='Contract') {
                                    totalNumContracts++;
                                }
                            }
                        }
                    }
                    // $scope.total_num_of_contracts = totalNumContracts;
                    // Get additional contracts
                    getAdditionalContracts(totalNumContracts)
                }, function(err){
                  $scope.searchInProgress = false
                  $('.search-loading').hide();
                  if ($scope.data && $scope.data.results.length < 1) {
                      $('.search-no-result').show()
                  }
                })
        } else {
            // Get additional contracts
            getAdditionalContracts(totalNumContracts)
        }
    }

    function runSearch () {
        $scope.searchInProgress = true  
        $http.get(api + 'contracts/search?from=0&per_page=1000&group=metadata&country_code=ph&' + query, { cache: true })
            .success(function(data) {
                var resultIds = []
                var data = filterData(data);
                $scope.data = data;
                $scope.data.total = $scope.data.results.length

                $scope.predicate = 'name'; //'contract_name';
                $scope.reverse = false;
                $scope.order = function(predicate) {
                    $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse: false;
                    $scope.predicate = predicate;
                };

                $(window).trigger('rootData.loaded')
                if (data.results) {
                    var sResults = data.results;
                    for (var idx=0;idx<sResults.length;idx++) {
                        if ($.inArray(sResults[idx].id,resultIds)==-1) {
                            resultIds.push(sResults[idx].id);
                        }
                    }
                }
                // Filters supporting documents 
                $scope.compareSupportDocs(resultIds);
                
                // Get Additional Contracts
                // getAdditionalContracts();
            })
            .error(function(error) {
                $scope.searchInProgress = false
                $('.search-loading').hide();
                $('.search-no-result').show()
                // window.location.reload();
            });
    }

    runSearch()

	function inArr(arr,needle) {
		if (arr) {
			for (var idx=0;idx<arr.length;idx++) {
				if (arr[idx]==needle) {
					return true;
				}
			}
		}
		return false;
	}

	function getIndexInArr(arr,attr,val){
		if (arr) {
			for (var idx=0;idx<arr.length;idx++) {
				if (arr[idx][attr]==val) {
					return idx;
				}
			}
		}
		return -1;
	}

	function getYearSigned(signDate){
		if (signDate) {
			return signDate.split('/')[2];
		}
	}

	function getResource(resourceStr) {
		if (resourceStr.match('/ and /gi')) {
			var tempData = resourceStr.split(' and ');
			if (tempData[0].match('/, /gi')) {
				var comData = tempData[0].split(', ');
				comData.push(tempData[1]);
				return comData;
			}
			else {
				return tempData;
			}
		}
		return [resourceStr];
    }
    
    function inParticipation (cData, cName) {
      var confirmed = false
      if (cData.participation && cData.participation.length > 0) {
          if (cData.participation[0] && cData.participation[0].company) {
              if (cData.participation[0].company.name === cName) {
                confirmed = true
              }
          }
      }
      return confirmed
    }
  
    function getAdditionalContracts(){      

        var filteredResults = [...$scope.data.results, ...__SCS__.allStaticContracts]
        
        if (!q) {
          __SCS__.setAllContracts(filteredResults)
        } 
        else if (q!==undefined && q!="") {
            var exp = new RegExp(decodeURIComponent(q),'gi');
            var matchedRes = []
            if (__SCS__.allStaticContracts.length > 0) {
                matchedRes = __SCS__.allStaticContracts.filter(nc => {
                    return (nc.name.match(exp) !== null || (nc.name.indexOf(decodeURIComponent(q)) !== -1))
                })
            }
            filteredResults = [...$scope.data.results, ...matchedRes]
        }

        if (company !== undefined && company !== '') {
            const companyQuery = decodeURIComponent(company)
            const compNameExp = new RegExp(companyQuery,'gi');
            filteredResults = filteredResults.filter(nc => {
                const confirmed = inParticipation(nc, companyQuery)
                return (nc.name.match(compNameExp) !== null || 
                        (nc.name.indexOf(companyQuery) !== -1) || confirmed==true)
            })
        }
        if (year !== undefined && year !== '') {
            filteredResults = filteredResults.filter(c => {
                return c.year_signed == year
            })
        }
        if (resource !== undefined && resource !== '') {
            filteredResults = filteredResults.filter(c => {
                return (inArr(c.resource, resource) === true)
            })
        }

        if ($scope.data.results.length > 0 && filteredResults.length === 0) {
          /** 
           * If there's no result in filteredResults but
           * there's data returned from back-end, use data from back-end
           */
          filteredResults = $scope.data.results
        }

        $scope.data.results = filteredResults
        // NewContractsFactory.allData = $scope.data.results
        $scope.data.total = $scope.data.results.length;
        $scope.searchInProgress = false
        $('.search-loading').hide();
        if ($scope.data && $scope.data.results.length < 1) {
            $('.search-no-result').show()
        }
		/* var _new_contracts_mapped = [];
		for (var filename in NCONTRACTS_MAPPED) {
			var idx = getIndexInArr(NEW_CONTRACTS_INFO,'FILE NAME',filename);
			if (idx!=-1) {
				var newContractObj = Object.assign({},NCONTRACTS_MAPPED[filename]);
				newContractObj['name'] = NEW_CONTRACTS_INFO[idx]['DOCUMENT/FILE NAME'];
				newContractObj['government_entity'].push({
					name: NEW_CONTRACTS_INFO[idx]['GOVERNMENT ENTITY'],
					identity: ""
				});
				newContractObj['contract_type'] = [NEW_CONTRACTS_INFO[idx]['DOCUMENT TYPE']];
				newContractObj['date_signed'] = NEW_CONTRACTS_INFO[idx]["SIGNATUR DATE"];
				newContractObj['year_signed'] = parseInt(getYearSigned(NEW_CONTRACTS_INFO[idx]["SIGNATUR DATE"]),10);
				newContractObj['resource'] = [ NEW_CONTRACTS_INFO[idx]['RESOURCE'] ];
				newContractObj['participation'].push({
					company : {
						name : NEW_CONTRACTS_INFO[idx]["NAME"],
						address: NEW_CONTRACTS_INFO[idx]["COMPANY ADDRESS"],
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
						is_operator : null,
						share : null
					}
				});
				newContractObj['file'].push({
					url : "/Main-Company-Contracts/"+filename+".pdf",
					media_type: "application/pdf"
				})
				newContractObj["id"] = 'nc-'+_new_contracts_mapped.length;
				newContractObj["isNew"] = true;
				_new_contracts_mapped.push(newContractObj);
				if (!q) {
					$scope.data.results.push(newContractObj);
				}
				else if (q!==undefined && q!="") {
					var exp = new RegExp(q,"g");
					if (newContractObj.name.match(exp)) {
						$scope.data.results.push(newContractObj);
					}
				}
			}
			$scope.data.total = $scope.data.results.length;
		} */ 
	}
	
}]);

myControllers.controller('ContractController', ['$scope', '$http', '$routeParams','$q','ContractsFactory','NewContractsFactory',
  function ($scope, $http, $routeParams, $q, ContractsFactory, NewContractsFactory) {
	var id = $routeParams.id;
	var dataLookup = __SCS__.allStaticContracts
    $scope.isOcds = false

	function getIndexInArr(arr,attr,val){
		if (arr) {
			for (var idx=0;idx<arr.length;idx++) {
				if (arr[idx][attr]==val) {
					return idx;
				}
			}
		}
		return -1;
	}

	if (id.match(/offline-contract-/gi)) {
        $scope.isOcds = false

		if (dataLookup.length==0) {
            // Get static contracts again
		}
		
		var idx = getIndexInArr(dataLookup,'id',id);
		if (idx!=-1) {
            $scope.data = dataLookup[idx];
            // Associated files that are not in elasticbeanstalk
            // Files in supporting-documents folder/
            $http.get('/get_supporting_documents.php?contract_name=' + $scope.data.name, { cache: true })
                .success(function(responseData) {
                    $scope.data.supporting_contracts_extra = responseData;
                });
        }

	}
	else {
        $scope.isOcds = false
		$http.get(api + 'contract/' + id + '/metadata', { cache: true } )
		.success(function(data) {
            $scope.data = data;
            
            if (data.word_file) {
                $('.download-word').on('click', function() {
                    download(data.name + '.docx', data.word_file);
                    // download(data.contract_name + '.docx', data.word_file);
                });
            }

			var promisesArr = [];
			if (data.associated){
				if (data.associated.length > 0) {
					$.each(data.associated, function(i, v) {
						promisesArr.push(ContractsFactory.get.metadata(v.id));
					});
					
					var promise = $q.all(promisesArr);
					promise.then(function(response){
						if (response) {
							if (response.length > 0) {
								for (var kk=0;kk<response.length;kk++) {
									var rdata = response[kk].data;
									data.associated[kk].total_pages = rdata.number_of_pages
								}
							}
						}
					},function(err){
						console.log('error in getting total number of pages of associated contracts...')
						console.log(err)
					})
				}  
			}

			// Associated files that are not in elasticbeanstalk
            // Files in supporting-documents folder/
            console.log(data.name)
			$http.get('/get_supporting_documents.php?contract_name=' + data.name, { cache: true }).success(function(responseData) {
				$scope.data.supporting_contracts_extra = responseData;
			});
		});
  
	}

}]);

myApp.factory('MapsFactory',function($http){
  var MapsFactory = null;
  MapsFactory = {
    get : {
      contract_metadata : function(contract_id){
        var p = $http({
          url: api + 'contract/' + contract_id + '/metadata',
          method: 'GET'
        });
        return p;
      },
      geojson : function(){
        var p = $http({
          url: '../get-geojson-files.php',
          method: 'GET'
        });
        return p;
      }
    }
  }
  return MapsFactory;
});

myControllers.controller('MapsController', ['$scope', '$http', '$routeParams','MapsFactory','$q',
  function ($scope, $http, $routeParams,MapsFactory,$q) {

  var mymap = L.map('map-container').setView([11.717, 118.99], 6);
  mymap.zoomControl.setPosition('topright');
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a hreflol="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'jerico.pbk5hmjh',
    accessToken: 'pk.eyJ1IjoiamVyaWNvIiwiYSI6ImNpbGluc3BmdzM5cGF0c2twb3N5Mjd4NTAifQ.G5ZIkURpUJsBCd0FZO_1fA'  
  }).addTo(mymap)

  /* Sample Code
  var geodata = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },

    "features": [
      { "type": "Feature", "properties": { "contract": "MPSA_007_92_X", "type": "Contract_Area", "num": "1", "full_name": "MPSA_007_92_X_Contract_Area_1", "id": 1 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 125.7916667, 9.45 ], [ 125.7833333, 9.5 ], [ 125.8583333, 9.5 ], [ 125.85, 9.45 ], [ 125.7916667, 9.45 ] ] ] } }
    ]
  };

  L.geoJson(geodata.features, {
    onEachFeature: function (feature, layer) {
      // console.log('this feature');
      // console.log(feature)
      layer.bindPopup(feature.properties.contract);
    }
  }).addTo(mymap);*/

  function getGeoJsonProp(){
    $scope.contractMetadata = []
    var p = MapsFactory.get.geojson();
    p.then(function(response){
      var contract_ids_arr = []
      var promise_arr = []

      if (response.data) {
        var contract_detail = response.data;

        for (var idx=0;idx<contract_detail.length;idx++) {
          var curr_geo_json_file = contract_detail[idx].filename;
          var cid = curr_geo_json_file.split('.')[0];
          promise_arr.push(MapsFactory.get.contract_metadata(cid));
          contract_ids_arr.push(cid)    
        }

        if (promise_arr) {
          // 1. Company name (or names)
          // 2. Type of contract
          // 3. Resource
          // 4. Contract name (with hyperlink to direct to the contract)
          $q.all(promise_arr).then(function(responseData){
            if (responseData) {
              for (var kkidx=0;kkidx<responseData.length;kkidx++) {
                if (responseData[kkidx].data) {

                  var company = '',type_of_contract='',resource='',contract_name='', file_url='', contract_id='', main_contract_id="", total_pages=0 ;
                  if (responseData[kkidx].data) {
                    contract_id = responseData[kkidx].data.id; //contract_id; // Is the parentContractId
                    if (responseData[kkidx].data.participation) {
                      if (responseData[kkidx].data.participation[0])  {
                        company = responseData[kkidx].data.participation[0].company.name
                      }
                    }
                    if (responseData[kkidx].data.contract_type) {
                      type_of_contract = responseData[kkidx].data.contract_type;//.join(', ');
                    }
                    if (responseData[kkidx].data.resource) {
                      resource = responseData[kkidx].data.resource.join(', ')
                    }
                    if (responseData[kkidx].data.name) {
                      contract_name = responseData[kkidx].data.name;//contract_name
                    }

                    // For non-supporting
                    if (responseData[kkidx].data.is_associated_document) {
                      if (responseData[kkidx].data.is_associated_document===false) {
                        if (responseData[kkidx].data.associated) {
                          var supporting_contracts = responseData[kkidx].data.associated;
                          if (supporting_contracts[0]) {
                            main_contract_id = supporting_contracts[0].id
                          }
                        }
                      }  
                    }                   

                    if (responseData[kkidx].data.file) {
                      if (responseData[kkidx].data.file[0]) {
                        file_url = responseData[kkidx].data.file[0].url
                      }
                    }
                    if (responseData[kkidx].data.number_of_pages) {
                      total_pages = responseData[kkidx].data.number_of_pages
                    }
                  }
                  
                  for (var ccidx=0;ccidx<contract_detail.length;ccidx++) {
                    if (contract_detail[ccidx].filename===contract_id+".geojson") {
                      try {
                        L.geoJson(contract_detail[ccidx].geojsonProperty.features, {
                          onEachFeature: function (feature, layer) {   
                            // Tabular
                            /*var html = "<table cellspacing=\"3\" cellpadding=\"5\">";
                            html += "<tr><td width=\"45%\" class=\"ta-left va-top\"><strong>Company Name: </strong></td><td width=\"55%\" class=\"ta-left va-top\">"+company+"</td></tr>";
                            html += "<tr><td class=\"ta-left va-top\"><strong>Type of Contract: </strong></td><td class=\"ta-left va-top\">"+type_of_contract+"</td></tr>";
                            html += "<tr><td class=\"ta-left va-top\"><strong>Resource: </strong> </td><td class=\"ta-left va-top\">"+resource+"</td></tr>";
                            html += "<tr><td class=\"ta-left va-top\"><strong>Contract Name: </strong> </td><td class=\"ta-left va-top\"><a href=\"javascript:window.open('"+file_url+"')\">"+contract_name+"</a></td></tr>";
                            html += "</table>";*/

                            // Divs
                            var html = '<div class="tooltip-wrapper">';
                            html += '<div class="tooltip-detail"><div class="tooltip-label">Company Name</div><div class="tooltip-value">'+company+'</div></div>';
                            html += '<div class="tooltip-detail"><div class="tooltip-label">Type of Contract</div><div class="tooltip-value">'+type_of_contract+'</div></div>';
                            html += '<div class="tooltip-detail"><div class="tooltip-label">Resource</div><div class="tooltip-value">'+resource+'</div></div>';
                            // html += '<div class="tooltip-detail"><div class="tooltip-label">Contract Name</div><div class="tooltip-value"><a href="javascript:window.open(\'contract-view.html?contractId='+main_contract_id+'&contractTitle='+contract_name+'&contractParentId='+contract_id+'&totalPages='+total_pages+'\',\''+contract_name+'\',\'width=600,height=768\')">'+contract_name+'</a></div></div>';
                            html += '<div class="tooltip-detail"><div class="tooltip-label">Contract Name</div><div class="tooltip-value"><a href="javascript:window.open(\'../contract/'+contract_id+'\',\'width=600,height=768\')">'+contract_name+'</a></div></div>';
                            html += '</div>';
                            layer.bindPopup(html);
                          }
                        }).addTo(mymap); 
                      }
                      catch(err){
                        console.log(err+" | "+contract_id+".geojson");
                      }                      
                    }
                  }

                  (function(){
                    var mapContainer = document.getElementById('map-container');
                    mapContainer.style.minHeight = (window.height-25)+'px'  
                  })()
                }
              }
            }
          })
        }
      }
    }, function(err){
      console.log(err)
    })  
  }

  getGeoJsonProp();
  
}]);

myControllers.controller('MMTController', ['$scope', '$http', '$routeParams', '$q','ContractsFactory','NewContractsFactory',
  function ($scope, $http, $routeParams, $q, ContractsFactory, NewContractsFactory) {
    
    $scope.total_num_of_contracts = 'Calculating';
    $scope.searchInProgress = false
    var query = '';
    var apiContracts = {results: [], total: 0} // $scope.data
    $scope.data = {results: [], total: 0}

    $scope.searchTerm = '';
    /** Show search progress indicator */
    $('.search-loading').show();

    $scope.compareSupportDocs=function(contractIds){
        $scope.total_num_of_contracts = 'Calculating';
        var totalNumContracts = 0;
        if (contractIds.length > 0) {   
            var promiseArr = [];
            for (var idx=0;idx<contractIds.length;idx++) {
                promiseArr.push(ContractsFactory.get.metadata(contractIds[idx]));
            }
            $scope.bulkPromise = $q.all(promiseArr)
            $scope.bulkPromise
                .then(function(responseValues){
                    if (responseValues) {
                        if (responseValues.length) {
                            for (var kk=0;kk<responseValues.length;kk++) {
                                var returnData = responseValues[kk].data
                                if (returnData.type==='Contract') {
                                    totalNumContracts++;
                                }
                            }
                        }
                    }
                    // $scope.total_num_of_contracts = totalNumContracts;
                    // Get additional contracts
                    getAdditionalContracts(totalNumContracts)
                }, function(err){
                  $scope.searchInProgress = false
                  $('.search-loading').hide();
                  if ($scope.data && $scope.data.results.length < 1) {
                      $('.search-no-result').show()
                  }
                })
        } else {
            // Get additional contracts
            getAdditionalContracts(totalNumContracts)
        }
    }

    function runSearch () {
        $scope.searchInProgress = true  

        $http.get(api + 'contracts/search?from=0&per_page=1000&group=metadata&country_code=ph&' + query, { cache: true })
            .success(function(data) {
                var resultIds = []
                var data = filterData(data);

                apiContracts = data.results

                $(window).trigger('rootData.loaded')
                if (data.results) {
                    var sResults = data.results;
                    for (var idx=0;idx<sResults.length;idx++) {
                        if ($.inArray(sResults[idx].id,resultIds)==-1) {
                            resultIds.push(sResults[idx].id);
                        }
                    }
                }
                // Filters supporting documents 
                // $scope.compareSupportDocs(resultIds);
                
                // Get Additional Contracts
                getAdditionalContracts();
            })
            .error(function(error) {
                $scope.searchInProgress = false
                $('.search-loading').hide();
                $('.search-no-result').show()
                // window.location.reload();
            });
    }

    runSearch()

	function inArr(arr,needle) {
		if (arr) {
			for (var idx=0;idx<arr.length;idx++) {
				if (arr[idx]==needle) {
					return true;
				}
			}
		}
		return false;
	}

	function getIndexInArr(arr,attr,val){
		if (arr) {
			for (var idx=0;idx<arr.length;idx++) {
				if (arr[idx][attr]==val) {
					return idx;
				}
			}
		}
		return -1;
	}

	function getYearSigned(signDate){
		if (signDate) {
			return signDate.split('/')[2];
		}
	}

	function getResource(resourceStr) {
		if (resourceStr.match('/ and /gi')) {
			var tempData = resourceStr.split(' and ');
			if (tempData[0].match('/, /gi')) {
				var comData = tempData[0].split(', ');
				comData.push(tempData[1]);
				return comData;
			}
			else {
				return tempData;
			}
		}
		return [resourceStr];
    }
    
	function getAdditionalContracts(){        
        apiContracts = [...apiContracts, ...__SCS__.allStaticContracts]
    
        var allContractNames = apiContracts.map(contract => {
            return contract.name 
        })

        if (allContractNames.length > 0) {

            var promisesArr = []
            allContractNames.forEach(cname=>{
                promisesArr.push(ContractsFactory.get.supportingDocs(cname))
            })
            
            var allSuppDocs = []
            $q.all(promisesArr)
                .then(function(responseResult){
                    if (responseResult) {
                        if (responseResult.length) {
                            for (var kk=0;kk<responseResult.length;kk++) {
                                var returnData = responseResult[kk]
                                const cname = returnData.config.url.split('contract_name=')[1]
                                allSuppDocs.push({
                                    contract_name: cname,
                                    supportingDocs: returnData.data
                                })
                            }
                        }
                    }
                    
                    filterSupportingDocuments(allSuppDocs)
                }, function(err){
                    $scope.searchInProgress = false
                    $('.search-loading').hide();
                })
        }
	}

    function getContractDataByName(cname) {
        var res = apiContracts.filter(contract => {
            return contract.name === cname 
        })
        if (res.length > 0) {
            return res[0]
        }
        return null
    }

    function filterSupportingDocuments(allSuppDocs) {
        var mmtExp = new RegExp(/mmt|mmt rep/,'gi')
        // var eisExp = new RegExp(/eis|eis rep|eis_/,'gi')
        var contractsWithMMT = allSuppDocs.filter(contract => {
            if (contract.supportingDocs && contract.supportingDocs.length > 0) {
                var res = contract.supportingDocs.filter(doc => {
                    return doc.match(mmtExp)
                })
                return res.length > 0
            }
        })
        // var contractsWithEIS = allSuppDocs.filter(contract => {
        //     if (contract.supportingDocs && contract.supportingDocs.length > 0) {
        //         var res = contract.supportingDocs.filter(doc => {
        //             return doc.match(eisExp)
        //         })
        //         return res.length > 0
        //     }
        // })
        var dataWithMMT = []
        if (contractsWithMMT.length > 0) {
            contractsWithMMT.forEach(contract => {
                // contract.data = getContractDataByName(contract.contract_name)
                let cdata = getContractDataByName(contract.contract_name)
                cdata.supporting_contracts_extra = contract.supportingDocs
                dataWithMMT.push(cdata)
            })
        }

        $scope.data.results = _.orderBy(dataWithMMT, ['name'], ['asc'])
        $scope.data.total = dataWithMMT.length
        $scope.searchInProgress = false
        $('.search-loading').hide();
    }
	
}]);


myControllers.controller('EISController', ['$scope', '$http', '$routeParams', '$q','ContractsFactory','NewContractsFactory',
  function ($scope, $http, $routeParams, $q, ContractsFactory, NewContractsFactory) {
    
    $scope.total_num_of_contracts = 'Calculating';
    $scope.searchInProgress = false
    var query = '';
    var apiContracts = {results: [], total: 0} // $scope.data
    $scope.data = {results: [], total: 0}

    $scope.searchTerm = '';
    /** Show search progress indicator */
    $('.search-loading').show();

    $scope.compareSupportDocs=function(contractIds){
        $scope.total_num_of_contracts = 'Calculating';
        var totalNumContracts = 0;
        if (contractIds.length > 0) {   
            var promiseArr = [];
            for (var idx=0;idx<contractIds.length;idx++) {
                promiseArr.push(ContractsFactory.get.metadata(contractIds[idx]));
            }
            $scope.bulkPromise = $q.all(promiseArr)
            $scope.bulkPromise
                .then(function(responseValues){
                    if (responseValues) {
                        if (responseValues.length) {
                            for (var kk=0;kk<responseValues.length;kk++) {
                                var returnData = responseValues[kk].data
                                if (returnData.type==='Contract') {
                                    totalNumContracts++;
                                }
                            }
                        }
                    }
                    // $scope.total_num_of_contracts = totalNumContracts;
                    // Get additional contracts
                    getAdditionalContracts(totalNumContracts)
                }, function(err){
                  $scope.searchInProgress = false
                  $('.search-loading').hide();
                  if ($scope.data && $scope.data.results.length < 1) {
                      $('.search-no-result').show()
                  }
                })
        } else {
            // Get additional contracts
            getAdditionalContracts(totalNumContracts)
        }
    }

    function runSearch () {
        $scope.searchInProgress = true  

        $http.get(api + 'contracts/search?from=0&per_page=1000&group=metadata&country_code=ph&' + query, { cache: true })
            .success(function(data) {
                var resultIds = []
                var data = filterData(data);

                apiContracts = data.results

                $(window).trigger('rootData.loaded')
                if (data.results) {
                    var sResults = data.results;
                    for (var idx=0;idx<sResults.length;idx++) {
                        if ($.inArray(sResults[idx].id,resultIds)==-1) {
                            resultIds.push(sResults[idx].id);
                        }
                    }
                }
                // Filters supporting documents 
                // $scope.compareSupportDocs(resultIds);
                
                // Get Additional Contracts
                getAdditionalContracts();
            })
            .error(function(error) {
                $scope.searchInProgress = false
                $('.search-loading').hide();
                $('.search-no-result').show()
                // window.location.reload();
            });
    }

    runSearch()

	function inArr(arr,needle) {
		if (arr) {
			for (var idx=0;idx<arr.length;idx++) {
				if (arr[idx]==needle) {
					return true;
				}
			}
		}
		return false;
	}

	function getIndexInArr(arr,attr,val){
		if (arr) {
			for (var idx=0;idx<arr.length;idx++) {
				if (arr[idx][attr]==val) {
					return idx;
				}
			}
		}
		return -1;
	}

	function getYearSigned(signDate){
		if (signDate) {
			return signDate.split('/')[2];
		}
	}

	function getResource(resourceStr) {
		if (resourceStr.match('/ and /gi')) {
			var tempData = resourceStr.split(' and ');
			if (tempData[0].match('/, /gi')) {
				var comData = tempData[0].split(', ');
				comData.push(tempData[1]);
				return comData;
			}
			else {
				return tempData;
			}
		}
		return [resourceStr];
    }
    
	function getAdditionalContracts(){        
        apiContracts = [...apiContracts, ...__SCS__.allStaticContracts]
    
        var allContractNames = apiContracts.map(contract => {
            return contract.name 
        })

        if (allContractNames.length > 0) {

            var promisesArr = []
            allContractNames.forEach(cname=>{
                promisesArr.push(ContractsFactory.get.supportingDocs(cname))
            })
            
            var allSuppDocs = []
            $q.all(promisesArr)
                .then(function(responseResult){
                    if (responseResult) {
                        if (responseResult.length) {
                            for (var kk=0;kk<responseResult.length;kk++) {
                                var returnData = responseResult[kk]
                                const cname = returnData.config.url.split('contract_name=')[1]
                                allSuppDocs.push({
                                    contract_name: cname,
                                    supportingDocs: returnData.data
                                })
                            }
                        }
                    }
                    
                    filterSupportingDocuments(allSuppDocs)
                }, function(err){
                    $scope.searchInProgress = false
                    $('.search-loading').hide();
                })
        }
	}

    function getContractDataByName(cname) {
        var res = apiContracts.filter(contract => {
            return contract.name === cname 
        })
        if (res.length > 0) {
            return res[0]
        }
        return null
    }

    function filterSupportingDocuments(allSuppDocs) {
        var eisExp = new RegExp(/eis|eis rep|eis_/,'gi')
        var contractsWithEIS = allSuppDocs.filter(contract => {
            if (contract.supportingDocs && contract.supportingDocs.length > 0) {
                var res = contract.supportingDocs.filter(doc => {
                    return doc.match(eisExp)
                })
                return res.length > 0
            }
        })
        var dataWithEIS = []
        if (contractsWithEIS.length > 0) {
            contractsWithEIS.forEach(contract => {
                let cdata = getContractDataByName(contract.contract_name)
                cdata.supporting_contracts_extra = contract.supportingDocs
                dataWithEIS.push(cdata)
            })
        }

        $scope.data.results =  _.orderBy(dataWithEIS, ['name'], ['asc'])
        $scope.data.total = dataWithEIS.length
        $scope.searchInProgress = false
        $('.search-loading').hide();
    }
	
}]);


myControllers.controller('SummaryDataController', [function () {
    
    /** Show search progress indicator */
    $('.search-loading').show();

    setTimeout(()=>{
        $('.search-loading').hide();
    }, 500)
	
}]);

myControllers.controller('DMPFController', [function () {
    
    /** Show search progress indicator */
    $('.search-loading').show();

    setTimeout(()=>{
        $('.search-loading').hide();
    }, 500)
	
}]);


myControllers.controller('ASDMPController', ['$scope', '$http', '$routeParams', '$q','ContractsFactory','NewContractsFactory',
  function ($scope, $http, $routeParams, $q, ContractsFactory, NewContractsFactory) {
    
    $scope.total_num_of_contracts = 'Calculating';
    $scope.searchInProgress = false
    var query = '';
    var apiContracts = {results: [], total: 0} // $scope.data
    $scope.data = {results: [], total: 0}

    $scope.searchTerm = '';
    /** Show search progress indicator */
    $('.search-loading').show();

    $scope.compareSupportDocs=function(contractIds){
        $scope.total_num_of_contracts = 'Calculating';
        var totalNumContracts = 0;
        if (contractIds.length > 0) {   
            var promiseArr = [];
            for (var idx=0;idx<contractIds.length;idx++) {
                promiseArr.push(ContractsFactory.get.metadata(contractIds[idx]));
            }
            $scope.bulkPromise = $q.all(promiseArr)
            $scope.bulkPromise
                .then(function(responseValues){
                    if (responseValues) {
                        if (responseValues.length) {
                            for (var kk=0;kk<responseValues.length;kk++) {
                                var returnData = responseValues[kk].data
                                if (returnData.type==='Contract') {
                                    totalNumContracts++;
                                }
                            }
                        }
                    }
                    // $scope.total_num_of_contracts = totalNumContracts;
                    // Get additional contracts
                    getAdditionalContracts(totalNumContracts)
                }, function(err){
                  $scope.searchInProgress = false
                  $('.search-loading').hide();
                  if ($scope.data && $scope.data.results.length < 1) {
                      $('.search-no-result').show()
                  }
                })
        } else {
            // Get additional contracts
            getAdditionalContracts(totalNumContracts)
        }
    }

    function runSearch () {
        $scope.searchInProgress = true  

        $http.get(api + 'contracts/search?from=0&per_page=1000&group=metadata&country_code=ph&' + query, { cache: true })
            .success(function(data) {
                var resultIds = []
                var data = filterData(data);

                apiContracts = data.results

                $(window).trigger('rootData.loaded')
                if (data.results) {
                    var sResults = data.results;
                    for (var idx=0;idx<sResults.length;idx++) {
                        if ($.inArray(sResults[idx].id,resultIds)==-1) {
                            resultIds.push(sResults[idx].id);
                        }
                    }
                }
                // Filters supporting documents 
                // $scope.compareSupportDocs(resultIds);
                
                // Get Additional Contracts
                getAdditionalContracts();
            })
            .error(function(error) {
                $scope.searchInProgress = false
                $('.search-loading').hide();
                $('.search-no-result').show()
                // window.location.reload();
            });
    }

    runSearch()

	function inArr(arr,needle) {
		if (arr) {
			for (var idx=0;idx<arr.length;idx++) {
				if (arr[idx]==needle) {
					return true;
				}
			}
		}
		return false;
	}

	function getIndexInArr(arr,attr,val){
		if (arr) {
			for (var idx=0;idx<arr.length;idx++) {
				if (arr[idx][attr]==val) {
					return idx;
				}
			}
		}
		return -1;
	}

	function getYearSigned(signDate){
		if (signDate) {
			return signDate.split('/')[2];
		}
	}

	function getResource(resourceStr) {
		if (resourceStr.match('/ and /gi')) {
			var tempData = resourceStr.split(' and ');
			if (tempData[0].match('/, /gi')) {
				var comData = tempData[0].split(', ');
				comData.push(tempData[1]);
				return comData;
			}
			else {
				return tempData;
			}
		}
		return [resourceStr];
    }
    
	function getAdditionalContracts(){        
        apiContracts = [...apiContracts, ...__SCS__.allStaticContracts]
    
        var allContractNames = apiContracts.map(contract => {
            return contract.name 
        })

        if (allContractNames.length > 0) {

            var promisesArr = []
            allContractNames.forEach(cname=>{
                promisesArr.push(ContractsFactory.get.supportingDocs(cname))
            })
            
            var allSuppDocs = []
            $q.all(promisesArr)
                .then(function(responseResult){
                    if (responseResult) {
                        if (responseResult.length) {
                            for (var kk=0;kk<responseResult.length;kk++) {
                                var returnData = responseResult[kk]
                                const cname = returnData.config.url.split('contract_name=')[1]
                                allSuppDocs.push({
                                    contract_name: cname,
                                    supportingDocs: returnData.data
                                })
                            }
                        }
                    }
                    
                    filterSupportingDocuments(allSuppDocs)
                }, function(err){
                    $scope.searchInProgress = false
                    $('.search-loading').hide();
                })
        }
	}

    function getContractDataByName(cname) {
        var res = apiContracts.filter(contract => {
            return contract.name === cname 
        })
        if (res.length > 0) {
            return res[0]
        }
        return null
    }

    function filterSupportingDocuments(allSuppDocs) {
        var exp = new RegExp(/asdmp/,'gi')
        var contractsWithEIS = allSuppDocs.filter(contract => {
            if (contract.supportingDocs && contract.supportingDocs.length > 0) {
                var res = contract.supportingDocs.filter(doc => {
                    return doc.match(exp)
                })
                return res.length > 0
            }
        })
        var dataWithEIS = []
        if (contractsWithEIS.length > 0) {
            contractsWithEIS.forEach(contract => {
                let cdata = getContractDataByName(contract.contract_name)
                cdata.supporting_contracts_extra = contract.supportingDocs
                dataWithEIS.push(cdata)
            })
        }

        $scope.data.results =  _.orderBy(dataWithEIS, ['name'], ['asc'])
        $scope.data.total = dataWithEIS.length
        $scope.searchInProgress = false
        $('.search-loading').hide();
    }
	
}]);


