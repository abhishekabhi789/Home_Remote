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
  // ISRG Root X1, valid until Sat Mar 13 2027, size: 1801 bytes
  const char *rootCACertificate =
      "-----BEGIN CERTIFICATE-----\n"
      "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\n"
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