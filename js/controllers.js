var myControllers = angular.module('myControllers', ['ngAnimate']);

var api = 'http://api.resourcecontracts.org/';
var options = "&country_code=ph"

myControllers.controller('MainController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
  $http.get(api + 'contracts/search?q=&from=0&per_page=10000&group=metadata&country=ph', { cache: true }).success(function(data) {

    var data = filterData(data);

    data.hydrocarbon_companies = hydrocarbon_companies;

    $rootScope.rootData = data;

    $(window).trigger('mainData.loaded')

  }).error(function() {
    console.log('error!');
    window.location.reload();
  });
}]);

myControllers.controller('IndexController', ['$scope', 'ngDialog', '$http', function ($scope, ngDialog, $http) {
  $scope.openRegions = function() {
    ngDialog.open({
      template: '/partials/modal-regions.html',
      class: 'ngdialog-theme-default'
    });
  }

}]);

myControllers.controller('SearchController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
  var q = getParam('q');
  var year = getParam('year');
  var resource = getParam('resource');
  var company = getParam('company_name');

  var query = '';

  $scope.searchTerm = '';

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

    $scope.searchTerm = 'Contracts signed in <span>' + year + '</span>' + ' from <span>' + decodeURIComponent(company) + '</span>' + ' with resource: <span>' + resource + '</span>';;

  }

  if (window.location.pathname == '/contracts') {
    query = '';
    $scope.searchTerm = '<span>Mining, Oil & Gas Contracts from the Philippines</span>';

  }

  if ($scope.searchTerm == '') {
    $scope.searchTerm = '<span>Mining, Oil & Gas Contracts from the Philippines</span>';
  }

  $http.get(api + 'contracts/search?from=0&per_page=1000&group=metadata&country=ph&' + query, { cache: true }).success(function(data) {

    var data = filterData(data);

    $scope.data = data;

    $scope.predicate = 'contract_name';
    $scope.reverse = false;
    $scope.order = function(predicate) {
      $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse: false;
      $scope.predicate = predicate;
    };

    $('.search-loading').hide();

    if (data.results.length < 1) {
      $('.search-no-result').show()
    }

    else {
      //$('.search-result-wrapper').css('max-height', $(window).height() - $('.filter-wrapper').height() - $('.search-top-wrapper').height() - $('.navbar').height() );
    }

    $(window).trigger('rootData.loaded')

  }).error(function() {
    console.log('error!');
    window.location.reload();
  });

}]);

myControllers.controller('ContractController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
  var id = $routeParams.id;
  $http.get(api + 'contract/' + id + '/metadata', { cache: true } ).success(function(data) {

    $scope.data = data;

    $('.download-word').on('click', function() {
      download(data.contract_name + '.docx', data.word_file);
    });

    if (data.supporting_contracts.length > 0) {
      $.each(data.supporting_contracts, function(i, v) {
        console.log(v);
        var cur = i;
        $.ajax({
          url: api + 'contract/' + v.id + '/metadata',
          dataType: 'json',
          success: function(data2) {
            data.supporting_contracts[cur].total_pages = data2.total_pages;
            console.log(data2.total_pages);
            $scope.$apply(function(){ $scope.data = data; })
            $scope.data = data;
          }
        });
      });

    }

    $http.get('/get_supporting_documents.php?contract_name=' + data.contract_name, { cache: true }).success(function(data) {
      $scope.data.supporting_contracts_extra = data;
    });


  });
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

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'jerico.pbk5hmjh',
    accessToken: 'pk.eyJ1IjoiamVyaWNvIiwiYSI6ImNpbGluc3BmdzM5cGF0c2twb3N5Mjd4NTAifQ.G5ZIkURpUJsBCd0FZO_1fA'
  }).addTo(mymap);

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

                  var company = '',type_of_contract='',resource='',contract_name='', file_url='', contract_id='';
                  if (responseData[kkidx].data) {
                    contract_id = responseData[kkidx].data.contract_id;
                    if (responseData[kkidx].data.company) {
                      if (responseData[kkidx].data.company[0])  {
                        company = responseData[kkidx].data.company[0].name
                      }
                    }
                    if (responseData[kkidx].data.type_of_contract) {
                      if (responseData[kkidx].data.type_of_contract[0])  {
                        type_of_contract = responseData[kkidx].data.type_of_contract[0]
                      }
                    }
                    if (responseData[kkidx].data.resource) {
                      if (responseData[kkidx].data.resource[0])  {
                        resource = responseData[kkidx].data.resource[0]
                      }
                    }
                    if (responseData[kkidx].data.contract_name) {
                      contract_name = responseData[kkidx].data.contract_name
                    }
                    if (responseData[kkidx].data.file_url) {
                      file_url = responseData[kkidx].data.file_url
                    }
                  }
                  
                  for (var ccidx=0;ccidx<contract_detail.length;ccidx++) {
                    if (contract_detail[ccidx].filename===contract_id+".geojson") {
                      L.geoJson(contract_detail[ccidx].geojsonProperty.features, {
                        onEachFeature: function (feature, layer) {   
                          var html = "<ul style='padding:0px;margin:0px;list-style-type:none;'>";
                          html += "<li><strong>Company name: </strong> "+company+"</li>";
                          html += "<li><strong>Type of contract: </strong> "+type_of_contract+"</li>";
                          html += "<li><strong>Resource: </strong> "+resource+"</li>";
                          html += "<li><strong>Contract name: </strong> <a href="+file_url+">"+contract_name+"</a></li>";
                          html += "</ul>";
                          layer.bindPopup(html);
                        }
                      }).addTo(mymap); 
                    }
                  }
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
