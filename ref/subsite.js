/*
(function() {

  $(function() {
    $.ajax({
      url: 'http://rc-elasticsearch.elasticbeanstalk.com/api/contracts',
      data: {
        'per_page': 1000
      },
      success: function(data) {

        var data = JSON.parse(data);

        $('.contract-count-home').html(data.results.length + ' Contracts');

      }
    });
  });

})();

function getParam(param) {
  var found;
  window.location.search.substr(1).split("&").forEach(function(item) {
    if (param ==  item.split("=")[0]) {
      found = item.split("=")[1];
    }
  });
  return found;
}
*/
