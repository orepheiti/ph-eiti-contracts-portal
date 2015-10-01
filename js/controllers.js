var myControllers = angular.module('myControllers', ['ngAnimate']);

var api = 'http://rc-elasticsearch.elasticbeanstalk.com/api/';
var options = "&country_code=ph"

myControllers.controller('MainController', ['$scope', function($scope) {

}]);

myControllers.controller('IndexController', ['$scope', '$http', function ($scope, $http) {
  $http.get(api + 'contracts?per_page=10000' + options, { cache: true } ).success(function(data) {
    $scope.data = data;
  });
}]);

myControllers.controller('SearchController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
  var q = getParam('q');
  $scope.searchTerm = q;
  $http.get(api + 'contracts/search?q=' + q + '&from=0&per_page=1000&group=metadata' + options, { cache: true }).success(function(data) {
    $scope.data = data;
  });
}]);

myControllers.controller('ContractsController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
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
