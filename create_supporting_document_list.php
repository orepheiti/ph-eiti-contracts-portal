<?php

$url = "http://api.resourcecontracts.org/contracts/search?q=&from=0&per_page=10000&group=metadata&country=ph";

$raw = file_get_contents($url);

$json = json_decode($raw); 
$results = $json->results;
$supporting_documents = array();

foreach ($results as $r) {
  $contract_url = "http://api.resourcecontracts.org/contract/" . $r->contract_id . "/metadata";
  $raw = file_get_contents($contract_url);
  $json = json_decode($raw);
  if ($json->is_supporting_document == "1") {
    $supporting_documents[] = $json->contract_id;
  }
}

$written = file_put_contents('supporting_documents.txt', "supporting_documents = [" . implode(',', $supporting_documents) . "]");

if ($written) {
  echo "Updated";
}
else {
  echo "Error";
}

