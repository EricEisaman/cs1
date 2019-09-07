# IoT API

![](https://cdn.glitch.com/e93942d2-015d-47d7-aae4-9f92f2a7d6b5%2FESP8266.png?1557526884045)

The **iot-api** client side component provides interaction with an **IoT Device** such as an **ESP8266** via the server database.  Developers can design custom **IoT API Endpoints** in custom server side **iot-api** modules.

#  ⚠️ SET IOT_API_KEY in .env ⚠️ 

____

# Example Implementation
____

# Client Side
 
## 💾 Remotely control the IoT Device

```js
//This is the callback function run when your data arrives from the database.
//The returned status will either be 'success' or 'fail'.
function onResponse(status){
  if(status=='success'){
     //DO SOMETHING
   }else{
     //DO SOMETHING ELSE
   }
}


CS1.db.set({LED : 'on'} , onResponse)
```

## 💾 Get the current state of the IoT Device

```js
//This is the callback function run when your data arrives from the database.
function onResponse(value){
   //Provide visual feedback based on the value.
}

CS1.db.get('LED', onResponse);
```


# Server Side
 
## 💾 In this example, the server mediates communication between a polling IoT Device and the 3d application's client socket. 

##  💎 If the IoT device can support a secure websocket connection, it would be preferable over polling.

Note: the polling period should not be less than 3500 milliseconds to avoid hitting the hourly request limit for Glitch.

# On IoT Device  
[Example sketch at GitHub](https://github.com/EricEisaman/esp8266/blob/master/ino/cs1-iot.ino)

Example for remote control of an **ESP8266 LED**.
```c++
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>

ESP8266WebServer server;

char* ssid = "YOUR_SSID";
char* password = "YOUR_SSID_PASSWORD";

const char INDEX_HTML[] =
  "<!DOCTYPE HTML>"
  "<html>"
  "<head>"
  "<meta name = \"viewport\" content = \"width = device-width, initial-scale = 1.0, maximum-scale = 1.0, user-scalable=0\">"
  "<title>ESP8266</title>"
  "<style>"
    "body { background-color: #808080; font-family: Arial, Helvetica, Sans-Serif; Color: Maroon; }"
  "</style>"
  "</head>"
  "<body>"
  "<image src='https://raw.githubusercontent.com/EricEisaman/EricEisaman.github.io/master/images/eddies.png'/>"
  "<h1>ESP8266 Demo</h1>"
  "<button onclick='toggle()'>Toggle LED</button>"
  "<script>"
    "function toggle(){"
      "fetch('/toggle').then(data=>console.log(data))"
    "}"
  "</script>"
  "</body>"
  "</html>";

int POLLING_PERIOD=200; 
int intervalStartMS=millis();

void setup()
{
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid,password);
  Serial.begin(9600);
  while(WiFi.status()!=WL_CONNECTED)
  {
    Serial.print(".");
    delay(500);  
  }
  Serial.println("");
  Serial.print("IP Address: ");
  Serial.print(WiFi.localIP());
  Serial.println("");
  pinMode(LED_BUILTIN, OUTPUT); 
  digitalWrite(LED_BUILTIN,LOW);//Turn on LED

  server.on("/",sendIndex);
  server.on("/toggle", toggleLED);
  server.begin();
}

void loop()
{
  server.handleClient();
  if( millis() > intervalStartMS + POLLING_PERIOD ) {
    pollServer();
    intervalStartMS = millis();  
  }
  
  
}

void sendIndex(){
  server.send(200,"text/html",INDEX_HTML);  
}

void toggleLED(){
  digitalWrite(LED_BUILTIN,!digitalRead(LED_BUILTIN));
  //server.send(204,"");
  server.send(200,"text/plain","Toggle!\n");
}


void pollServer(){
  HTTPClient http;
    http.begin("http://your-project.glitch.me/iot-get/?key=aW49mH15Bo&prop=LED");
    int httpCode = http.GET();
    // httpCode will be negative on error
    if(httpCode > 0) {
        // HTTP header has been send and Server response header has been handled
        Serial.printf("[HTTP] GET... code: %d\n", httpCode);

        // file found at server
        if(httpCode == HTTP_CODE_OK) {
            String payload = http.getString();
            Serial.println(payload);
            Serial.println("");
            setLED(payload);
        }
     } else {
        Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
     }

     http.end(); 
}
String on = String("on");
void setLED(String state){
  if(state == on){
      Serial.println("TURNING THE LED ON.");
      Serial.println("");
      digitalWrite(LED_BUILTIN,LOW);
    }else{
      Serial.println("TURNING THE LED OFF.");
      Serial.println("");
      digitalWrite(LED_BUILTIN,HIGH);
    }
}
```



