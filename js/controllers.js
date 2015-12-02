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

    console.log(data);

  });
}]);
