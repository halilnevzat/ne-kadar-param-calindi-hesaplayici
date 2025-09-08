<?php
header('Content-Type: application/json');

// --- Konfigürasyon ---
$cacheDir = __DIR__ . '/cache'; // Önbellek dizini (bu dosyanın bulunduğu klasörde 'cache' adında olmalı)
$cacheDuration = 86400; // Önbellek süresi saniye cinsinden (24 saat)
$maxAllowedPastYears = 3; // Başlangıç tarihi için izin verilen maksimum geçmiş yıl (DoS riskini azaltır)

// --- Yardımcı Fonksiyonlar ---
function validateDate($date, $format = 'Y-m-d') {
    $dateTime = DateTime::createFromFormat($format, $date);
    return $dateTime && $dateTime->format($format) === $date;
}

/**
 * Belirtilen URL'den XML verisini çeker veya önbellekten okur.
 *
 * @param string $url Verinin çekileceği URL.
 * @param string $cachePath Önbellek dosyasının yolu.
 * @param int $cacheDuration Önbelleğin geçerlilik süresi (saniye).
 * @return string|false XML verisi veya hata durumunda false.
 */
function fetchAndCacheExchangeRate($url, $cachePath, $cacheDuration) {
    // Önbellek mevcut ve geçerliyse, önbellekten oku
    if (file_exists($cachePath) && (time() - filemtime($cachePath) < $cacheDuration)) {
        return file_get_contents($cachePath);
    }

    // Önbellek dizini yoksa oluştur
    $cacheDir = dirname($cachePath);
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0777, true); // Üretim ortamında daha kısıtlı izinler düşünülmeli
    }

    // Harici kaynaktan veri çek
    $xmlData = file_get_contents($url); // Artık @ operatörü yok, hatalar loglanacak
    if ($xmlData === false) {
        error_log("Failed to fetch XML from URL: " . $url);
        return false;
    }

    // Başarılıysa önbelleğe yaz
    file_put_contents($cachePath, $xmlData);
    return $xmlData;
}

// --- Giriş Doğrulama ---
if (!isset($_GET['startDate']) || !validateDate($_GET['startDate'])) {
    echo json_encode(["error" => "Invalid or missing startDate"]);
    exit;
}

$startDate = new DateTime($_GET['startDate']);
$endDate = new DateTime(); // Bugünün tarihi

// --- Tarih Aralığı Doğrulama ---
$maxAllowedStartDate = (new DateTime())->modify("-$maxAllowedPastYears year");
if ($startDate < $maxAllowedStartDate) {
    echo json_encode(["error" => "Start date cannot be older than " . $maxAllowedStartDate->format('Y-m-d') . " (" . $maxAllowedPastYears . " years)"]);
    exit;
}

// --- Ana Mantık ---
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0777, true); // Cache dizini yoksa oluştur
}

$dates = [];
$current = clone $startDate; // Döngü için başlangıç tarihinin bir kopyası

while ($current <= $endDate) {
    $year = $current->format('Y');
    $month = $current->format('m');
    $day = $current->format('d');

    $tcmbBaseUrl = "https://www.tcmb.gov.tr/kurlar/";
    $tcmbUrlForDay = "{$tcmbBaseUrl}{$year}{$month}/{$day}{$month}{$year}.xml"; // Belirli gün için URL
    $cacheFileNameForDay = "{$year}-{$month}-{$day}.xml";
    $cachePathForDay = "{$cacheDir}/{$cacheFileNameForDay}";

    $xmlData = fetchAndCacheExchangeRate($tcmbUrlForDay, $cachePathForDay, $cacheDuration);
    $finalUrlUsed = $tcmbUrlForDay; // Hangi URL'nin kullanıldığını takip etmek için

    $tryDate = clone $current;

    // Eğer o gün için veri yoksa, geriye doğru giderek veri bulmaya çalış (hafta sonu, tatil vb. için)
    // Bu döngü de önbellekleme mekanizmasını kullanacaktır.
    while ($xmlData === false && $tryDate > $startDate->modify('-1 day')) { // tryDate'in startDate'den daha eski olmamasını sağlar
        $tryDate->modify('-1 day');
        $year_fb = $tryDate->format('Y');
        $month_fb = $tryDate->format('m');
        $day_fb = $tryDate->format('d');
        $fallbackTcmbUrl = "{$tcmbBaseUrl}{$year_fb}{$month_fb}/{$day_fb}{$month_fb}{$year_fb}.xml";
        $fallbackCacheFileName = "{$year_fb}-{$month_fb}-{$day_fb}.xml";
        $fallbackCachePath = "{$cacheDir}/{$fallbackCacheFileName}";
        
        $xmlData = fetchAndCacheExchangeRate($fallbackTcmbUrl, $fallbackCachePath, $cacheDuration);

        // Eğer geri düşme sırasında veri bulunduysa, kullanılan URL'yi güncelleyip döngüden çık
        if ($xmlData !== false) {
            $finalUrlUsed = $fallbackTcmbUrl;
            break; 
        }
    }

    if ($xmlData !== false) {
        $usdRate = null;
        try {
            // XML'i ayrıştırıp USD döviz alış kurunu doğrudan PHP'de al
            $xml = simplexml_load_string($xmlData);
            $usdRateNode = $xml->xpath('//Currency[@CurrencyCode="USD"]/ForexBuying');
            if (!empty($usdRateNode)) {
                $usdRate = (float)$usdRateNode[0];
            } else {
                error_log("USD ForexBuying rate not found in XML for URL: " . $finalUrlUsed);
            }
        } catch (Exception $e) {
            error_log("Error parsing XML from URL: " . $finalUrlUsed . " Error: " . $e->getMessage());
        }

        if ($usdRate !== null) {
            $dates[] = [
                "date" => $current->format("Y-m-d"),
                "url" => $finalUrlUsed, // Gerçekten kullanılan XML'in URL'si
                "usdRate" => $usdRate // Sadece ayrıştırılmış USD kurunu gönder
            ];
        } else {
            // Eğer USD kuru çıkarılamazsa, bu ayın verisi eksik sayılır
            error_log("Failed to extract USD rate for date: " . $current->format("Y-m-d") . " from URL: " . $finalUrlUsed);
        }

    } else {
        // Geriye dönük denemelere rağmen veri bulunamadıysa logla
        error_log("No exchange rate data found for " . $current->format("Y-m-d") . " after fallbacks.");
    }

    // Bir sonraki ayın aynı gününe geç
    $current->modify('first day of next month');
}

echo json_encode($dates);
?>
