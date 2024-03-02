<?php
header('Content-Type: application/json');

// Function to validate date format
function validateDate($date, $format = 'd.m.Y') {
    $dateTime = DateTime::createFromFormat($format, $date);
    return $dateTime && $dateTime->format($format) === $date;
}

// Get user input date if available, otherwise use current date
if (isset($_GET['date']) && validateDate($_GET['date'], 'Y-m-d')) {
    $userDate = date_create_from_format('Y-m-d', $_GET['date']);
} else {
    $userDate = date_create();
}

// Extract year, month, and day from the user input date
$year = $userDate->format('Y');
$month = $userDate->format('m');
$day = $userDate->format('d');

// Generate the URL in the correct format for the user input date
$userUrl = "https://www.tcmb.gov.tr/kurlar/{$year}{$month}/{$day}{$month}{$year}.xml";

// Attempt to fetch XML data for the current date
$currentDate = date_create(); // Get the current date
$currentXmlData = false;

// Modify current date to yesterday if today's XML data is not available
do {
    $currentDate->modify('-1 day'); // Modify the current date to yesterday
    $currentYear = $currentDate->format('Y');
    $currentMonth = $currentDate->format('m');
    $currentDay = $currentDate->format('d');
    $currentUrl = "https://www.tcmb.gov.tr/kurlar/{$currentYear}{$currentMonth}/{$currentDay}{$currentMonth}{$currentYear}.xml";
    $currentXmlData = file_get_contents($currentUrl);
} while ($currentXmlData === FALSE);

// Output JSON containing URLs and XML data
echo json_encode([
    'currentUrl' => $currentUrl,
    'userUrl' => $userUrl,
    'currentXmlData' => $currentXmlData,
    'userXmlData' => file_get_contents($userUrl) // Fetch XML data for user URL directly
]);
?>
