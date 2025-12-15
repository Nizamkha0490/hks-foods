import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testReports() {
    try {
        console.log("🔐 Logging in...");
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: "HKSfoods087@gmail.com",
            password: "kamraN@12"
        });

        const token = loginRes.data.token;
        console.log("✅ Login successful. Token received.");

        const headers = { Authorization: `Bearer ${token}` };

        // 1. Test Daily Report (Known Good)
        console.log("\n📊 Testing /reports/daily (Expect Data)...");
        try {
            const dailyRes = await axios.get(`${BASE_URL}/reports/daily?startDate=2025-12-15&endDate=2025-12-15`, { headers });
            console.log(`Daily Items: ${dailyRes.data.report.length}`);
        } catch (e) {
            console.log("Daily Failed:", e.message);
            if (e.response) console.log(e.response.data);
        }

        // 2. Test Stock Report (Failing) - No Params
        console.log("\n📦 Testing /reports/stock (No Params)...");
        try {
            const stockRes = await axios.get(`${BASE_URL}/reports/stock`, { headers });
            console.log(`Stock Items: ${stockRes.data.report.length}`);
            if (stockRes.data.report.length === 0) console.log("⚠️ Stock returned empty array");
        } catch (e) {
            console.log("Stock Failed:", e.message);
            if (e.response) console.log(e.response.data);
        }

        // 3. Test Product Report (Failing) - No Params
        console.log("\n🛍️ Testing /reports/product (No Params)...");
        try {
            const productRes = await axios.get(`${BASE_URL}/reports/product`, { headers });
            console.log(`Product Items: ${productRes.data.report.length}`);
        } catch (e) {
            console.log("Product Failed:", e.message);
            if (e.response) console.log(e.response.data);
        }

        // 4. Test Product Sale Report (Failing) - No Params
        console.log("\n📈 Testing /reports/product-sale (No Params)...");
        try {
            const productSaleRes = await axios.get(`${BASE_URL}/reports/product-sale`, { headers });
            console.log(`Product Sale Items: ${productSaleRes.data.report.length}`);
        } catch (e) {
            console.log("Product Sale Failed:", e.message);
            if (e.response) console.log(e.response.data);
        }

    } catch (error) {
        console.error("❌ Fatal Error:", error.response?.data || error.message);
    }
}

testReports();
