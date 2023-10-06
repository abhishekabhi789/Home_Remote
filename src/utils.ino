void blinkLed(const int &duration)
{
  neopixelWrite(RGB_BUILTIN, 0, RGB_BRIGHTNESS, 0);
  delay(LED_BLINK_DURATON);
  neopixelWrite(RGB_BUILTIN, 0, 0, 0);
  return;
}
