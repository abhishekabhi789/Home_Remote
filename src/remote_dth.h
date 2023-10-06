#include <map>

const std::map<String, uint16_t> dthCommandMap = {
  { "address", 0x1AF2 },
  { "zero", 0x9 },
  { "one", 0x0 },
  { "two", 0x1 },
  { "three", 0x2 },
  { "four", 0x3 },
  { "five", 0x4 },
  { "six", 0x5 },
  { "seven", 0x6 },
  { "eight", 0x7 },
  { "nine", 0x8 },
  { "power", 0x1E },
  { "ch_up", 0xC },
  { "ch_down", 0xD },
  { "vol_up", 0xA },
  { "vol_down", 0xB },
  { "mute", 0x20 },
  { "menu", 0x25 },
  { "back", 0x2C },
  { "nav_up", 0x10 },
  { "nav_down", 0x11 },
  { "nav_left", 0x12 },
  { "nav_right", 0x13 },
  { "ok", 0x14 },
  { "fav", 0x1B },
  { "info", 0x21 },
  { "tv_radio", 0x2B },
  { "last_ch", 0x30 },
  { "audio_track", 0x31 },
  { "audio_channel", 0x35 },
  { "record", 0x16 },
  { "stop", 0x47 },
  { "red", 0x42 },
  { "green", 0x43 },
  { "yellow", 0x50 },
  { "blue", 0x46 },
  { "list_hdd", 0x4F },
  { "timer_record", 0x37 },
  { "epg", 0xF },
  { "mail", 0x2E }
};

uint16_t getdthCommandCode(const String& command) {
  auto it = dthCommandMap.find(command);
  if (it != dthCommandMap.end()) {
    return it->second;
  } else {
    return 0;
  }
}