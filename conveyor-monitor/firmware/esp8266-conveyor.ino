// ========================================================== 
// ESP8266 Conveyor System (MARK11 - Tuned Logic)
// Version : v1.6
// Notes   :
// - Motor always ON
// - Sorter delay after pusher
// - Skip weight < 100g (no Firebase log)
// ==========================================================

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Servo.h>
#include <HX711_ADC.h>
#include <time.h>

// ------------------------------------------------------
// WIFI + FIREBASE CONFIG
// ------------------------------------------------------
#define WIFI_SSID "YOUR_WIFI"
#define WIFI_PASSWORD "YOUR_PASSWORD"
#define DB_URL "YOUR_FIREBASE_URL"

WiFiClientSecure client;

// ------------------------------------------------------
// PIN DEFINITIONS
// ------------------------------------------------------
#define SERVO1 D1     // Gate
#define SERVO2 D2     // Pusher (180°)
#define SERVO3 D3     // Sorter

#define MOTOR_IN3 D5
#define MOTOR_IN4 D4

#define HX_DOUT D6
#define HX_SCK  D7

Servo sGate;
Servo sPush;
Servo sSort;
HX711_ADC LoadCell(HX_DOUT, HX_SCK);

// ------------------------------------------------------
// GLOBAL STATE
// ------------------------------------------------------
float berat = 0.0;
float batasBerat = 150.0;
float MIN_VALID_WEIGHT = 100.0;

String statusMotor = "ON";
bool aplikasiAktif = true;
bool testMode = false;

unsigned long lastSync = 0;

// ------------------------------------------------------
// TIME HELPERS
// ------------------------------------------------------
String two(int x){ return (x<10?"0":"") + String(x); }

String isoTime() {
  time_t now = time(nullptr);
  struct tm* t = localtime(&now);
  return 
    String(t->tm_year+1900) + "-" + two(t->tm_mon+1) + "-" + two(t->tm_mday) +
    "T" + two(t->tm_hour) + ":" + two(t->tm_min) + ":" + two(t->tm_sec) + "+07:00";
}

// ------------------------------------------------------
// FIREBASE REST
// ------------------------------------------------------
bool rtdbGet(String path, String &out) {
  HTTPClient http;
  String url = String(DB_URL) + "/" + path + ".json";
  if (!http.begin(client, url)) return false;
  int code = http.GET();
  if (code == 200) out = http.getString();
  http.end();
  return code == 200;
}

bool rtdbPut(String path, String jsonBody) {
  HTTPClient http;
  String url = String(DB_URL) + "/" + path + ".json";
  if (!http.begin(client, url)) return false;
  http.addHeader("Content-Type", "application/json");
  int code = http.PUT(jsonBody);
  http.end();
  return code >= 200;
}

bool rtdbPost(String path, String jsonBody) {
  HTTPClient http;
  String url = String(DB_URL) + "/" + path + ".json";
  if (!http.begin(client, url)) return false;
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(jsonBody);
  http.end();
  return code >= 200;
}

float getFloat(String path){ String s; return rtdbGet(path, s) ? s.toFloat() : 0; }
bool getBool(String path){ String s; return rtdbGet(path, s) ? (s=="true") : false; }
String getString(String path) {
  String s; 
  if (rtdbGet(path, s)) {
    if (s.startsWith("\"")) s = s.substring(1, s.length()-1);
    return s;
  }
  return "";
}

// ------------------------------------------------------
// MOTOR CONTROL
// ------------------------------------------------------
void motorForwardPWM(int spd){
  digitalWrite(MOTOR_IN4, LOW);
  analogWrite(MOTOR_IN3, constrain(spd, 0, 1023));
}

void motorOff(){
  analogWrite(MOTOR_IN3, 0);
  analogWrite(MOTOR_IN4, 0);
}

// ------------------------------------------------------
// SERVO CONTROL
// ------------------------------------------------------

// Gate
void gateOpen(){ sGate.write(0); }
void gateClose(){ sGate.write(65); }

