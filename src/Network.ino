void prepareNetwork()
{
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(WIFI_AP_SSID, WIFI_AP_PASSWORD);
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
    address = WiFi.localIP().toString();
  }
}