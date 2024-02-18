void blinkLed(const int &duration)
{
  neopixelWrite(RGB_BUILTIN, 0, RGB_BRIGHTNESS, 0);
  delay(LED_BLINK_DURATON);
  neopixelWrite(RGB_BUILTIN, 0, 0, 0);
  return;
}
void bootIndication(bool loop)
{
  static int turn = 0;
  if (!loop)
  {
    neopixelWrite(RGB_BUILTIN, 0, 0, 0);
    turn = 0;
    return;
  }
  int state = turn % 3;
  turn++;
  if (state == 0)
  {
    neopixelWrite(RGB_BUILTIN, RGB_BRIGHTNESS, 0, 0);
  }
  else if (state == 1)
  {
    neopixelWrite(RGB_BUILTIN, 0, RGB_BRIGHTNESS, 0);
  }
  else
  {
    neopixelWrite(RGB_BUILTIN, 0, 0, RGB_BRIGHTNESS);
  }
  delay(500);
}