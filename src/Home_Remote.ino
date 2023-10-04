#define SEND_PWM_BY_TIMER
#include <WiFi.h>
#include <WiFiMulti.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <AsyncElegantOTA.h>
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
const uint32_t connectTimeoutMs = 10000;
// Global variables
unsigned long previous_command_time = 0;
unsigned long boot_time = 0;
bool is_booting = false;
bool is_tv_on = false;
bool run_scan = false;
String EPG;
WiFiMulti wifiMulti;
AsyncWebServer server(80);

void notFound(AsyncWebServerRequest *request)
{
  request->send(404, "text/plain", "Not found");
}
void prepareSetup()
{
  // Initialize SPIFFS
  if (!SPIFFS.begin(true))
  {
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }
 
  int numNetworks = sizeof(wiFiNetworks) / sizeof(wiFiNetworks[0]);
  for (int i = 0; i < numNetworks; i++)
  {
    const char *ssid = wiFiNetworks[i].ssid;
    const char *password = wiFiNetworks[i].password;
    wifiMulti.addAP(ssid, password);
  }

  if (wifiMulti.run() != WL_CONNECTED)
  {
    Serial.printf("WiFi Failed!\n");
    return;
  }
  // Initialize mDNS
  if (!MDNS.begin(MDNS_HOSTNAME))
  {
    Serial.println("Error starting mDNS");
    return;
  }
  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  }
}
void prepareServer()
{
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(200, "text/plain", "server running"); });
  server.serveStatic("/", SPIFFS, "/");
  server.on("/remote", HTTP_GET, [](AsyncWebServerRequest *request)
            {
    Serial.println("asking for remote");
    request->send(SPIFFS, "/remote.html"); });
  server.on("/epg", HTTP_GET, [](AsyncWebServerRequest *request)
            {
    if (EPG.length() > 0) {
        AsyncWebServerResponse *response = request->beginResponse(200, "application/json", EPG);
        request->send(response);
    } else {
        request->send(202);
    } });

  server.on("/uptime", HTTP_GET, [](AsyncWebServerRequest *request)
            {
      float uptime = (millis() - boot_time)/1000;
      request->send(200, "text/plain", String(int(uptime))); });
  server.on("/command", HTTP_POST, [](AsyncWebServerRequest *request)
            {
    String command, channel, device, r_msg, doscan;
    int r_code;
    try {
      if (!request->hasParam("device")) {
        throw std::runtime_error("Failed to get device");
      }
      device = request->getParam("device")->value();
      if (device.equalsIgnoreCase("tv")) {
        if (!request->hasParam("command")) {
          throw std::runtime_error("Failed to get command");
        }
        command = request->getParam("command")->value();
        sendTvCommand(command);
      } else if (device.equalsIgnoreCase("dth")) {
        run_scan = false;  //reset or turnoff autoscan when a dth command is received
        if (request->hasParam("channel")) {
          channel = request->getParam("channel")->value();
          switchChannel(channel);
        } else if (request->hasParam("command")) {
          command = request->getParam("command")->value();
          sendDthCommand(command);
        } else if (request->hasParam("scan")) {
          doscan = request->getParam("scan")->value();
          run_scan = (doscan != "false");
        } else {
          throw std::runtime_error("Failed to get command or channel");
        }
      } else {
        throw std::runtime_error("Unknown device");
      }
      r_code = 200;
      r_msg = "ok";
    } catch (const std::runtime_error& e) {
      r_code = 400;
      r_msg = e.what();
    } catch (...) {
      r_code = 500;
      r_msg = "Unknown error occurred";
    }
    request->send(r_code, "text/plain", r_msg); });
  AsyncElegantOTA.begin(&server, OTA_USERNAME, OTA_PASSWORD);
  server.onNotFound(notFound);
  server.begin();
}
void setup()
{
  Serial.begin(115200);
  is_booting = true;
  boot_time = millis();
  makeIr(); // prepare ir library
  prepareSetup();
  prepareServer();
}

void loop()
{
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
    if (WiFi.status() == WL_CONNECTED)
    {
      EPG = getEpgData();
    }
  }

  // Reconnect wifi loop
  if ((WiFi.status() != WL_CONNECTED))
  {
    Serial.println(" Reconnecting to WiFi...");
    wifiMulti.run(connectTimeoutMs);
    Serial.println("Re-preparing server");
    prepareServer();
    if (EPG == "" && WiFi.status() == WL_CONNECTED)
    {
      EPG = getEpgData();
    }
    delay(connectTimeoutMs);
  }

  // Scan channel loop
  if (run_scan && currentMillis - previous_command_time >= CH_SCAN_INTERVAL)
  {
    sendDthCommand("ch_up");
    previous_command_time = currentMillis;
  }
}