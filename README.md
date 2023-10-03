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
const char *MDNS_HOSTNAME = "homeremote";//http://homeremote.local/
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

Host address should be whitelisted on `chrome://flags/#unsafely-treat-insecure-origin-as-secure` to install as PWA and use voice commands.


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
