<?php

if (isset($_REQUEST['contract_name'])) {

	$contract_name = $_REQUEST['contract_name'];
	$files = scandir('./supporting-documents');

	if (in_array($contract_name, $files)) {
		$files = scandir('./supporting-documents/' . $contract_name);
		$files = array_slice($files, 2);
		echo json_encode($files);
	}

}

