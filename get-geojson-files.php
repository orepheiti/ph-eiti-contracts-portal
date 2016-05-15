<?php
// Get GeoJSON Files in ./geojson
$geojson_list = array_filter(
	scandir('./geojson'),
	function($value) {
		return (strpos($value, 'geojson') != false);
	}
);

$returnData = array();
if (count($geojson_list) > 0) {
	foreach ($geojson_list as $key => $value) {
		$property = file_get_contents('./geojson/'.$value);
		$geojson_object = json_decode($property, true);
		array_push($returnData, array('filename' => $value,
									  'geojsonProperty' => $geojson_object));
	}	
}

print(json_encode($returnData));

?>