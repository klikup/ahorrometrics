// Quick test of Overpass API - with different endpoints
const query = `[out:json][timeout:30];
(
  node["shop"](around:2000,37.3886,-5.9953);
  node["office"](around:2000,37.3886,-5.9953);
  node["amenity"~"restaurant|bar|cafe|bank|pharmacy"](around:2000,37.3886,-5.9953);
);
out body 10;`;

const endpoints = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://z.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

async function testEndpoint(url) {
  console.log(`\nTesting: ${url}`);
  try {
    const res = await fetch(url, {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "AhorroMetrics/1.0",
      },
    });
    
    console.log("  Status:", res.status);
    const text = await res.text();
    
    if (res.ok) {
      const data = JSON.parse(text);
      console.log("  Elements:", data.elements?.length || 0);
      if (data.elements?.length > 0) {
        data.elements.slice(0, 3).forEach((e, i) => {
          console.log(`  [${i+1}] ${e.tags?.name || "unnamed"} (${e.tags?.shop || e.tags?.office || e.tags?.amenity || "?"})`);
        });
      }
      return true;
    } else {
      console.log("  Response:", text.substring(0, 200));
      return false;
    }
  } catch (e) {
    console.log("  Error:", e.message);
    return false;
  }
}

async function main() {
  // Also try GET method
  console.log("\n=== Testing GET method ===");
  const getUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(getUrl, {
      headers: { "User-Agent": "AhorroMetrics/1.0" },
    });
    console.log("GET Status:", res.status);
    const text = await res.text();
    if (res.ok) {
      const data = JSON.parse(text);
      console.log("Elements:", data.elements?.length || 0);
      if (data.elements?.length > 0) {
        data.elements.slice(0, 3).forEach((e, i) => {
          console.log(`  [${i+1}] ${e.tags?.name || "unnamed"} (${e.tags?.shop || e.tags?.office || e.tags?.amenity || "?"})`);
        });
      }
    } else {
      console.log("Response:", text.substring(0, 300));
    }
  } catch (e) {
    console.log("Error:", e.message);
  }

  console.log("\n=== Testing POST endpoints ===");
  for (const url of endpoints) {
    await testEndpoint(url);
  }
}

main();
