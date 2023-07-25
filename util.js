const { WebSocket } = require("ws"),
  { performance } = require("perf_hooks"),
  ws = new WebSocket(`wss://chat.petals.dev/api/v2/generate`);

let resolveGenerateFunction;
const generateFunctionPromise = new Promise((resolve) => {
  resolveGenerateFunction = resolve;
});

ws.onopen = () => {
  ws.send(
    JSON.stringify({
      type: "open_inference_session",
      model: "meta-llama/Llama-2-70b-hf",
      max_length: 1024,
    })
  );
  ws.on("message", (message) => {
    const response = JSON.parse(message);
    resolveGenerateFunction(generate);
  });
};

async function generate(prompt, params, v) {
  performance.mark("start");
  if (!params) params = {};

  ws.send(
    JSON.stringify({
      type: "generate",
      inputs: prompt,
      max_new_tokens: params.max_new_tokens ? params.max_new_tokens : 32,
      ...params,
    })
  );

  return new Promise((resolve) => {
    ws.once("message", (message) => {
      const response = JSON.parse(message);
      performance.mark("end");
      if (v) console.log(performance.measure("gen_perf", "start", "end"));

      resolve(response.outputs);
    });
  });
}

module.exports = {
  getGenerateFunction: () => generateFunctionPromise,
};
