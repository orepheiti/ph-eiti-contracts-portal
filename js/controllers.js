var myControllers = angular.module('myControllers', ['ngAnimate']);

var api = 'http://54.173.9.19/api/';
var options = "&country_code=ph"

myControllers.controller('MainController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
  $http.get(api + 'contracts/search?q=&from=0&per_page=10000&group=metadata&country=ph', { cache: true }).success(function(data) {

    //console.log(data);

    deleteByValue('Forum Energy Plc', data.company_name);
    deleteByValue('The Philodrill Corporation', data.company_name);
    deleteByValue('Shell Philippines Exploration B. V. ', data.company_name);

    var data = filterData(data);

    $rootScope.rootData = data;

    $(window).trigger('mainData.loaded')

  }).error(function() {
    console.log('error!');
    window.location.reload();
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

    $scope.searchTerm = "Search results for <span>" + decodeURIComponent(q) + "</span>";

    query += 'q=' + q + '&'

  }

  if (year) {

    $scope.searchTerm = 'Contracts from ' + year;

    query += 'year=' + year + '&'

  }

  if (company) {

    $scope.searchTerm = 'Contracts from <span>' + decodeURIComponent(company) + '</span>';

    query += 'q=' + company + '&'

  }


  if (resource) {

    $scope.searchTerm = 'Contracts with resource: <span>' + decodeURIComponent(resource) + '</span>';

    query += 'resource=' + resource + '&'

  }

  if (window.location.pathname == '/contracts') {
    query = '';
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
      download(data.contract_name + '.html', data.word_file);
    });

    console.log(data);

  });
}]);
