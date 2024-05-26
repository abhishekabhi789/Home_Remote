Personal Project
## Connection Diagram & Demo:
- IR Receive: [TinkerCad- IR_Receiver](https://www.tinkercad.com/things/c8LqrfZuHpZ)

- IR Transmit: [TinkerCad- IR_Transmitter](https://www.tinkercad.com/things/cOmIBrUoD2K)

## Screenshots

![Screenshots](/Screenshot.png)

<center><small><small><small><small>

Template Credit: [freepik](https://www.freepik.com/free-psd/laptop-smartphone-composition-transparent-background_143806137.htm#query=computer%20tablet%20phone&position=48&from_view=keyword&track=ais_user&uuid=d7f4f6c3-e634-4ce3-a6d8-0eeff29f52b2 "Image by Vectonauta")
</small></small></small></small></center>

## Setup 
#### Sample `../Home_Remote/src/config.h` file
```c
const char *MDNS_HOSTNAME = "remote";//http://remote.local/
const char *OTA_PASSWORD = "";

struct WiFiNetwork
{
    const char *ssid;
    const char *password;
};

WiFiNetwork wiFiNetworks[] = {
    {"ssid1", "password1"},
    {"ssid2", "password2"}
};
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

Host address should be whitelisted on `chrome://flags/#unsafely-treat-insecure-origin-as-secure` to install as PWA and to use voice commands.


## Libraries Used:
- [Arduino-IRremote](https://github.com/Arduino-IRremote/Arduino-IRremote)
- [ESPAsyncWebServer](https://github.com/me-no-dev/ESPAsyncWebServer)

## Resources Used:
- [dailypricelist.com- EPG Movies](https://dailypricelist.com/malayalam-tv-movies-list-today.php)
- [~~wikimedia.org- Television_logos~~](https://commons.wikimedia.org/wiki/Category:Television_logos)


## References:
- [Basement Electronics- Sending Infrared Signals](https://youtu.be/2k7lWihdlFY)
- [RandomNerdTutorials- Demonstration of various ESP32 releated content](https://randomnerdtutorials.com/)
- [W3Schools- Table sorting](https://www.w3schools.com/howto/howto_js_sort_table.asp)
