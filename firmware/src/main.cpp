#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// WiFi & WS Configurations (Defaults - updated via platformio.ini or header)
const char* ssid = "GridFlowX_Node_AP";
const char* password = "secure_wlan_key";
const char* ws_host = "192.168.1.100"; // FastAPI server IP
const int ws_port = 8000;
const char* ws_path = "/ws/telemetry";

WebSocketsClient webSocket;
TaskHandle_t SafetyTask;
TaskHandle_t CommsTask;

// Pin configurations
const int RELAY_PINS[8] = {12, 13, 14, 15, 16, 17, 18, 19};

// Shared state (Thread safe volatile access or semaphores)
volatile float currentLoadVoltage = 12.0;
volatile float currentLoadCurrent = 0.0;
volatile float batteryTempC = 25.0;
volatile float batterySoc = 85.0;
volatile bool relaysActive[8] = {true, true, true, true, true, true, true, true};

// ── Core 0: High-Frequency Safety Loop (100Hz) ──
void safetyLoop(void * parameter) {
  for(;;) {
    // 1. Read sensors (ADC)
    // 2. Perform cutoff checks (SoC < 5% OR Temp > 90°C)
    if (batterySoc < 5.0 || batteryTempC > 90.0) {
      // Emergency cutouts (GPIO LOW to de-energize NC relays)
      for (int i = 0; i < 8; i++) {
        digitalWrite(RELAY_PINS[i], LOW);
        relaysActive[i] = false;
      }
      Serial.println("[SAFETY] EMERGENCY CUTOFF TRIGGERED!");
    }
    
    vTaskDelay(10 / portTICK_PERIOD_MS); // 100Hz Loop Rate
  }
}

// WebSocket Event Handler
void webSocketEvent(WSEvent_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WS] Disconnected!");
      break;
    case WStype_CONNECTED:
      Serial.println("[WS] Connected to FastAPI backend!");
      break;
    case WStype_TEXT: {
      JsonDocument doc;
      DeserializationError error = deserializeJson(doc, payload, length);
      if (!error) {
        const char* cmdType = doc["type"];
        if (strcmp(cmdType, "OVERRIDE") == 0) {
          int channel = doc["payload"]["channel"];
          bool state = doc["payload"]["state"];
          if (channel >= 0 && channel < 8) {
            digitalWrite(RELAY_PINS[channel], state ? HIGH : LOW);
            relaysActive[channel] = state;
            Serial.printf("[WS] Override: Relay %d set to %s\n", channel, state ? "ON" : "OFF");
          }
        } else if (strcmp(cmdType, "RECOVERY_AUTHORIZED") == 0) {
          Serial.println("[WS] Emergency recovery authorized. Restarting modules...");
        }
      }
      break;
    }
    default:
      break;
  }
}

// ── Core 1: WiFi & WebSocket Communication Stack (1Hz telemetry) ──
void commsLoop(void * parameter) {
  // Connect WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    vTaskDelay(500 / portTICK_PERIOD_MS);
    Serial.print(".");
  }
  Serial.println("\n[WiFi] Connected!");

  // Connect WebSocket
  webSocket.begin(ws_host, ws_port, ws_path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);

  unsigned long lastTelemetryTime = 0;

  for(;;) {
    webSocket.loop();

    unsigned long now = millis();
    if (now - lastTelemetryTime >= 1000) { // 1Hz telemetry transmission
      lastTelemetryTime = now;

      if (webSocket.isConnected()) {
        JsonDocument doc;
        doc["type"] = "telemetry_update";
        JsonObject payload = doc["payload"].to<JsonObject>();
        payload["deviceId"] = "esp32_relay_001";
        payload["solarPowerW"] = 480.0;
        payload["batteryCurrentA"] = currentLoadCurrent;
        payload["batterySoc"] = batterySoc;
        payload["gridPowerW"] = 0.0;
        payload["busVoltageV"] = currentLoadVoltage;
        
        JsonArray states = payload["relayStates"].to<JsonArray>();
        for (int i = 0; i < 8; i++) {
          states.add(relaysActive[i]);
        }

        String output;
        serializeJson(doc, output);
        webSocket.sendTXT(output);
      }
    }
    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}

void setup() {
  Serial.begin(115200);

  // Initialize GPIO pins
  for (int i = 0; i < 8; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], HIGH); // Energize relays by default (normally closed operation)
  }

  // Create dual-core FreeRTOS tasks
  xTaskCreatePinnedToCore(
    safetyLoop,   /* Task function. */
    "SafetyTask", /* name of task. */
    10000,        /* Stack size of task */
    NULL,         /* parameter of the task */
    1,            /* priority of the task */
    &SafetyTask,  /* Task handle to keep track of created task */
    0             /* pin task to core 0 */
  );

  xTaskCreatePinnedToCore(
    commsLoop,   /* Task function. */
    "CommsTask", /* name of task. */
    10000,       /* Stack size of task */
    NULL,        /* parameter of the task */
    1,           /* priority of the task */
    &CommsTask,  /* Task handle to keep track of created task */
    1            /* pin task to core 1 */
  );
}

void loop() {
  // Empty loop since processing is fully delegated to FreeRTOS cores
}
