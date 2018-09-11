module.exports = function(RED) {

	const VREF = 2; // Sortie Mesura 0-2V
	const VHIGH = 5; // Voltage critique
	const PRECISION_VOLTAGE = 0.004; // Précision de la mesure = 4mV
	
    function pianode_mesura2(config) {
        RED.nodes.createNode(this, config);
		this.device = config.device;
		this.device_mode = config.device_mode
		this.no_change_timer = config.no_change_timer * 1000; // user input is in seconds, this is conversion to miliseconds
		this.precision = config.precision/100;
		this.topic = config.topic;
		this.name = config.name;
		
        var node = this;
		
		node.prec_values = {};
		node.last_time_value_change = new Date();

		// init the device
		//node.status({fill:"grey",shape:"ring",text:"Init..."});
		
        this.on('input',function(msg) {
			
			//Les differentes entrees possibles :
			//
			// - cas des douilles : 
			//		- msg.payload = valeur
			//		- msg.DATAS = {tension:valeur,unit:'V'}
			//		- msg.MODELE = {...},
			//		- msg.unit = 'V'
			// - cas de PI_IOT en usb ou mqtt:
			//		- msg.payload = "{"DATAS":{"tension":1.422802734375},"modele":{"ID":"18:fe:34:cd:04:64","VERSION":"1","MODELE":"PI_IOT"}}"
			// - ou si utilisation d'un parser json en node-red
			//		- msg.payload = {DATAS:{tension:1.422802734375},modele:{ID:"18:fe:34:cd:04:64",VERSION:"1",MODELE:"PI_IOT"}
			// - cas d'un produit qui renvoie plusieurs valeurs à la fois
			//		- msg.payload = {"DATAS":["mes1":val1, "mes2:val2,...],"modele":{...}
			
			// Normalisation des données
			if (typeof msg.payload == "string"){
				msg.payload = JSON.parse(msg.payload);
			}
			msg = Object.assign(msg,msg.payload);
			delete msg.payload;
			if (!Array.isArray(msg.DATAS)){
				msg.DATAS=[msg.DATAS]
			}
			
			
			// On a maintenant toujours
			//
			//msg = {.... ,
			//			DATAS : [{mes1:val1,[unit:unit1]},...],
			//			MODELE : {ID:"xx",VERSION:"xx",MODELE:"xx"}
			//		}
			
			var now = new Date();
			
			msg.DATAS.forEach(function(mesure, index){
				
				var voltage
				var mesureName
				for(var propName in mesure){
					if (propName != 'unit'){
						voltage = mesure[propName];
						mesureName = propName;
						break;
					}
				}
				// console.log("mesure : ", mesure);
				// console.log("voltage : ", voltage);
				// console.log("mesureName : ", mesureName);
				// console.log("precision :", node.precision*VREF);
				if ((Math.abs(voltage - (node.prec_values[propName] || 0)) > node.precision*VREF) || ((now - node.last_time_value_change) > node.no_change_timer) || (voltage==VREF)){
					node.prec_values[propName] = voltage;
					node.last_time_value_change = now;
					var voltage_max = VREF;
					switch (node.device){
						case "None":
							msg.label = "Tension";
							msg.unit = "V";
							msg.payload = voltage;
							voltage_max = VHIGH;
							msg.precision = PRECISION_VOLTAGE;
							break;
						case "22013":
							msg.label = "Conductivité";
							msg.MODELE.MODELE = "22013 Conductimètre";
							msg.unit = "mS/cm";
							msg.payload = voltage / 1.95 * 200;
							msg.precision = PRECISION_VOLTAGE / 1.95 * 200;
							break;
						case "22016":
							msg.label = "Conductivité";
							msg.MODELE.MODELE = "22016 Conductimètre";
							msg.unit = "mS/cm";
							msg.payload = voltage / 1.95 * 200;
							msg.precision = PRECISION_VOLTAGE / 1.95 * 200;
							break;
						case "22017":
							msg.label = "pH";
							msg.MODELE.MODELE = "22017 pH-mètre";
							msg.unit = "";
							msg.payload = voltage / 2 * 14;
							msg.precision = PRECISION_VOLTAGE / 2 * 14;
							break;
						case "22018":
							msg.MODELE.MODELE = "22018 Oxymètre";
							switch (node.device_mode){
								case "MesureP":
									msg.label = "%O2";
									msg.unit = "%";
									msg.payload = voltage / 2 * 100;
									msg.precision = PRECISION_VOLTAGE / 2 * 100;
									break;
								case "MesureV":
									msg.label = "Concentration O2";
									msg.unit = "mg/L";
									msg.payload = voltage / 2 * 45;
									msg.precision = PRECISION_VOLTAGE / 2 * 45;
									break;
								case "Consommation":
									msg.label = "Consommation";
									msg.unit = "%";
									msg.payload = voltage / 2 * 100;
									msg.precision = PRECISION_VOLTAGE / 2 * 100;
									break;
								case "Production":
									msg.label = "Production";
									msg.unit = "%";
									msg.payload = voltage / 2 * 200;
									msg.precision = PRECISION_VOLTAGE / 2 * 200;
									break;
								}
							break;
						case "22020":
							msg.MODELE.MODELE = "22020 Colormètre";
							switch (node.device_mode){
								case "Transmittance":
									msg.label = "Transmittance";
									msg.unit = "%";
									msg.payload = voltage / 2 * 100;
									msg.precision = PRECISION_VOLTAGE / 2 * 100;
									break;
								case "Absorbance":
									msg.label = "Absorbance";
									msg.unit = "";
									msg.payload = voltage / 2 * 3;
									msg.precision = PRECISION_VOLTAGE / 2 * 3;
									break;
								}
							break;
						case "22022":
							msg.MODELE.MODELE = "22022 Wattmètre";
							switch (node.device_mode){
								case "Vdc":
									msg.label = "Tension (DC)";
									msg.unit = "V";
									msg.payload = voltage / 2 * 120 - 60;
									msg.precision = PRECISION_VOLTAGE / 2 * 120;
									break;
								case "Vac":
									msg.label = "Tension (AC)";
									msg.unit = "V";
									msg.payload = voltage / 2 * 30;
									msg.precision = PRECISION_VOLTAGE / 2 * 30;
									break;
								case "Idc":
									msg.label = "Intensité (DC)";
									msg.unit = "A";
									msg.payload = volatage / 2 * 10 -5;
									msg.precision = PRECISION_VOLTAGE / 2 * 10;
									break;
								case "Iac":
									msg.label = "Intensité (AC)";
									msg.unit = "A";
									msg.payload = voltage / 2 * 5;
									msg.precision = PRECISION_VOLTAGE / 2 * 5;
									break;
								case "Pdc":
									msg.label = "Puissance (DC)";
									msg.unit = "W";
									msg.payload = voltage / 2 * 350;
									msg.precision = PRECISION_VOLTAGE / 2 * 350;
									break;
								case "Pac":
									msg.label = "Puissance (AC)";
									msg.unit = "W";
									msg.payload = voltage / 2 * 200;
									msg.precision = PRECISION_VOLTAGE / 2 * 200;
									break;
								case "Joule":
									msg.label = "Energie";
									msg.unit = "J";
									msg.payload = voltage / 2 * 9500;
									msg.precision = PRECISION_VOLTAGE / 2 * 9500;
									break;
								}
							break;
						case "22023":
							msg.label = "Champ magnétique";
							msg.MODELE.MODELE = "22023 Teslamètre";
							msg.unit = "mT";
							msg.payload = voltage / 2 * 200 -100;
							msg.precision = PRECISION_VOLTAGE / 2 * 200;
							break;
						case "22027":
							msg.label = "Température";
							msg.MODELE.MODELE = "22027 Thermomètre";
							msg.unit = "°C";
							msg.payload = voltage / 2 * 230 - 50;
							msg.precision = PRECISION_VOLTAGE / 2 * 230;
							break;
						case "22029":
							msg.label = "Temps (chrono)";
							msg.MODELE.MODELE = "22029 Chronomètre";
							msg.unit = "s";
							switch (node.device_mode){
								case "Chrono_1000":
									msg.payload = voltage / 2 * 9.999;
									msg.precision = PRECISION_VOLTAGE / 2 * 9.999;
									break;
								case "Chrono_100":
									msg.payload = voltage / 2 * 99.99;
									msg.precision = PRECISION_VOLTAGE / 2 * 99.99;
									break;
								case "Chrono_10":
									msg.payload = voltage / 2 * 999.9;
									msg.precision = PRECISION_VOLTAGE / 2 * 999.9
									break;
								case "Chrono_1":
									msg.payload = voltage / 2 * 9999;
									msg.precision = PRECISION_VOLTAGE / 2 * 9999;
									break;
								case "Compteur":
									msg.label = "Compteur";
									msg.unit = "";
									msg.payload = voltage / 2 * 1999;
									msg.precision = PRECISION_VOLTAGE / 2 * 1999;
									break;
								}
							break;
						case "22030":
							msg.MODELE.MODELE = "22030 Voltmetre";
							msg.unit = "V";
							switch (node.device_mode){
								case "Vdc":
									msg.label = "Vdc";
									msg.payload = voltage / 2 * 200 - 100;
									msg.precision = PRECISION_VOLTAGE / 2 * 200;
									break;
								case "Vac":
									msg.label = "Vac";
									msg.payload = voltage / 2 * 100;
									msg.precision = PRECISION_VOLTAGE / 2 * 100;
									break;
								case "Vacdc":
									msg.label = "Vacdc";
									msg.payload = voltage / 2 * 100;
									msg.precision = PRECISION_VOLTAGE / 2 * 100;
									break;
								case "Vmax":
									msg.label = "Vmax";
									msg.payload = voltage / 2 * 280 - 140;
									msg.precision = PRECISION_VOLTAGE / 2 * 280;
									break;
								case "Vmin":
									msg.label = "Vmin";
									msg.payload = voltage / 2 * 280 - 140;
									msg.precision = PRECISION_VOLTAGE / 2 * 280;
									break;
								case "Vpp":
									msg.label = "Vpp";
									msg.payload = voltage / 2 * 280;
									msg.precision = PRECISION_VOLTAGE / 2 * 280
									break;										
								}
							break;
						case "22031":
							msg.MODELE.MODELE = "22031 Ampèremètre";
							msg.unit = "A";
							switch (node.device_mode){
								case "Idc20":
									msg.label = "Idc";
									msg.payload = voltage / 2 * 40 - 20;
									msg.precision = PRECISION_VOLTAGE / 2 * 40;
									break;
								case "Idc2":
									msg.label = "Idc";
									msg.payload = voltage / 2 * 4 - 2;
									msg.precision = PRECISION_VOLTAGE / 2 * 4;
									break;
								case "Iac20":
									msg.label = "Iac";
									msg.payload = voltage / 2 * 20;
									msg.precision = PRECISION_VOLTAGE / 2 * 20;
									break;
								case "Iac2":
									msg.label = "Iac";
									msg.payload = voltage / 2 * 2;
									msg.precision = PRECISION_VOLTAGE;
									break;
								}
							break;
						case "22032":
							msg.label = "Pression";
							msg.MODELE.MODELE = "22032 Manomètre";
							msg.unit = "hPa";
							switch (node.device_mode){
								case "P20":
									msg.payload = voltage / 2 * 40 - 20;
									msg.precision = PRECISION_VOLTAGE / 2 * 40;
									break;
								case "P200":
									msg.payload = voltage / 2 * 400 - 200;
									msg.precision = PRECISION_VOLTAGE / 2 * 400;
									break;
								}
							break;
						case "22033":
							msg.label = "Luminosité";
							msg.MODELE.MODELE = "22033 Luxmètre";
							msg.unit = "lux";
							msg.payload = voltage / 2 * 20000;
							msg.precision = PRECISION_VOLTAGE / 2 * 20000;
							break;
					}
					if (msg.precision){
						if (msg.precision > 0.6){
							msg.precision = 1;
						}else if(msg.precision > 0.2){
							msg.precision = 0.5;
						}else if (msg.precision > 0.06){
							msg.precision = 0.1;
						}else if (msg.precision > 0.02){
							msg.precision = 0.05;
						} else{
							msg.precision = 0.01;
						}
						msg.payload = Math.floor(msg.payload / msg.precision + 0.5)*msg.precision;
					}
					if (voltage>voltage_max){
						node.status({fill:"red",shape:"dot",text:msg.label+" ALERTE"});
						msg.payload = 999;
					}else{	
						msg.DATAS[index] = {};						
						msg.DATAS[index][msg.label.toLowerCase()]=msg.payload;
						msg.DATAS[index].unit=msg.unit;
						node.status({fill:"green",shape:"dot",text:msg.label + " :"+ msg.payload.toFixed(1) + msg.unit});
						msg.topic = node.topic || "PIERRON/"+msg.label;
						node.send(msg);
					}
				}
			})	
		})
	}
    RED.nodes.registerType("Pierron Mesura2", pianode_mesura2);
}
