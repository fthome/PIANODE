-------------------------------------------------
--  Projet : des IOT a base de nodemcu (ESP8266)
--           qui communiquent en MQTT
-------------------------------------------------
--  Auteur : FredThx  
-------------------------------------------------
--  Ce fichier : paramètres pour interface PIERRON/Mesura
--               avec
--                  - 1 MCP3201 avec Vref = 3.3V
--                  
-------------------------------------------------
-- Modules nécessaires dans le firmware :
--    file, gpio, net, node,tmr, uart, wifi
--    bit, mqtt, spi, sjson
-------------------------------------------------

LOGGER = false
TELNET = false
WATCHDOG = true
WATCHDOG_TIMEOUT = 30*60 -- 30 minutes
MSG_DEBUG = false -- if true : send messages (ex : "MQTT send : ok")


-- Convertisseur Analogique Nnumérique
mcp3201 = _dofile("mcp3201")
mcp3201.init()

-- creation alarm pour envoie usb
tmr.alarm(6,500,tmr.ALARM_AUTO, function()
			local value = mcp3201.read() * 3.3 / 2
		    local t = {
		        topic = mqtt_base_topic.."tension",
		        payload = tostring(value)
		    }
		    print(sjson.encode(t))
          end
)

------------------------------
-- Modules a charger
------------------------------
modules={}

------------------
-- Params WIFI 
------------------
SSID = {"PIERRON"}
PASSWORD = "Pierr0neducAction57206ruegutenberg"
HOST = "PI_NODE_TEST"
wifi_time_retry = 10 -- minutes

--------------------
-- Params MQTT
--------------------
--mqtt_host = "31.29.97.206"
mqtt_host = "10.10.1.156"
mqtt_port = 1883
mqtt_user = nil
mqtt_pass = nil
mqtt_client_name = HOST
mqtt_base_topic = "PIERRON/" .. HOST .. "/"

-- Messages MQTT sortants
mesure_period =  500
mqtt_out_topics = {}
mqtt_out_topics[mqtt_base_topic.."tension"]={
                message = function() 
                        local value = mcp3201.read() * 3.3 / 2
                        return value -- return 0 at 0V and 1 at 2V
                    end,
                qos = 0, retain = 0, callback = nil}

-- Messages sur trigger GPIO
mqtt_trig_topics = {}
-- Actions sur messages MQTT entrants
mqtt_in_topics = {}
					
-- Messages MQTT sortants sur test
test_period = false
mqtt_test_topics = {}

--Gestion du display : mqtt(json)=>affichage
disp_texts = {}