// ------------------------------------------------------
// PUSHER (180° SERVO)
// ------------------------------------------------------
int PUSH_IDLE = 0;
int PUSH_FULL = 180;

void pusherPush() {
  sPush.write(PUSH_FULL);
  delay(2000);
  sPush.write(PUSH_IDLE);
  delay(2000);
}

// ------------------------------------------------------
// SORTER
// ------------------------------------------------------
int SORT_IDLE_LEFT  = 20;   
int SORT_IDLE_RIGHT = 160;

int SORT_PUSH_RIGHT = 180;
int SORT_PUSH_LEFT  = 0;

void sorterIdle(char kategori) {
  if (kategori == 'A') sSort.write(SORT_IDLE_LEFT);
  else sSort.write(SORT_IDLE_RIGHT);
}

void sorterSort(char kategori) {
  if (kategori == 'A') {
    sSort.write(SORT_PUSH_RIGHT);
    delay(500);
    sSort.write(SORT_IDLE_LEFT);
  } else {
    sSort.write(SORT_PUSH_LEFT);
    delay(500);
    sSort.write(SORT_IDLE_RIGHT);
  }
}

// ------------------------------------------------------
// LOAD CELL
// ------------------------------------------------------
float readStableWeight(unsigned long durMs = 500) {
  unsigned long start = millis();
  while (millis() - start < durMs) {
    LoadCell.update();
    delay(5);
  }

  float tot = 0;
  for (int i=0; i<15; i++){
    LoadCell.update();
    tot += LoadCell.getData();
    delay(20);
  }
  return tot / 15.0;
}

// ------------------------------------------------------
// SETUP
// ------------------------------------------------------
void setup() {
  Serial.begin(9600);
  delay(300);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) { delay(300); Serial.print("."); }
  Serial.println("\nWiFi OK");

  client.setInsecure();
  configTime(7*3600,0,"pool.ntp.org");

  sGate.attach(SERVO1, 500, 2500);
  sPush.attach(SERVO2, 500, 2500);
  sSort.attach(SERVO3, 500, 2500);

  gateClose();
  sSort.write(SORT_IDLE_LEFT);

  pinMode(MOTOR_IN3, OUTPUT);
  pinMode(MOTOR_IN4, OUTPUT);

  motorForwardPWM(1023); // MOTOR SELALU NYALA

  LoadCell.begin();
  LoadCell.start(1500);
  LoadCell.setCalFactor(2135.90);
  if (!LoadCell.getTareTimeoutFlag()) LoadCell.tare();
}

// ------------------------------------------------------
// MAIN LOOP
// ------------------------------------------------------
void loop() {
  LoadCell.update();

  if (millis() - lastSync > 4000) {
    batasBerat    = getFloat("settings/batasBerat");
    aplikasiAktif = getBool("settings/aplikasiAktif");
    testMode      = getBool("settings/testMode");
    statusMotor   = getString("conveyor/statusMotor");
    lastSync = millis();
  }

  if (!aplikasiAktif) {
    motorOff();
    return;
  } else {
    motorForwardPWM(1023);
  }

  // GATE
  gateOpen();
  delay(200);
  gateClose();

  delay(2000); // stabil sebelum timbang

  // WEIGHT
  berat = readStableWeight();

  // SKIP JIKA TERLALU RINGAN
  if (berat < MIN_VALID_WEIGHT) {
    Serial.println("SKIP: berat < 100g");
    delay(500);
    return;
  }

  char kategori = (berat < batasBerat ? 'A' : 'B');
  sorterIdle(kategori);

  // LOG FIREBASE (HANYA VALID)
  rtdbPut("conveyor/beratTerakhir", String(berat,2));
  rtdbPost("conveyor/history",
    String("{\"berat\":") + berat +
    ",\"kategori\":\"" + kategori +
    "\",\"tanggal\":\"" + isoTime() + "\"}"
  );

  // PUSHER
  pusherPush();

  // DELAY SAMPAI BUAH JATUH KE SORTER
  delay(1500);

  // SORTER
  sorterSort(kategori);

  delay(800);
}

// MARK11 v1.6 FINAL