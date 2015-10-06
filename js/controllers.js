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

  if (q) {

    $scope.searchTerm = "Search results for " + q;

    $http.get(api + 'contracts/search?q=' + q + '&from=0&per_page=1000&group=metadata&country=ph', { cache: true }).success(function(data) {
      $scope.data = data;
    });

  }

  if (year) {

    $scope.searchTerm = 'Contracts from ' + year;

    $http.get(api + 'contracts/search?year=' + year + '&from=0&per_page=1000&group=metadata&country=ph', { cache: true }).success(function(data) {
      $scope.data = data;
    });

  }

  if (company) {

    $scope.searchTerm = 'Contracts from ' + decodeURIComponent(company);

    $http.get(api + 'contracts/search?company_name=' + company + '&from=0&per_page=1000&group=metadata&country=ph', { cache: true }).success(function(data) {
      $scope.data = data;
    });

  }


  if (resource) {

    $scope.searchTerm = 'Contracts with resource: ' + resource;

    $http.get(api + 'contracts/search?resource=' + resource + '&from=0&per_page=1000&group=metadata&country=ph', { cache: true }).success(function(data) {
      $scope.data = data;
    });

  }

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
