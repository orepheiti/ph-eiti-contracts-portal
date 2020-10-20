<?php

$url = "http://api.resourcecontracts.org/contracts/search?q=&from=0&per_page=10000&group=metadata&country=ph";

$raw = file_get_contents($url);

$json = json_decode($raw); 
$results = $json->results;
$hydrocarbon_companies = array();

foreach ($results as $r) {
  if ($r->resource[0] == 'Hydrocarbons') {
    $contract_url = "http://api.resourcecontracts.org/contracts/" . $r->contract_id . "/metadata";

    $raw = file_get_contents($contract_url);

    $json = json_decode($raw);

    if ($json->is_supporting_document == "0") {
      $hydrocarbon_companies[] = "'" . $json->company[0]->name . "'";
    }
  }

}

$written = file_put_contents('hydrocarbon_companies.js', "hydrocarbon_companies = [" . implode(',', $hydrocarbon_companies) . "]");

if ($written) {
  echo "Updated";
}
else {
  echo "Error";
}

