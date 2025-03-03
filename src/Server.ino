
#include <string>

void prepareServer()
{
  if (!LittleFS.begin())
  {
    Serial.println("LittleFS Mount Failed. Do Platform -> Build Filesystem Image and Platform -> Upload Filesystem Image from VSCode");
    return;
  }
  server.serveStatic("/", LittleFS, "/");
  server.listen(80);
  server.on("/", HTTP_GET, [](PsychicRequest *request)
            {
               PsychicFileResponse response(request, LittleFS, "/remote.html");
               return response.send(); });
  server.on("/ip", HTTP_GET, [](PsychicRequest *request)
            { return request->reply(200, "text/plain", String(address).c_str()); });
  server.on("/epg", HTTP_GET, [](PsychicRequest *request)
            {
              PsychicResponse response(request);
              if (EPG.length() > 0)
              {
                response.setContent(EPG.c_str());
                 return response.send(); 
              }
              else
              {
                attemptEpgFetching = true;
                 return response.send(); 
              } });

  server.on("/uptime", HTTP_GET, [](PsychicRequest *request)
            {
              float uptime = (millis() - boot_time)/1000;
            return  request->reply(200, "text/plain", String(int(uptime)).c_str()); });
  server.on("/command", HTTP_POST, [](PsychicRequest *request)
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
 return request->reply(r_code, "text/plain", r_msg.c_str()); });
  server.onNotFound([](PsychicRequest *request)
                    { return request->reply(404, "text/html", "Not found!"); });
}