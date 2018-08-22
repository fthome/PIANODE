# Projet PIANODE
# Node-RED node (Raspberry Pi compatible)
Ce node permet de lire de manière continue la tension appliquée au bornes de la carte d'extension PIANODE

## Requirements

- Une carte d'extension PIANODE (www.pierron.fr)

On the Linux system where your Node-RED is running and where your sensors are connected to, make sure you have loaded all the kernel modules needed for working SPI

```
sudo raspi-config
	Interfacing options
		SPI
			enable : yes|oui
```

## Installation

Run the following command in the root directory of your Node-RED install

```
npm install node-red-pianode-internal_voltage --save
```

## Nodes


# Internal_voltage : Lecture du convertisseur MCP3201 de la carte PIANODE
* you can select the SPI bus
* configurable time interval of the sensor sampling
* you can configure name of the node, that could be for example the place where is the node placed, if no name set, ID of the device is used as a label



## Features

