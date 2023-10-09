void prepareServer()
{
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
            { request->send(200, "text/plain", String(address)); });
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
        attemptEpgFetching = true;
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
  server.onNotFound(notFound);
  server.begin();
}