#define RGB_BRIGHTNESS 64 // brighness

void blinkLed(const int &duration)
{
  neopixelWrite(RGB_BUILTIN, 0, RGB_BRIGHTNESS, 0);
  delay(LED_BLINK_DURATON);
  neopixelWrite(RGB_BUILTIN, 0, 0, 0);
  return;
}

String getEpgMaxAge()
{
  time_t now = time(nullptr);
  struct tm midnight;
  midnight = *localtime(&now);
  midnight.tm_hour = 23;
  midnight.tm_min = 59;
  midnight.tm_sec = 59;
  time_t midnight_time = mktime(&midnight);
  int max_age = midnight_time - now;
  return String(max_age);
}