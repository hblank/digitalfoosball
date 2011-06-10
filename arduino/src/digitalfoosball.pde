#include "WiFly.h"


/***********************
 ***  CONFIGURATION  ***
 ***********************/

// Wifi SSID
// Example: "mywifi"
char ssid[] = "mywifi";

// WPA passphrase (sorry, no spaces supported yet)
// Example: "secret-passphrase"
char passphrase[] = "secret-passphrase";

// Configure server name and server IP (no DNS to reduce lag)
// Examples: "my.digitalfoosball.net", {192, 168, 0, 1}
char serverName[] = "my.digitalfoosball.net";
byte serverIp[] = {192, 168, 0, 1};

// Configure context path (application base path), leave empty (not slash) for root
// Examples: "/my/path", ""
char context[] = "";

// Enable define to enable output messages on Serial
#define DEBUG
#define WIFI


/*******************************
 ***  CONSTANTS AND GLOBALS  ***
 *******************************/

// Pin constants
const int GOAL_A_PIN = 2;
const int GOAL_B_PIN = 4;
const int RESET_A_PIN = 3;
const int RESET_B_PIN = 5;
const int LED_PIN = 8; // Standard LED pin 13 used by Spi

// Uniqueness token, initialized by random, auto-incrementing
unsigned long token;

// The client for communication with goal server
Client client(serverIp, 80);

// Whether we think we have associated/connected
boolean associated = false;
boolean connected = false;

// Debugging
#ifdef DEBUG
	#define LOG(message) Serial.print(message)
#else
	#define LOG(message) (((0)))
#endif


/**************************
 ***  Helper functions  ***
 **************************/

boolean ensureConnection(boolean checkWiFlyStatus)
{
	#ifndef WIFI
		return true;
	#endif

	WiFlyDevice::Status status = checkWiFlyStatus ? wiFly.getStatus(false) : WiFlyDevice::StatusConnected;
	if (status == WiFlyDevice::StatusError || status == WiFlyDevice::StatusNotAssociated
		|| status == WiFlyDevice::StatusNoIp)
	{
		if (associated)
		{
			LOG("Association LOST, rebooting and rejoining...\n");
			wiFly.begin();
		}

		LOG("Joining network...\n");
		if (!wiFly.join(ssid, passphrase))
		{
			LOG("ERROR: Joining network failed, trying again later.\n");
			flashError(1);
			return false;
		}

		LOG("Network joined.\n");
		associated = true;
		connected = false;
	}

	status = checkWiFlyStatus ? wiFly.getStatus(false) : WiFlyDevice::StatusConnected;
	if (!client.isConnected() || status != WiFlyDevice::StatusConnected)
	{
		if (connected)
			LOG("Connection LOST, reconnecting...\n");
		else
			LOG("Preconnecting to server...\n");

		if (!client.connect(false) || !client.isConnected())
		{
			LOG("Connection FAILED, trying again later.\n");
			flashError(2);
			return false;
		}

		LOG("Connected.\n");
		connected = true;
	}

	delay(250);
	return true;
}

void flashError(int errorNo)
{
	int i;
	for (int i=0; i<8; i++)
	{
		digitalWrite(LED_PIN, HIGH);
		delay(100);
		digitalWrite(LED_PIN, LOW);
		delay(100);
	}

	delay(500);

	for (int i=0; i<errorNo; i++)
	{
		digitalWrite(LED_PIN, HIGH);
		delay(500);
		digitalWrite(LED_PIN, LOW);
		delay(500);
	}

	delay(500);
}


/*****************************
 ***  Setup and main loop  ***
 *****************************/

void setup()
{
	Serial.begin(9600);
	LOG("Initializing...\n");

	pinMode(GOAL_A_PIN, INPUT);
	pinMode(GOAL_B_PIN, INPUT);
	pinMode(RESET_A_PIN, OUTPUT);
	pinMode(RESET_B_PIN, OUTPUT);
	pinMode(LED_PIN, OUTPUT);

	digitalWrite(GOAL_A_PIN, LOW);
	digitalWrite(GOAL_B_PIN, LOW);
	digitalWrite(RESET_A_PIN, LOW);
	digitalWrite(RESET_B_PIN, LOW);
	digitalWrite(LED_PIN, LOW);

	randomSeed(analogRead(0));
	token = random(65535);

	#ifdef WIFI
		wiFly.begin();
 		while (!ensureConnection(true))
			delay(1000);
	#endif

	digitalWrite(RESET_A_PIN, HIGH);
	digitalWrite(RESET_B_PIN, HIGH);
	delay(10);
	digitalWrite(RESET_A_PIN, LOW);
	digitalWrite(RESET_B_PIN, LOW);
	delay(10);

	LOG("Initialization done.\n");
}

void loop()
{
	char string[256];

	// Analyze inputs until we find a goal (HIGH is true)
	// Also check that we are still connected to the server and access point

	int playerPin = GOAL_A_PIN;
	long checkCount = 0;
	while (true)
	{
		playerPin = playerPin == GOAL_A_PIN ? GOAL_B_PIN : GOAL_A_PIN;
		if (digitalRead(playerPin) == HIGH)
			break;

		if ((checkCount % 200) == 0)
			while (!ensureConnection(checkCount == 0))
				delay(5000);

		delay(10);
		checkCount = (checkCount + 1) % 2000;
	}

	digitalWrite(LED_PIN, HIGH);
	#ifdef DEBUG
		sprintf(string, "Goal for %s team, ID %lu\n", playerPin == GOAL_A_PIN ? "home" : "visitors", token);
		LOG(string);
	#endif

	while (!ensureConnection(false))
		delay(1000);

	// Send a POST to the goal server

	char content[32];
	sprintf(content, "token=%lu", token);
	sprintf(string, "POST %s/events/goals/%s HTTP/1.1\r\n"
		"Host: %s\r\n"
		"User-Agent: Arduino/DigitalerKicker\r\n"
		"Content-Type: application/x-www-form-urlencoded\r\n"
		"Content-Length: %d\r\n\r\n%s", context,
		playerPin == GOAL_A_PIN ? "home" : "visitors", serverName,
		strlen(content), content);

	LOG("Sending request...\n");
	LOG(string);
	LOG("\n");
	#ifdef WIFI
		client.print(string);
	#else
		delay(500);
	#endif
	LOG("Request done.\n");
	token++;

	// Reset goal flip-flop and wait for input to be false (LOW) again

	do
	{
		digitalWrite(playerPin == GOAL_A_PIN ? RESET_A_PIN : RESET_B_PIN, HIGH);
		delay(10);
		digitalWrite(playerPin == GOAL_A_PIN ? RESET_A_PIN : RESET_B_PIN, LOW);
		delay(10);
	}
	while (digitalRead(playerPin) != LOW);

	digitalWrite(LED_PIN, LOW);

	// Disconnect and preconnect again

	#ifdef WIFI
		client.disconnect();
		connected = false;
	#endif
	ensureConnection(false);

	LOG("Ready for next goal.\n");
}
