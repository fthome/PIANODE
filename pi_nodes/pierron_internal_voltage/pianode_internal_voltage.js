module.exports = function(RED) {

    const MCP3201 = require('./lib/mcp3201.js');
	const VREF = 5; // Volts
	const DIVIDER = 2.36; // Voltage divider 
	const SPI_BUS = "/dev/spidev0.0";
	
    function pianode_internal_voltage(config) {
        RED.nodes.createNode(this, config);
		this.device = config.device;
		this.device_mode = config.device_mode
		this.unit = config.unit;
        this.timer = config.timer * 1000; // user input is in seconds, this is conversion to miliseconds
		this.no_change_timer = config.no_change_timer * 1000; // user input is in seconds, this is conversion to miliseconds
		this.precision = config.precision;
		this.topic = config.topic;
		this.name = config.name;
		
		
        var node = this;
		
		
		node.voltage = 0;
		node.last_time_value_change = new Date();

		// init the device
		node.status({fill:"grey",shape:"ring",text:"Init..."});
		node.log("Initializing Internal mcp3201 on " + SPI_BUS);
		node.mcp3201=new MCP3201(SPI_BUS);
		node.status({fill:"green",shape:"dot",text:node.type+" Initialized!"});
		node.mcp3201.read(function(value){
		  node.status({fill:"green",shape:"dot",text:node.type+" Initialized!"});
		  node.log("Internal MCP3201 Ok");
		})
		
		
		
        var readSensor = function() {
			node.mcp3201.read(function(value){
				//var context = this.context();
				var voltage = value / 4096 * VREF * DIVIDER;
				var precision = node.precision * VREF;
				if (voltage > VREF) voltage = VREF;
				var now = new Date();
				if ((Math.abs(voltage - node.voltage) > precision) || ((now - node.last_time_value_change) > node.no_change_timer) || (voltage==VREF)){
					node.voltage = voltage;
					node.last_time_value_change = now;
					var msg = {};

					if (voltage==VREF){
						node.status({fill:"red",shape:"dot",text:node.type+" V:ALERTE"});
						msg.payload = 999;
					}else{
						node.status({fill:"green",shape:"dot",text:node.type+" V:"+voltage.toFixed(1)});
						switch (node.device){
							case "None":
								msg.unit = "V";
								msg.payload = voltage;
								break;
							case "22013":
								msg.label = "Conductivité";
								msg.device = "22013 Conductimètre";
								msg.unit = "mS/cm";
								msg.payload = voltage / 1.95 * 200;
								break;
							case "22016":
								msg.label = "Conductivité";
								msg.device = "22016 Conductimètre";
								msg.unit = "mS/cm";
								msg.payload = voltage / 1.95 * 200;
								break;
							case "22017":
								msg.label = "pH";
								msg.device = "22017 pH-mètre";
								msg.unit = "";
								msg.payload = voltage / 2 * 14;
								break;
							case "22018":
								msg.device = "22018 Oxymètre";
								switch (node.device_mode){
									case "MesureP":
										msg.label = "%O2";
										msg.unit = "%";
										msg.payload = voltage / 2 * 100;
										break;
									case "MesureV":
										msg.label = "Concentration O2";
										msg.unit = "mg/L";
										msg.payload = voltage / 2 * 45;
										break;
									case "Consommation":
										msg.label = "Consommation";
										msg.unit = "%";
										msg.payload = voltage / 2 * 100;
										break;
									case "Production":
										msg.label = "Production";
										msg.unit = "%";
										msg.payload = voltage / 2 * 200;
										break;
								}
							case "22020":
								msg.device = "22020 Colormètre";
								switch (node.device_mode){
									case "Transmittance":
										msg.label = "Transmittance";
										msg.unit = "%";
										msg.payload = voltage / 2 * 100;
										break;
									case "Absorbance":
										msg.label = "Absorbance";
										msg.unit = "";
										msg.payload = voltage / 2 * 3;
										break;
							case "22022":
								msg.device = "22022 Wattmètre";
								switch (node.device_mode){
									case "Vdc":
										msg.label = "Tension (DC)";
										msg.unit = "V";
										msg.payload = voltage / 2 * 120 - 60;
										break;
									case "Vac":
										msg.label = "Tension (AC)";
										msg.unit = "V";
										msg.payload = voltage / 2 * 30;
										break;
									case "Idc":
										msg.label = "Intensité (DC)";
										msg.unit = "A";
										msg.payload = volatage / 2 * 10 -5;
										break;
									case "Iac":
										msg.label = "Intensité (AC)";
										msg.unit = "A";
										msg.payload = voltage / 2 * 5;
										break;
									case "Pdc":
										msg.label = "Puissance (DC)";
										msg.unit = "W";
										msg.payload = voltage / 2 * 350;
										break;
									case "Pac":
										msg.label = "Puissance (AC)";
										msg.unit = "W";
										msg.payload = voltage / 2 * 200;
										break;
									case "Joule":
										msg.label = "Energie";
										msg.unit = "J";
										msg.payload = voltage / 2 * 9500;
										break;
									}
							case "":
								msg.label = "";
								msg.device = "";
								msg.unit = "";
								msg.payload = ;
								break;
							case "":
								msg.label = "";
								msg.device = "";
								msg.unit = "";
								msg.payload = ;
								break;
							case "":
								msg.label = "";
								msg.device = "";
								msg.unit = "";
								msg.payload = ;
								break;
							case "":
								msg.label = "";
								msg.device = "";
								msg.unit = "";
								msg.payload = ;
								break;
							case "":
								msg.label = "";
								msg.device = "";
								msg.unit = "";
								msg.payload = ;
								break;
							case "":
								msg.label = "";
								msg.device = "";
								msg.unit = "";
								msg.payload = ;
								break;
						}
						msg.payload = voltage;
					}
					if (node.topic) {
						msg.topic = node.topic;
					}
					if (node.unit) {
						msg.unit = node.unit;
					}
					node.send(msg);
				}
			})
        }

        node.tout = setInterval(readSensor, node.timer);

        this.on("close", function() {
            clearInterval(this.tout);
        });
    }

    RED.nodes.registerType("Tension Douilles", pianode_internal_voltage);

}
