module.exports = function(RED) {

    const MCP3201 = require('./lib/mcp3201.js');
	const VREF = 5; // Volts
	const DIVIDER = 2.36; // Voltage divider 
	const SPI_BUS = "/dev/spidev0.0";
	
    function pianode_internal_voltage(config) {
        RED.nodes.createNode(this, config);
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
				if (voltage > VREF) voltage = VREF;
				var now = new Date();
				if ((Math.abs(voltage - node.voltage) > node.precision) || ((now - node.last_time_value_change) > node.no_change_timer) || (voltage==VREF)){
					node.voltage = voltage;
					node.last_time_value_change = now;
					var msg = {};
					if (node.topic) {
						msg.topic = node.topic;
					}
					if (voltage==VREF){
						node.status({fill:"red",shape:"dot",text:node.type+" V:ALERTE"});
						msg.payload = 999;
					}else{
						node.status({fill:"green",shape:"dot",text:node.type+" V:"+voltage.toFixed(1)});
						msg.payload = voltage;
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
