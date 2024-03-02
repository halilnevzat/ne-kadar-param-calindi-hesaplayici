document.getElementById("salaryForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get user inputs
    const salaryAmount = parseFloat(document.getElementById("salaryAmount").value);
    const startDate = document.getElementById("startDate").value;

    // Log user input date
    console.log("User input date:", startDate);

    // Fetch XML data URLs from the PHP script
    const url = `get_exchange_rates.php?date=${startDate}`;

    // Fetch XML data URLs from the PHP script
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Log the fetched URLs and XML data
            console.log("Current URL:", data.currentUrl);
            console.log("User URL:", data.userUrl);
            // console.log("Current XML data:", data.currentXmlData);
            // console.log("User XML data:", data.userXmlData);

            // Parse XML data from the JSON object
            const currentXmlData = new DOMParser().parseFromString(data.currentXmlData, "text/xml");
            const userXmlData = new DOMParser().parseFromString(data.userXmlData, "text/xml");

            // Extract exchange rates from XML data
            const currentExchangeRate = parseFloat(currentXmlData.querySelector('Currency[CurrencyCode="USD"] ForexBuying').textContent);
            console.log("bugünün kuru" + currentExchangeRate)
            const userExchangeRate = parseFloat(userXmlData.querySelector('Currency[CurrencyCode="USD"] ForexBuying').textContent);
            console.log("seçilen tarih kuru" + userExchangeRate)

            // Calculate reduction in salary for USD
            const historicalUSDAmount = salaryAmount / userExchangeRate;
            const currentUSDAmount = salaryAmount / currentExchangeRate;
            const reductionAmountUSD = historicalUSDAmount - currentUSDAmount;

            // Calculate reduction in salary for TRY
            const reductionAmountTRY = salaryAmount - (salaryAmount / userExchangeRate * currentExchangeRate);

            // Display the result
            document.getElementById("result").innerHTML = `
                <p>Maaşınız ${reductionAmountUSD.toFixed(2)} USD. Azalmış</p>
                <p>Maaşınız ${reductionAmountTRY.toFixed(2)} TRY. Azalmış</p>
            `;

            // Display XML URLs to the user
            document.getElementById("xmlUrls").innerHTML = `
                <p>Seçilen Tarih için Alınan Veri Kaynağı: <a href="${data.userUrl}" target="_blank">${data.userUrl}</a></p>
                <p>Güncel Tarih için Alınan Veri Kaynağı: <a href="${data.currentUrl}" target="_blank">${data.currentUrl}</a></p>
                <p>seçilen tarih kuru = ${userExchangeRate}</p>
                <p>güncel tarih kuru = ${currentExchangeRate}</p>
            `;
        })
        .catch(error => {
            // Display an error message in the result div
            document.getElementById("xmlUrls").innerHTML = "";
            document.getElementById("result").innerHTML = "<p>Seçtiğiniz Tarih İçin Verilere Ulaşılamadı.</p>";
            console.error("Error fetching exchange rates:", error);
        });
});
