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

myControllers.controller('MapsController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {

  var mymap = L.map('map-container').setView([11.717, 118.99], 6);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'jerico.pbk5hmjh',
    accessToken: 'pk.eyJ1IjoiamVyaWNvIiwiYSI6ImNpbGluc3BmdzM5cGF0c2twb3N5Mjd4NTAifQ.G5ZIkURpUJsBCd0FZO_1fA'
  }).addTo(mymap);

  var geodata = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },

    "features": [
      { "type": "Feature", "properties": { "contract": "MPSA_007_92_X", "type": "Contract_Area", "num": "1", "full_name": "MPSA_007_92_X_Contract_Area_1", "id": 1 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 125.7916667, 9.45 ], [ 125.7833333, 9.5 ], [ 125.8583333, 9.5 ], [ 125.85, 9.45 ], [ 125.7916667, 9.45 ] ] ] } }
    ]
  };
  var geodata2 = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },

    "features": [
      { "type": "Feature", "properties": { "contract": "MLCD_MRD_509_III", "type": "Mario", "num": "1", "full_name": "MLCD_MRD_509_III_Mario_1", "id": 1 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 121.1407444, 15.07881389 ], [ 121.1407444, 15.08333333 ], [ 121.1416667, 15.08333333 ], [ 121.1416667, 15.07881389 ], [ 121.1407444, 15.07881389 ] ] ] } },
      { "type": "Feature", "properties": { "contract": "MLCD_MRD_509_III", "type": "Mario", "num": "2", "full_name": "MLCD_MRD_509_III_Mario_2", "id": 2 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 121.1458333, 15.075 ], [ 121.1458333, 15.07708333 ], [ 121.15, 15.07708333 ], [ 121.15, 15.075 ], [ 121.1458333, 15.075 ] ] ] } },
      { "type": "Feature", "properties": { "contract": "MLCD_MRD_509_III", "type": "Mely", "num": "1", "full_name": "MLCD_MRD_509_III_Mely_1", "id": 3 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 121.1416667, 15.075 ], [ 121.1416667, 15.07916667 ], [ 121.15, 15.07916667 ], [ 121.15, 15.075 ], [ 121.1416667, 15.075 ] ] ] } },
      { "type": "Feature", "properties": { "contract": "MLCD_MRD_509_III", "type": "Mely", "num": "2", "full_name": "MLCD_MRD_509_III_Mely_2", "id": 4 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 121.1407444, 15.075 ], [ 121.1407444, 15.07881389 ], [ 121.1416667, 15.07881389 ], [ 121.1416667, 15.075 ], [ 121.1407444, 15.075 ] ] ] } },
      { "type": "Feature", "properties": { "contract": "MLCD_MRD_509_III", "type": "Mely", "num": "3", "full_name": "MLCD_MRD_509_III_Mely_3", "id": 5 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 121.1416667, 15.07708333 ], [ 121.1416667, 15.07916667 ], [ 121.15, 15.07916667 ], [ 121.15, 15.07708333 ], [ 121.1416667, 15.07708333 ] ] ] } },
      { "type": "Feature", "properties": { "contract": "MLCD_MRD_509_III", "type": "Mely", "num": "4", "full_name": "MLCD_MRD_509_III_Mely_4", "id": 6 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 121.1416667, 15.075 ], [ 121.1416667, 15.07708333 ], [ 121.1458333, 15.07708333 ], [ 121.1458333, 15.075 ], [ 121.1416667, 15.075 ] ] ] } }
    ]
  };

  var geodata3 = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },

    "features": [
      { "type": "Feature", "properties": { "contract": "MPSA_007_92_X", "type": "Contract_Area", "num": "1", "full_name": "MPSA_007_92_X_Contract_Area_1", "id": 1 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 125.7916667, 9.45 ], [ 125.7833333, 9.5 ], [ 125.8583333, 9.5 ], [ 125.85, 9.45 ], [ 125.7916667, 9.45 ] ] ] } }
    ]
  };

  L.geoJson(geodata.features, {
    onEachFeature: function (feature, layer) {
      layer.bindPopup(feature.properties.contract);
    }
  }).addTo(mymap);

  L.geoJson(geodata2.features, {
    onEachFeature: function (feature, layer) {
      layer.bindPopup(feature.properties.contract);
    }
  }).addTo(mymap);

  L.geoJson(geodata3.features, {
    onEachFeature: function (feature, layer) {
      layer.bindPopup(feature.properties.contract);
    }
  }).addTo(mymap);

}]);
