const BASE_URL = 'http://localhost:5000/api';

async function testReports() {
    try {
        console.log("🔐 Logging in...");
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "HKSfoods087@gmail.com",
                password: "kamraN@12"
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("✅ Login successful. Token received.");

        const headers = { 'Authorization': `Bearer ${token}` };

        // Helper to fetch and log
        const checkReport = async (name, endpoint) => {
            console.log(`\n🔍 Testing ${name} (${endpoint})...`);
            try {
                const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
                const data = await res.json();

                if (res.ok) {
                    const items = data.report ? data.report.length : 'undefined';
                    console.log(`✅ ${name}: ${items} items`);
                    if (items === 0) console.log(`⚠️  ${name} returned EMPTY array.`);
                } else {
                    console.log(`❌ ${name} Failed: ${res.status}`, data);
                }
            } catch (e) {
                console.log(`❌ ${name} Error:`, e.message);
            }
        };

        await checkReport('Daily Report', '/reports/daily?startDate=2025-12-15&endDate=2025-12-15');
        await checkReport('Stock Report', '/reports/stock');
        await checkReport('Product Report', '/reports/product');
        await checkReport('Product Sale Report', '/reports/product-sale');

    } catch (error) {
        console.error("❌ Fatal Error:", error.message);
    }
}

testReports();
