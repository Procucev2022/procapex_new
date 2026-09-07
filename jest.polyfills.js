// Provide Web API globals for JSDOM
const webGlobals = {
  Request: globalThis.Request,
  Response: globalThis.Response,
  Headers: globalThis.Headers,
  fetch: globalThis.fetch,
};

for (const [key, value] of Object.entries(webGlobals)) {
  if (value) {
    if (typeof global[key] === 'undefined') {
      global[key] = value;
    }
    if (typeof window !== 'undefined' && typeof window[key] === 'undefined') {
      window[key] = value;
    }
  }
}
