module.exports = function(RED) {

    const MCP3201 = require('./lib/mcp3201.js');
	const VREF = 5; // Volts
	const DIVIDER = 2.36; // Voltage divider 
	const SPI_BUS = "/dev/spidev0.0";
	const MODELE = "33000" // Ref PIANODE
	
    function pianode_internal_voltage(config) {
        RED.nodes.createNode(this, config);
		this.unit = config.unit;
        this.timer = config.timer * 1000; // user input is in seconds, this is conversion to miliseconds
		this.no_change_timer = config.no_change_timer * 1000; // user input is in seconds, this is conversion to miliseconds
		this.precision = config.precision / 100;
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
					var msg = {DATAS:{}, MODELE:{ID:"local", MODELE:MODELE}};

					if (voltage==VREF){
						node.status({fill:"red",shape:"dot",text:node.type+" V:ALERTE"});
						voltage = 999;
					}else{
						node.status({fill:"green",shape:"dot",text:node.type+" :"+voltage.toFixed(1)+" V"});
					}
					msg.DATAS= {tension:voltage, unit:node.unit || "V"};
					msg.payload = voltage;
					msg.unit = node.unit || 'V';
					if (node.topic) {
						msg.topic = node.topic;
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

    RED.nodes.registerType("Tension Douilles Local", pianode_internal_voltage);

}
