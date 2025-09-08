<?php

header('Content-Type: application/json');



function validateDate($date, $format = 'Y-m-d') {

    $dateTime = DateTime::createFromFormat($format, $date);

    return $dateTime && $dateTime->format($format) === $date;

}



if (!isset($_GET['startDate']) || !validateDate($_GET['startDate'])) {

    echo json_encode(["error" => "Invalid or missing startDate"]);

    exit;

}



$startDate = new DateTime($_GET['startDate']);

$endDate = new DateTime(); // today



$dates = [];

$current = clone $startDate;



while ($current <= $endDate) {

    $year = $current->format('Y');

    $month = $current->format('m');

    $day = $current->format('d');



    $url = "https://www.tcmb.gov.tr/kurlar/{$year}{$month}/{$day}{$month}{$year}.xml";



    // try fallback if no data for that day (move backwards)

    $xmlData = @file_get_contents($url);

    $tryDate = clone $current;

    while ($xmlData === false && $tryDate > $startDate) {

        $tryDate->modify('-1 day');

        $year = $tryDate->format('Y');

        $month = $tryDate->format('m');

        $day = $tryDate->format('d');

        $url = "https://www.tcmb.gov.tr/kurlar/{$year}{$month}/{$day}{$month}{$year}.xml";

        $xmlData = @file_get_contents($url);

    }



    if ($xmlData !== false) {

        $dates[] = [

            "date" => $current->format("Y-m-d"),

            "url" => $url,

            "xml" => $xmlData

        ];

    }



    // jump to next month (same day)

    $current->modify('first day of next month');

}



echo json_encode($dates);

