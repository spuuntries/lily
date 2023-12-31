const { WebSocket } = require("ws"),
  { performance } = require("perf_hooks");

async function generate(prompt, v) {
  performance.mark("start");
  const ws = new WebSocket(`wss://chat.petals.dev/api/v2/generate`);

  return new Promise((resolve) => {
    ws.once("open", () => {
      ws.send(
        JSON.stringify({
          type: "open_inference_session",
          model: "meta-llama/Llama-2-70b-chat-hf",
          max_length: 8192,
        })
      );

      ws.once("message", (message) => {
        if (v) console.log("Generating");

        ws.send(
          JSON.stringify({
            type: "generate",
            inputs: prompt,
            do_sample: 1,
            temperature: 0.75,
            stop_sequence: "</s>",
            max_new_tokens: 80,
          })
        );

        ws.once("message", async (message) => {
          const response = JSON.parse(message);
          performance.mark("end");
          if (v)
            console.log(
              performance.measure("gen_perf", "start", "end").duration + "ms"
            );

          ws.close();
          if (!response.outputs) resolve(await generate(prompt, v));

          resolve(response.outputs.replaceAll("</s>", ""));
        });
      });
    });
  });
}

module.exports = {
  generate,
};
