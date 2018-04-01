#!/usr/bin/env python
# -*- coding:utf-8 -*
'''
Projet : Pierron Afficheur Numérique Organiseur Didactique
Auteur : fthome@pierron.fr

Gestion sur raspberry pi des entrée sorties 
	- mcp3201 : Convirtisseur Analogique to Numérique sur protocole SPI
	- todo
Envoie des information via mqtt

main programme
'''
#Pour travailler sur les sources
import sys
sys.path.insert(0,'../../../FGPIO')
sys.path.insert(0,'../../../FUTIL')

from FUTIL.my_logging import *
from FGPIO.mcp3201_hspi_io import *
from pianode_rpi import *
from pianode_device import *

my_logging(console_level = DEBUG, logfile_level = INFO, details = False)

Pianode = pianode(devices=[
	pianode_device("INPUT_VOLTAGE",mcp3201_hspi_io())])

Pianode.runforever()

try: #Ca permet de pouvoir planter le thread avec un CTRL-C
	while True:
		pass
except KeyboardInterrupt:
	Pianode.stop()