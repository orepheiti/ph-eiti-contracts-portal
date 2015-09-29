var myControllers = angular.module('myControllers', ['ngAnimate']);

var api = 'http://rc-elasticsearch.elasticbeanstalk.com/api/';

myControllers.controller('MainController', ['$scope', function($scope) {

}]);

myControllers.controller('IndexController', ['$scope', '$http', function ($scope, $http) {
  $http.get(api + 'contracts?per_page=10000', { cache: true } ).success(function(data) {

    $scope.data = data;

  });
}]);

myControllers.controller('SearchController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
  var q = $routeParams.q;
  $http.get(api + 'search/' + q, { cache: true }).success(function(data) {

    var data = JSON.parse(data);

    /*
    var html = '';
    $.each(data.results, function(i, v) {
      html += "<tr><td><a href='contract.html'>"+ v.contract_name +"</a></td></tr>"
    });

    $('.table-contract-list').append(html);

    $('.contract-search-number-wrap span').html(data.total);

    $scope.results = data;
    */

  });

}]);

