
async function scanURL() {
    const url = document.getElementById("urlInput").value.trim();
    const resultBox = document.getElementById("scanResult");
    const scanButton = document.getElementById("scanButton");

    if (url === "") {
        resultBox.innerHTML = "Please enter a URL!";
        return;
    }

    scanButton.disabled = true;
    scanButton.innerText = "Scanning...";

    try {
        const response = await fetch("http://localhost:8080/api/scan/url", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();

        const score = Number(data.riskScore);
        let meterColor = "#00ff99";

        if (score >= 50) {
            meterColor = "#ff4444";
        } else if (score >= 20) {
            meterColor = "#ff9900";
        }

        const findingsHTML = data.findings
            .map(item => `<li>${item}</li>`)
            .join("");

        resultBox.innerHTML = `
            <h3>${data.status}</h3>

            <h2>Risk Score: ${score}/100</h2>

            <div class="risk-meter-container">
                <div class="risk-meter-header">
                    <h3>Risk Level</h3>
                    <span style="color:${meterColor}">
                        ${score}%
                    </span>
                </div>

                <div class="risk-meter-track">
                    <div
                        class="risk-meter-fill"
                        id="riskMeterFill"
                        style="background:${meterColor}; width:0%">
                    </div>
                </div>

                <div class="risk-meter-label">
                    Security Risk Indicator
                </div>
            </div>

            <hr>

            <h3>Detailed Scan Report</h3>

            <p>HTTPS Enabled: ${data.httpsEnabled ? "Yes" : "No"}</p>

            <p>IP Address Detected:
                ${data.ipAddressDetected ? "Yes" : "No"}
            </p>

            <p>Suspicious Keyword Detected:
                ${data.suspiciousKeywordDetected ? "Yes" : "No"}
            </p>

            <p>Long URL Detected:
                ${data.longUrlDetected ? "Yes" : "No"}
            </p>

            <h3>Findings</h3>

            <ul style="text-align:left;">
                ${findingsHTML}
            </ul>

            <p>${data.message}</p>
        `;

        resultBox.style.color = meterColor;

        const meter = document.getElementById("riskMeterFill");

        requestAnimationFrame(() => {
            meter.style.width = score + "%";
        });

    } catch (error) {
        resultBox.innerHTML = "Backend connection failed!";
        resultBox.style.color = "#ff4444";
        console.error(error);
    } finally {
        scanButton.disabled = false;
        scanButton.innerText = "Scan URL";
    }
}
