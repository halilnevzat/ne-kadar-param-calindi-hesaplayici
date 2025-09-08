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
            if (data.length === 0) {
                 document.getElementById("result").innerHTML = `<p>Seçilen tarih aralığı için döviz kuru verisi bulunamadı veya PHP tarafında bir sorun oluştu.</p>`;
                 return;
            }

            // PHP script now returns 'usdRate' directly, no need for client-side XML parsing
            const userExchangeRate = data[0].usdRate;
            const currentExchangeRate = data[data.length - 1].usdRate; // Rate for the latest month in the fetched series

            // Calculate USD and TRY reduction (overall reduction from start date to the latest data point)
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

            // Iterate through the data to calculate monthly losses by comparing consecutive months
            for (let i = 0; i < data.length; i++) {
                const startOfPeriodData = data[i]; // e.g., { date: "2025-01-02", url: "...", usdRate: 35.2525 }
                let endOfPeriodRate;

                if (i < data.length - 1) {
                    // For all periods except the very last one, compare with the rate at the start of the next period.
                    // Example: For Jan 2nd (rate), compare with Feb 1st (rate).
                    endOfPeriodRate = data[i + 1].usdRate;
                } else {
                    // For the last period in the data array (e.g., September 1st in your example),
                    // compare with the 'currentExchangeRate', which is the rate for the start of this current month.
                    // This will result in a 0.00 TRY kayıp for the current (incomplete) month, consistent with your example.
                    endOfPeriodRate = currentExchangeRate; // Which is data[data.length - 1].usdRate
                }

                const salaryUSDAtStartOfPeriod = salaryAmount / startOfPeriodData.usdRate;
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
            console.error("Veri alınırken hata oluştu veya PHP sunucusuna ulaşılamadı:", err);
            document.getElementById("result").innerHTML = "<p>Veri alınırken hata oluştu veya PHP sunucusuna ulaşılamadı. Sunucu loglarını kontrol edin.</p>";
        });
});
