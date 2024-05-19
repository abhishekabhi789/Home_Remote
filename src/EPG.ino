#include <HTTPClient.h>
#include <string>
#include <vector>

std::vector<std::string> rowToValues(const std::string &row)
{
  std::vector<std::string> matches;
  size_t startPos = 0;
  size_t endPos;
  while ((endPos = row.find("</td>", startPos)) != std::string::npos)
  {
    size_t contentStart = row.find(">", startPos) + 1;
    if (contentStart != std::string::npos)
    {
      std::string rowData = row.substr(contentStart, endPos - contentStart);
      matches.push_back(rowData);
    }
    startPos = endPos + 5;
  }

  return matches;
}

std::vector<std::string> splitString(const std::string &input, const std::string &delimiter)
{
  std::vector<std::string> result;
  size_t startPos = 0;
  size_t endPos;
  while ((endPos = input.find(delimiter, startPos)) != std::string::npos)
  {
    result.push_back(input.substr(startPos, endPos - startPos));
    startPos = endPos + delimiter.length();
  }
  result.push_back(input.substr(startPos));
  return result;
}

struct RowObject
{
  std::string time;
  std::string channel;
  std::string movie;
};

std::vector<RowObject> tableToJson(const std::string &table)
{
  std::vector<std::string> rows = splitString(table, "<tr>");
  std::vector<RowObject> json;
  for (size_t i = 3; i < rows.size() - 1; i++)
  {
    std::vector<std::string> values = rowToValues(rows[i]);
    RowObject rowObject;
    if (values.size() > 0)
      rowObject.time = values[0];
    if (values.size() > 1)
      rowObject.channel = values[1];
    if (values.size() > 2)
      rowObject.movie = values[2];
    json.push_back(rowObject);
  }
  return json;
}
String getEpgJson(const String &table)
{
  std::string tableStr = table.c_str();
  std::vector<RowObject> json = tableToJson(tableStr);
  String jsonString = "[\n";
  for (const auto &obj : json)
  {
    jsonString += "  {\n";
    jsonString += "    \"time\": \"" + String(obj.time.c_str()) + "\",\n";
    jsonString += "    \"channel\": \"" + String(obj.channel.c_str()) + "\",\n";
    jsonString += "    \"movie\": \"" + String(obj.movie.c_str()) + "\"\n";
    jsonString += "  },\n";
  }
  if (!json.empty())
  {
    jsonString.remove(jsonString.length() - 2); // Remove the last comma and newline
  }
  jsonString += "\n]";
  return jsonString;
}

String extractTableData(String htmlData)
{
  int tableStart = htmlData.indexOf("<table class=\"table-price tvpro suntvpro\">");
  int tableEnd = htmlData.indexOf("</table>", tableStart);
  if (tableStart != -1 && tableEnd != -1)
  {
    String tableData = htmlData.substring(tableStart, tableEnd + 8); // +8 to include the closing tag
    return getEpgJson(tableData);
  }
  else
  {
    return "";
  }
}

String getHtmlData()
{
  // generated using: https://projects.petrucci.ch/esp32/?page=ssl
  // certificate for https://dailypricelist.com
  // ISRG Root X1, valid until Mon Sep 15 2025, size: 1826 bytes
  const char *rootCACertificate =
      "-----BEGIN CERTIFICATE-----\n"
      "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\n"
      "nLRbwHOoq7hHwg==\n"
      "-----END CERTIFICATE-----\n"
      "";

  HTTPClient http;
  String source;

  try
  {
    http.setTimeout(30000); // 30 Seconds
    http.begin("https://dailypricelist.com/malayalam-tv-movies-list-today.php", rootCACertificate);
    int httpCode = http.GET();

    if (httpCode > 0)
    {
      source = http.getString();
    }
    else
    {
      Serial.println("Error on HTTP request");
    }
    http.end();
  }
  catch (const std::exception &e)
  {
    Serial.print("Caught exception: ");
    Serial.println(e.what());
    source = "";
  }
  catch (...)
  {
    Serial.println("Caught unknown exception.");
    source = "";
  }
  return source;
}

String getEpgData()
{
  Serial.println("getting epg...");
  String html_data = getHtmlData();
  if (html_data == "")
  {
    Serial.println("Request failed");
    return html_data;
  }
  Serial.println("Request success");
  String table = extractTableData(html_data);
  Serial.println("table extracted");
  return table;
}