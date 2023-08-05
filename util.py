from websockets.sync.client import connect
import json
import time


def generate(prompt, v=False):
    start = time.time()
    with connect("wss://chat.petals.dev/api/v2/generate") as websocket:
        websocket.send(
            json.dumps(
                {
                    "type": "open_inference_session",
                    "model": "meta-llama/Llama-2-70b-chat-hf",
                    "max_length": 8192,
                }
            )
        )
        _succies = websocket.recv()  # Means we've opened a session.

        websocket.send(
            json.dumps(
                {
                    "type": "generate",
                    "inputs": prompt,
                    "do_sample": 1,
                    "temperature": 0.75,
                    "stop_sequence": "</s>",
                    "max_new_tokens": 80,
                }
            )
        )
        res = json.loads(websocket.recv())

        if not res["outputs"]:
            return generate(prompt)
        end = time.time()
        if v:
            print(end - start)
        return res["outputs"]
