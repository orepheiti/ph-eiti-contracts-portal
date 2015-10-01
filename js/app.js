var myApp = angular.module('myApp', [
  'ngRoute',
  'myControllers',
]);

myApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

  $routeProvider.

    when('/', {
      templateUrl: '/partials/home.html',
      controller: 'IndexController'
    }).

    when('/search', {
      templateUrl: '/partials/search.html',
      controller: 'SearchController'
    }).

    when('/contracts', {
      templateUrl: '/partials/contracts.html',
      controller: 'ContractsController'
    }).

    when('/contract/:id', {
      templateUrl: '/partials/contract.html',
      controller: 'ContractController'
    }).

    otherwise({
      redirectTo: '/'
    });

    $locationProvider.html5Mode(true);

}]);


myApp.filter('rawHtml', ['$sce', function($sce){
  return function(val) {
    return $sce.trustAsHtml(val);
  };
}]);

myApp.filter('skillItem', [ '$sce', function($sce) {
  return function(input) {
    var replaceWith = new String();
    var currentText = input;
    var pattern = /\d\/\d/g;
    var value = currentText.match(pattern)[0];
    var loop = parseInt(value.slice(-1));
    var count = parseInt(value.slice(0));

    for (var x = 0; loop > x; x++) {
      if (x == count) {
        replaceWith += "</b>";
      }
      replaceWith += "&bullet;";
    }

    return $sce.trustAsHtml(currentText.replace(/\d\/\d/g, "<span><b>" + replaceWith + "</span>"));
  }
}]);


myApp.directive('bindHtmlCompile', ['$compile', function ($compile) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      scope.$watch(
        function (scope) {
          return scope.$eval(attrs.bindHtmlCompile);
        },
        function (value) {
          element.html(value);
          $compile(element.contents())(scope);
        }
      );
    }
  }
}]);


myApp.directive('slider', function() {
  return {
    link: function(scope, element, attrs) {
      var bxslider;
      bxslider = $('.bxslider').bxSlider({
        adaptiveHeight: true,
        mode: 'fade',
        preloadImages: 'all',
        controls: false,
        pagerSelector: $('.pagerSelector')
      });

      $('.bx-wrapper').on('click', function() {
        bxslider.goToNextSlide();
      });
    }
  }
});

myApp.directive('responsiveView', function() {
  return {
    link: function(scope, element, attr) {
      var iframe = $('#responsive-view');
      var control = $('.responsive-view-control');

      control.find('a').on('click', function(e) {
        iframe.removeAttr('class').addClass($(this).attr('data-view'));

        control.find('a').each(function() {
          $(this).removeClass('active');
        });

        $(this).addClass('active');

        e.preventDefault();
        return false;
      });

    }
  }
});

function getParam(param) {
  var found;
  window.location.search.substr(1).split("&").forEach(function(item) {
    if (param ==  item.split("=")[0]) {
      found = item.split("=")[1];
    }
  });
  return found;
}
