<?php
/* Uncomment to restore previous API URL
$url = "http://api.resourcecontracts.org/contracts/search?q=&from=0&per_page=10000&group=metadata&country=ph";
*/
$url = "http://rc-api-stage.elasticbeanstalk.com/api/contracts/search?q=&from=0&per_page=10000&group=metadata&country_code=ph";
$raw = file_get_contents('all_results.json');

$json = json_decode($raw); 
$results = $json->results;

$supporting_documents = array();

foreach ($results as $r) {
	$contract_url = "http://rc-api-stage.elasticbeanstalk.com/api/contract/" . $r->id . "/metadata";
	$raw = file_get_contents($contract_url);
	$json = json_decode($raw);
	if ($json->type!='Contract'){
		array_push($supporting_documents, $json->id);
	}
}

$written = file_put_contents('supporting_documents.js', "supporting_documents = [" . implode(',', $supporting_documents) . "]");

if ($written) {
  echo "Updated";
}
else {
  echo "Error";
}

