<?php


if (isset($_POST['message']) && isset($_POST['email'])) {

	foreach($_POST as $k=>$v){
		$_POST[$k] = htmlspecialchars(stripslashes($v));
	}

	$to = "pheiticontractsportal@gmail.com";
	$subject = "PH-EITI Contracts and Ownership Register in the Extractives - Feedback";
	$message = $_POST['message'];
	$headers = 'From: '. $_POST['name'] . " <" . $_POST['email'] . ">\r\n";

	$sent = mail($to, $subject, $message, $headers);

	if ($sent) {
		echo "Success";
	}
	else {
		echo "Error";
	}

} else {
	echo "Error";
}

die();
