void prepareNetwork()
{
  WiFi.mode(WIFI_STA);

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