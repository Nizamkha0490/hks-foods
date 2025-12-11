

const BASE_URL = 'http://127.0.0.1:5000/api/auth';
const email = "HKSfoods087@gmail.com";
const password = "kamraN@12";
const username = "HKSfoodsAdmin"; // Fallback for registration

async function testAuth() {
    console.log(`Testing Auth for ${email} on ${BASE_URL}...`);

    try {
        // 1. Try Login
        console.log("Attempting Login...");
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const loginData = await loginRes.json();

        if (loginRes.ok && loginData.success) {
            console.log("✅ Login Successful!");
            console.log("Token:", loginData.token ? "Received" : "Missing");
            return;
        } else {
            console.log("❌ Login Failed:", loginData.message);
        }

        // 2. If Login failed, try Register
        if (loginData.message === "Invalid email or password" || loginData.message === "User not found") {
            console.log("Attempting Registration...");
            const registerRes = await fetch(`${BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const registerData = await registerRes.json();

            if (registerRes.ok && registerData.success) {
                console.log("✅ Registration Successful!");
                console.log("Token:", registerData.token ? "Received" : "Missing");
            } else {
                console.log("❌ Registration Failed:", registerData.message);
            }
        }

    } catch (error) {
        console.error("❌ Network or Server Error:", error.message);
        // Look for connection refused to see if server is running
        if (error.code === 'ECONNREFUSED') {
            console.log("⚠️ Is the backend server running on port 5000?");
        }
    }
}

testAuth();
