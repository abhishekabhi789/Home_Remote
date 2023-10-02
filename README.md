Personal Project
## Connection Diagram & Demo:
- IR Receive: [TinkerCad- IR_Receiver](https://www.tinkercad.com/things/c8LqrfZuHpZ)

- IR Transmit: [TinkerCad- IR_Transmitter](https://www.tinkercad.com/things/cOmIBrUoD2K)

## Setup 
##### Sample `../Home_Remote/src/config.h` file
```c
const char *SSID = "";
const char *PASSWORD = "";
const char *OTA_USERNAME = "";
const char *OTA_PASSWORD = "";
```
#### sample `../Home_Remote/data/channeldata` file

```json
{
  "channels": [
    {
      "ch_num": 123,
      "name": "Channel Name",
      "logo_url": "https://example.com/channel_logo.png"
    }
   ]
  "movie_channels":["Channel Name"]
}
```
#### epg data structure
```json
[
  {
    "time": "9:30 AM",
    "channel": "Channel Name",
    "movie": "Show Name"
  }
]
  ```

An [Android App](https://raw.githubusercontent.com/abhishekabhi789/Home_Remote/main/AndroidApp/app/debug/app-debug.apk) is included which works only with `http://{ipaddress}/remote` urls.



## Libraries Used:
- [Arduino-IRremote](https://github.com/Arduino-IRremote/Arduino-IRremote)
- [ESPAsyncWebServer](https://github.com/me-no-dev/ESPAsyncWebServer)
- [AsyncElegantOTA](https://github.com/ayushsharma82/AsyncElegantOTA)

## Resources Used:
- [dailypricelist.com- EPG Movies](https://dailypricelist.com/malayalam-tv-movies-list-today.php)
- [~~wikimedia.org- Television_logos~~](https://commons.wikimedia.org/wiki/Category:Television_logos)


## References:
- [Basement Electronics- Sending Infrared Signals](https://youtu.be/2k7lWihdlFY)
- [RandomNerdTutorials- Demonstration of various ESP32 releated content](https://randomnerdtutorials.com/)
- [W3Schools- Table sorting](https://www.w3schools.com/howto/howto_js_sort_table.asp)
