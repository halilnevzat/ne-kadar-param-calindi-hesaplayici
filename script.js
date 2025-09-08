document.getElementById("salaryForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const salaryAmount = parseFloat(document.getElementById("salaryAmount").value);
    const startDate = document.getElementById("startDate").value;

    fetch(`get_exchange_rates.php?startDate=${startDate}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById("result").innerHTML = `<p>${data.error}</p>`;
                return;
            }

            // Parse XML for the selected date (first element) and current date (last element)
            const userXml = new DOMParser().parseFromString(data[0].xml, "text/xml");
            const currentXml = new DOMParser().parseFromString(data[data.length - 1].xml, "text/xml");

            const userExchangeRate = parseFloat(userXml.querySelector('Currency[CurrencyCode="USD"] ForexBuying').textContent);
            const currentExchangeRate = parseFloat(currentXml.querySelector('Currency[CurrencyCode="USD"] ForexBuying').textContent);

            // Calculate USD and TRY reduction (overall reduction from start date to current date)
            const historicalUSDAmount = salaryAmount / userExchangeRate;
            const currentUSDAmount = salaryAmount / currentExchangeRate;
            const reductionAmountUSD = historicalUSDAmount - currentUSDAmount;
            const reductionAmountTRY = salaryAmount - (salaryAmount / userExchangeRate * currentExchangeRate);

            // Display the original result
            document.getElementById("result").innerHTML = `
                <p>Maaşınız ${reductionAmountUSD.toFixed(2)} USD. Azalmış</p>
                <p>Maaşınız ${reductionAmountTRY.toFixed(2)} TRY. Azalmış</p>
                <p>Seçilen Tarih için Alınan Veri Kaynağı: <a href="${data[0].url}" target="_blank">${data[0].url}</a></p>
                <p>Güncel Tarih için Alınan Veri Kaynağı: <a href="${data[data.length - 1].url}" target="_blank">${data[data.length - 1].url}</a></p>
                <p>seçilen tarih kuru = ${userExchangeRate}</p>
                <p>güncel tarih kuru = ${currentExchangeRate}</p>
            `;

            // Calculate monthly losses
            let monthlyResults = "";
            let totalMonthlyLoss = 0;

            // Store parsed XML and rates for easier access
            const parsedData = data.map(entry => {
                const xml = new DOMParser().parseFromString(entry.xml, "text/xml");
                const rate = parseFloat(xml.querySelector('Currency[CurrencyCode="USD"] ForexBuying').textContent);
                return { date: entry.date, rate: rate };
            });

            // Iterate through the data to calculate monthly losses by comparing consecutive months
            for (let i = 0; i < parsedData.length; i++) {
                const startOfPeriodData = parsedData[i];
                let endOfPeriodRate;

                if (i < parsedData.length - 1) {
                    // For all periods except the very last one, compare with the rate at the start of the next period.
                    // Example: For Jan 2nd, compare with Feb 1st rate.
                    endOfPeriodRate = parsedData[i + 1].rate;
                } else {
                    // For the last period in the data array (e.g., September 1st in your example),
                    // compare with the 'currentExchangeRate', which is already the rate for the start of the current month.
                    // This will result in a 0.00 TRY kayıp for the current (incomplete) month, consistent with your example.
                    endOfPeriodRate = currentExchangeRate;
                }

                const salaryUSDAtStartOfPeriod = salaryAmount / startOfPeriodData.rate;
                const salaryTRYAtEndOfPeriod = salaryUSDAtStartOfPeriod * endOfPeriodRate;
                const lossTRY = salaryAmount - salaryTRYAtEndOfPeriod;

                monthlyResults += `<li>${startOfPeriodData.date}: ${lossTRY.toFixed(2)} TRY kayıp</li>`;
                totalMonthlyLoss += lossTRY;
            }

            // Append monthly breakdown below existing result
            document.getElementById("result").innerHTML += `
                <h4 class="mt-4">Aylık Kayıplar</h4>
                <ul>${monthlyResults}</ul>
                <h4>Toplam Aylık Kayıp</h4>
                <p>${totalMonthlyLoss.toFixed(2)} TRY</p>
            `;
        })
        .catch(err => {
            console.error(err);
            document.getElementById("result").innerHTML = "<p>Veri alınırken hata oluştu.</p>";
        });
});
