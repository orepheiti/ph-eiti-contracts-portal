var myControllers = angular.module('myControllers', ['ngAnimate']);

var api = 'http://rc-elasticsearch.elasticbeanstalk.com/api/';
var options = "&country_code=ph"

myControllers.controller('MainController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
  $http.get(api + 'contracts/search?q=&from=0&per_page=10000&group=metadata&country=ph', { cache: true } ).success(function(data) {
    deleteByValue('Oil', data.resource);
    deleteByValue('Gas', data.resource);
    $rootScope.rootData = data;
  });
}]);

myControllers.controller('IndexController', ['$scope', '$http', function ($scope, $http) {

}]);

myControllers.controller('SearchController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
  var q = getParam('q');
  var year = getParam('year');
  var resource = getParam('resource');
  var company = getParam('company_name');

  var query = '';

  if (q) {

    $scope.searchTerm = "Search results for " + decodeURIComponent(q);

    query += 'q=' + q + '&'

  }

  if (year) {

    $scope.searchTerm = 'Contracts from ' + year;

    query += 'year=' + year + '&'

  }

  if (company) {

    $scope.searchTerm = 'Contracts from ' + decodeURIComponent(company);

    query += 'company_name=' + company + '&'

  }


  if (resource) {

    $scope.searchTerm = 'Contracts with resource: ' + resource;

    query += 'resource=' + resource + '&'

  }

  $http.get(api + 'contracts/search?from=0&per_page=1000&group=metadata&country=ph&' + query, { cache: true }).success(function(data) {
    $scope.data = data;
    $(window).trigger('rootData.loaded')
  });

}]);

myControllers.controller('ContractsController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {

  $scope.searchTerm = 'Mining, Oil & Gas Contracts from the Philippines';

  $http.get(api + 'contracts?per_page=10000' + options, { cache: true } ).success(function(data) {
    $scope.data = data;
  });

}]);



myControllers.controller('ContractController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
  var id = $routeParams.id;
  $http.get(api + 'contract/' + id + '/metadata', { cache: true } ).success(function(data) {

    $scope.data = data;

    console.log(data);

  });
}]);
