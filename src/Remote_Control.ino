#include <IRremote.h>
#include "remote_tv.h"
#include "remote_dth.h"

void prepareRemoteControl()
{
  IrSender.begin(DISABLE_LED_FEEDBACK, 0);
}

void sendTvCommand(const String &command)
{
  blinkLed(LED_BLINK_DURATON);
  Serial.println("Sending tv: " + command);
  const uint16_t *commandCode = getTvCommandCode(command);
  if (commandCode != nullptr)
  {
    size_t commandSize = 0;
    while (commandCode[commandSize] != 0)
    {
      commandSize++;
    }
    delay(COMMAND_INTERVAL);
    IrSender.sendRaw(commandCode, commandSize, FREQUENCY);
  }
  else
  {
    Serial.println("Command not found!");
  }
}
void sendDthCommand(const String &command)
{
  blinkLed(LED_BLINK_DURATON);
  Serial.println("Sending dth: " + command);
  int address = getdthCommandCode("address");
  int cmd = getdthCommandCode(String(command));
  delay(COMMAND_INTERVAL);
  IrSender.sendSamsung(address, cmd, DTH_COMMAND_REPEAT);
}
void switchChannel(const String &channel)
{
  const String digitWords[] = {"zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"};
  for (size_t i = 0; i < channel.length(); i++)
  {
    char digit = channel[i];

    if (isdigit(digit))
    {
      int index = digit - '0';
      sendDthCommand(digitWords[index]);
    }
  }
  sendDthCommand("ok");
}

void TurnOnTv()
{
  sendTvCommand("power");
  return;
}
void prepareDth()
{
  const String commands[] = {"fav", "ok", "back", "two", "three", "three"};
  for (String i : commands)
  {
    sendDthCommand(i);
  }
  Serial.println("TV & Dth prepared");
  return;
}