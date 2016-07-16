var myControllers = angular.module('myControllers', ['ngAnimate']);

var api = 'http://rc-api-stage.elasticbeanstalk.com/api/';
var options = "&country_code=ph"

myApp.factory('ContractsFactory',['$http',
  function($http){
    var wsurl = ['http://api.resourcecontracts.org','http://rc-api-stage.elasticbeanstalk.com/api'];
    var wsurl_idx = 1;
    var ContractsFactory = null;
    ContractsFactory = {
      get : {
        metadata : function(id){
          var promise = $http({
            url : wsurl[wsurl_idx]+'/contract/'+id+'/metadata',
            method : 'GET'
          });
          return promise;
        }
      }
    }
    return ContractsFactory;
}]);

myControllers.controller('MainController', ['$scope', '$rootScope', '$http', '$q','ContractsFactory',
  function($scope, $rootScope, $http,$q,ContractsFactory) {
  var resultIds = []
    
    $http.get(api + 'contracts/search?q=&from=0&per_page=10000&group=metadata&country_code=ph', { cache: true })
    .success(function(data) {
      var data = filterData(data);
      data.hydrocarbon_companies = hydrocarbon_companies;
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
    })
    .error(function(error) {
      console.log('search error in main controller!');
      console.log(error)
      // window.location.reload();
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

myControllers.controller('SearchController', ['$scope', '$http', '$routeParams', '$q','ContractsFactory',
  function ($scope, $http, $routeParams, $q, ContractsFactory) {
  $scope.total_num_of_contracts = 'Calculating';
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
    var promiseArr = [];
    for (var idx=0;idx<contractIds.length;idx++) {
      promiseArr.push(ContractsFactory.get.metadata(contractIds[idx]));
    }

    $scope.bulkPromise = $q.all(promiseArr);
    $scope.bulkPromise.then(function(responseValues){
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
      $scope.total_num_of_contracts = totalNumContracts;
    }, function(err){

    })
  }

  $http.get(api + 'contracts/search?from=0&per_page=1000&group=metadata&country_code=ph&' + query, { cache: true })
    .success(function(data) {
      var resultIds = []
      var data = filterData(data);
      $scope.data = data;
      $scope.predicate = 'name'; //'contract_name';
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
      if (data.results) {
        var sResults = data.results;
        for (var idx=0;idx<sResults.length;idx++) {
          if ($.inArray(sResults[idx].id,resultIds)==-1) {
            resultIds.push(sResults[idx].id);
          }
        }
      }

      // Build promise to get 
      $scope.compareSupportDocs(resultIds);
    })
    .error(function(error) {
      console.log('search error in search controller...');
      console.log(error)
      // window.location.reload();
    });
}]);

myControllers.controller('ContractController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
  var id = $routeParams.id;
  $http.get(api + 'contract/' + id + '/metadata', { cache: true } ).success(function(data) {

    $scope.data = data;

    $('.download-word').on('click', function() {
      download(data.name + '.docx', data.word_file);
      // download(data.contract_name + '.docx', data.word_file);
    });

    if (data.supporting_contracts){
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
    }
    

    console.log(data);

  });
}]);
