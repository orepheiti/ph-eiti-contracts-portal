var myControllers = angular.module('myControllers', ['ngAnimate']);

var api = 'http://api.resourcecontracts.org/'; //'http://rc-api-stage.elasticbeanstalk.com/api/';
var options = "&country_code=ph"

myApp.factory('ContractsFactory',['$http',
  function($http){
    var wsurl = ['http://api.resourcecontracts.org','http://rc-api-stage.elasticbeanstalk.com/api'];
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
      // Filters supporting documents 
      // $scope.compareSupportDocs(resultIds);
    })
    .error(function(error) {
      console.log('search error in search controller...');
      console.log(error)
      // window.location.reload();
    });
}]);

myControllers.controller('ContractController', ['$scope', '$http', '$routeParams','$q','ContractsFactory',
  function ($scope, $http, $routeParams, $q, ContractsFactory) {
  var id = $routeParams.id;
  $http.get(api + 'contract/' + id + '/metadata', { cache: true } ).success(function(data) {

    $scope.data = data;

    $('.download-word').on('click', function() {
      download(data.name + '.docx', data.word_file);
      // download(data.contract_name + '.docx', data.word_file);
    });
    
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
    $http.get('/get_supporting_documents.php?contract_name=' + data.name, { cache: true }).success(function(responseData) {
      // console.log('get supporting docs')
      // console.log(responseData)
      $scope.data.supporting_contracts_extra = responseData;
    });
  });
}]);
