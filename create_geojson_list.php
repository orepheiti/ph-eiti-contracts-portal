<?php


$geojson_list = array_filter(
  scandir('./geojson'),
  function($value) {
    return (strpos($value, 'geojson') != false);
  }
);

$written = file_put_contents('geojson_list.js', "geojsonList = ['" . implode("','", $geojson_list) . "']");

if ($written) {
  echo "Updated";
}
else {
  echo "Error";
}

