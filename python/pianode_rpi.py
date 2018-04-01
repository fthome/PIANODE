#!/usr/bin/env python
# -*- coding:utf-8 -*
'''
Projet : Pierron Afficheur Numérique Organiseur Didactique
Auteur : fthome@pierron.fr

Gestion sur raspberry pi des entrée sorties 
	- mcp3201 : Convirtisseur Analogique to Numérique sur protocole SPI
	- todo
Envoie des information via mqtt
'''

import paho.mqtt.client as paho
import logging
import socket


class pianode(object):
	'''
	Interface devices to mqtt
	'''
	def __init__(self,mqtt_host="localhost", mqtt_port = 1883, mqtt_base_topic = "PIERRON/", devices = []):
		'''
		Initialisation :
			- mqtt_host		IP or HOSTNAME of the mqtt broket (default : localhost)
			- mqtt_port		port of the mqtt broker (default : 1883)
			- devices		list of attached devices (default = [])
		'''
		self.mqtt_base_topic = mqtt_base_topic
		if self.mqtt_base_topic:
			if self.mqtt_base_topic[-1]!='/':
				self.mqtt_base_topic = self.mqtt_base_topic + '/'
		self.mqtt_client = paho.Client()
		try:
			self.mqtt_client.connect(mqtt_host, mqtt_port, 30)
		except socket.error:
			logging.error("Mqtt server : Connection refused")
		self.devices = devices
		for device in self.devices:
			device.set_pianode(self)
	
	def mqtt_send(self, topic, payload):
		'''Send a mqtt message
		'''
		topic = self.mqtt_base_topic + topic
		logging.debug("MQTT SEND topic : %s , payload : %s"%(topic, payload))
		try:
			self.mqtt_client.reconnect()
			self.mqtt_client.publish(topic, payload)
		except socket.error:
			logging.error("Mqtt server : Connection refused")
	
	def runforever(self):
		'''
		Run the program until stop()
		'''
		for device in self.devices:
			device.device_io.add_thread(device.on_device_value_change)
	
	def stop(self):
		for device in self.devices:
			device.stop()
			