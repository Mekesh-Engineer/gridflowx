import asyncio
import websockets
import json

async def test_ws():
    uri = "ws://127.0.0.1:8000/ws/client"
    async with websockets.connect(uri) as ws:
        print("[WS CONNECTED] Connected to GridFlowX 1Hz Real-Time Client Broadcast Stream.")
        for i in range(3):
            raw = await ws.recv()
            msg = json.loads(raw)
            payload = msg.get("payload", {})
            solar = payload.get("solarPowerW", payload.get("solar_power", payload.get("solar", {}).get("power")))
            load = payload.get("totalLoadPowerW", payload.get("total_load", payload.get("loads", {}).get("total_power")))
            soc = payload.get("batterySoc", payload.get("battery_soc", payload.get("battery", {}).get("soc")))
            freq = payload.get("gridFrequencyHz", payload.get("grid_frequency", payload.get("grid", {}).get("frequency", 50.0)))
            print(f"  Frame {i+1} ({msg.get('type')}): Solar={solar}W | Load={load}W | SoC={soc}% | GridFreq={freq}Hz")

if __name__ == "__main__":
    asyncio.run(test_ws())
