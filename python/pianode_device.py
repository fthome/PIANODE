#!/usr/bin/env python
# -*- coding:utf-8 -*
'''
Projet : Pierron Afficheur Numérique Organiseur Didactique
Auteur : fthome@pierron.fr

Définition des devices
	- mcp3201 : Convirtisseur Analogique to Numérique sur protocole SPI
	- todo
'''
#Pour travailler sur les sources
import sys
sys.path.insert(0,'../../../FGPIO')

from FGPIO.device_io import *

class pianode_device(object):
	'''Device object for PIANODE project
	'''
	def __init__(self, topic, device=None):
		'''
		Initialisation :
			- device 	a FGPIO.device_io #TODO : tous, certains...?
		'''
		assert isinstance(device, device_io), "Invalid device. Must be de FGPIO.device_io"
		self.device_io = device
		self.topic = topic
		self.pianode = None
	
	def set_pianode(self, pianode):
		'''
		Set pianode, the main object
		'''
		self.pianode = pianode
	
	def on_device_value_change(self):
		'''
		function invoqued when value change : send mqtt value
		'''
		self.pianode.mqtt_send(self.topic, self.device_io.to_voltage(self.device_io.th_readed())) #TODO : ce serait pas mal de pouvoir passer directement la valeur au deamon. Voir compatibilité existant!
	
	def stop(self):
		'''
		Stop the device thread
		'''
		self.device_io.stop()