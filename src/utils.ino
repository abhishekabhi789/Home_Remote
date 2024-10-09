// Keeps the inbuilt led glow for the given duration
void blinkLed(const int &duration)
{
  neopixelWrite(RGB_BUILTIN, 0, RGB_BRIGHTNESS, 0);
  delay(LED_BLINK_DURATON);
  neopixelWrite(RGB_BUILTIN, 0, 0, 0);
  return;
}
// call with boolean to start or stop. repeated call changes color
//  void bootIndication(bool loop)
//  {
//    static int turn = 0;
//    if (!loop)
//    {
//      neopixelWrite(RGB_BUILTIN, 0, 0, 0);
//      turn = 0;
//      return;
//    }
//    int state = turn % 3;
//    turn++;
//    if (state == 0)
//    {
//      neopixelWrite(RGB_BUILTIN, RGB_BRIGHTNESS, 0, 0);
//    }
//    else if (state == 1)
//    {
//      neopixelWrite(RGB_BUILTIN, 0, RGB_BRIGHTNESS, 0);
//    }
//    else
//    {
//      neopixelWrite(RGB_BUILTIN, 0, 0, RGB_BRIGHTNESS);
//    }
//    return;
//  }

// changes the led color gradually
void bootIndication(bool loop, float progress)
{
  if (!loop)
  {
    neopixelWrite(RGB_BUILTIN, 0, 0, 0);
    return;
  }
  float p = constrain(progress, 0, 1.0);

  int red, green, blue;
  if (p < 0.5)
  {
    red = (int)(255 * (1.0 - (p * 2)));
    blue = (int)(255 * (p * 2));
    green = 0;
  }
  else
  {
    blue = (int)(255 * (1.0 - ((p - 0.5) * 2)));
    green = (int)(255 * ((p - 0.5) * 2));
    red = 0;
  }
  neopixelWrite(RGB_BUILTIN, red, green, blue);
}
