#define SEND_PWM_BY_TIMER
#define IR_SEND_PIN 3
#define RGB_BRIGHTNESS 64
#include <WiFi.h>
#include <WiFiMulti.h>
#include <ArduinoOTA.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <ESPmDNS.h>
#include "config.h" //credentials

// Configurations
const int TV_ON_DELAY = 5000;
const int DTH_BOOT_DELAY = 40000;
const int LED_BLINK_DURATON = 100;
const int CH_SCAN_INTERVAL = 6000;
const int COMMAND_INTERVAL = 350;
const int SEND_PIN = 3;
const int DTH_COMMAND_REPEAT = 2;
const int WIFI_SCAN_INTERVAL = 30000;
const int connectTimeoutMs = 10000;

// Global variables
unsigned long previous_scan_time = 0;
unsigned long previous_command_time = 0;
unsigned long boot_time = 0;
bool is_booting = false;
bool is_tv_on = false;
bool run_scan = false;
String EPG;
bool attemptEpgFetching = false;
String address;
WiFiMulti wifiMulti;
AsyncWebServer server(80);

void notFound(AsyncWebServerRequest *request)
{
  request->send(404, "text/plain", "Not found");
}

void setup()
{
  Serial.begin(115200);
  is_booting = true;
  boot_time = millis();
  makeIr(); // prepare ir library
  prepareNetwork();
  prepareServer();
  prepareOTA();
}

void loop()
{
  ArduinoOTA.handle();
  unsigned long currentMillis = millis();
  // not a loop, turn on tv after delay
  if ((is_booting == true) && (is_tv_on == false) && (currentMillis - boot_time > TV_ON_DELAY))
  {
    TurnOnTv();
    is_tv_on = true;
  }

  // not a loop, Waiting for dth to receive commands
  if ((is_booting == true) && (currentMillis - boot_time > DTH_BOOT_DELAY))
  {
    prepareDth();
    is_booting = false;
    attemptEpgFetching = true;
  }

  // Reconnect wifi loop
  if ((WiFi.status() != WL_CONNECTED) && (currentMillis - previous_scan_time >= WIFI_SCAN_INTERVAL))
  {
    Serial.println(" Reconnecting to WiFi...");
    wifiMulti.run(connectTimeoutMs);
    Serial.println("Re-preparing server");
    prepareServer();
    if (WiFi.status() == WL_CONNECTED)
    {
      address = WiFi.localIP().toString();
    }
    else
    {
      Serial.println("wifi connection failed.");
      address = "";
      previous_scan_time = currentMillis;
      return;
    }
  }
  // fetch epg if not obtained
  if (attemptEpgFetching && EPG == NULL && WiFi.status() == WL_CONNECTED)
  {
    blinkLed(1000);
    EPG = getEpgData();
    if (EPG)
    {
      attemptEpgFetching = false;
    }
  }

  // Scan channel loop
  if (run_scan && currentMillis - previous_command_time >= CH_SCAN_INTERVAL)
  {
    sendDthCommand("ch_up");
    previous_command_time = currentMillis;
    return;
  }
}