#!/usr/bin/env node

import http from "http";

const testEndpoints = [
  { name: "GET Shops", path: "/api/shops?limit=2" },
  { name: "GET Products", path: "/api/products?limit=2" },
  { name: "GET Services", path: "/api/services?limit=2" },
  { name: "GET Posts", path: "/api/posts?limit=2" },
];

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, error: "Invalid JSON", raw: data });
        }
      });
    });

    req.on("error", (error) => reject(error));
    req.setTimeout(5000, () => reject(new Error("Timeout")));
    req.end();
  });
}

async function runTests() {
  console.log("🧪 Testing Backend Endpoints\n" + "=".repeat(50));

  for (const endpoint of testEndpoints) {
    try {
      const result = await makeRequest(endpoint.path);

      if (result.status === 200 && result.data.success) {
        console.log(`✅ ${endpoint.name}: PASSED`);
        if (result.data.data) {
          const count = Array.isArray(result.data.data)
            ? result.data.data.length
            : 1;
          console.log(`   → Returned ${count} item(s)`);
        }
      } else {
        console.log(`❌ ${endpoint.name}: FAILED`);
        console.log(`   → Status: ${result.status}`);
        if (result.error) {
          console.log(`   → Error: ${result.error}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR`);
      console.log(`   → ${error.message}`);
    }
    console.log("");
  }
}

runTests().catch(console.error);
