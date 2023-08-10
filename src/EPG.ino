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
    return "error";
  }
}

String getHtmlData()
{
  const char *root_ca =
      "-----BEGIN CERTIFICATE-----\n"
      "MIIF2DCCA8CgAwIBAgIQTKr5yttjb+Af907YWwOGnTANBgkqhkiG9w0BAQwFADCB\n"
      "hTELMAkGA1UEBhMCR0IxGzAZBgNVBAgTEkdyZWF0ZXIgTWFuY2hlc3RlcjEQMA4G\n"
      "A1UEBxMHU2FsZm9yZDEaMBgGA1UEChMRQ09NT0RPIENBIExpbWl0ZWQxKzApBgNV\n"
      "BAMTIkNPTU9ETyBSU0EgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwHhcNMTAwMTE5\n"
      "MDAwMDAwWhcNMzgwMTE4MjM1OTU5WjCBhTELMAkGA1UEBhMCR0IxGzAZBgNVBAgT\n"
      "EkdyZWF0ZXIgTWFuY2hlc3RlcjEQMA4GA1UEBxMHU2FsZm9yZDEaMBgGA1UEChMR\n"
      "Q09NT0RPIENBIExpbWl0ZWQxKzApBgNVBAMTIkNPTU9ETyBSU0EgQ2VydGlmaWNh\n"
      "dGlvbiBBdXRob3JpdHkwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCR\n"
      "6FSS0gpWsawNJN3Fz0RndJkrN6N9I3AAcbxT38T6KhKPS38QVr2fcHK3YX/JSw8X\n"
      "pz3jsARh7v8Rl8f0hj4K+j5c+ZPmNHrZFGvnnLOFoIJ6dq9xkNfs/Q36nGz637CC\n"
      "9BR++b7Epi9Pf5l/tfxnQ3K9DADWietrLNPtj5gcFKt+5eNu/Nio5JIk2kNrYrhV\n"
      "/erBvGy2i/MOjZrkm2xpmfh4SDBF1a3hDTxFYPwyllEnvGfDyi62a+pGx8cgoLEf\n"
      "Zd5ICLqkTqnyg0Y3hOvozIFIQ2dOciqbXL1MGyiKXCJ7tKuY2e7gUYPDCUZObT6Z\n"
      "+pUX2nwzV0E8jVHtC7ZcryxjGt9XyD+86V3Em69FmeKjWiS0uqlWPc9vqv9JWL7w\n"
      "qP/0uK3pN/u6uPQLOvnoQ0IeidiEyxPx2bvhiWC4jChWrBQdnArncevPDt09qZah\n"
      "SL0896+1DSJMwBGB7FY79tOi4lu3sgQiUpWAk2nojkxl8ZEDLXB0AuqLZxUpaVIC\n"
      "u9ffUGpVRr+goyhhf3DQw6KqLCGqR84onAZFdr+CGCe01a60y1Dma/RMhnEw6abf\n"
      "Fobg2P9A3fvQQoh/ozM6LlweQRGBY84YcWsr7KaKtzFcOmpH4MN5WdYgGq/yapiq\n"
      "crxXStJLnbsQ/LBMQeXtHT1eKJ2czL+zUdqnR+WEUwIDAQABo0IwQDAdBgNVHQ4E\n"
      "FgQUu69+Aj36pvE8hI6t7jiY7NkyMtQwDgYDVR0PAQH/BAQDAgEGMA8GA1UdEwEB\n"
      "/wQFMAMBAf8wDQYJKoZIhvcNAQEMBQADggIBAArx1UaEt65Ru2yyTUEUAJNMnMvl\n"
      "wFTPoCWOAvn9sKIN9SCYPBMtrFaisNZ+EZLpLrqeLppysb0ZRGxhNaKatBYSaVqM\n"
      "4dc+pBroLwP0rmEdEBsqpIt6xf4FpuHA1sj+nq6PK7o9mfjYcwlYRm6mnPTXJ9OV\n"
      "2jeDchzTc+CiR5kDOF3VSXkAKRzH7JsgHAckaVd4sjn8OoSgtZx8jb8uk2Intzna\n"
      "FxiuvTwJaP+EmzzV1gsD41eeFPfR60/IvYcjt7ZJQ3mFXLrrkguhxuhoqEwWsRqZ\n"
      "CuhTLJK7oQkYdQxlqHvLI7cawiiFwxv/0Cti76R7CZGYZ4wUAc1oBmpjIXUDgIiK\n"
      "boHGhfKppC3n9KUkEEeDys30jXlYsQab5xoq2Z0B15R97QNKyvDb6KkBPvVWmcke\n"
      "jkk9u+UJueBPSZI9FoJAzMxZxuY67RIuaTxslbH9qh17f4a+Hg4yRvv7E491f0yL\n"
      "S0Zj/gA0QHDBw7mh3aZw4gSzQbzpgJHqZJx64SIDqZxubw5lT2yHh17zbqD5daWb\n"
      "QOhTsiedSrnAdyGN/4fy3ryM7xfft0kL0fJuMAsaDk527RH89elWsn2/x20Kk4yl\n"
      "0MC2Hb46TpSi125sC8KKfPog88Tk5c0NqMuRkrF8hey1FGlmDoLnzc7ILaZRfyHB\n"
      "NVOFBkpdn627G190\n"
      "-----END CERTIFICATE-----\n";

  HTTPClient http;
  String source;

  try
  {
    http.setTimeout(30000); // 30 Seconds
    http.begin("https://dailypricelist.com/malayalam-tv-movies-list-today.php", root_ca);
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