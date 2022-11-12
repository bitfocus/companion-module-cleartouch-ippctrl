const instance_skel = require('../../instance_skel')
const telnet = require('../../telnet')

class instance extends instance_skel {
	/**
	 * Create an instance of the module
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */

	constructor(system, id, config) {
		super(system, id, config)
	}

	init() {
		const tThis = this

		this.actions() // export actions
		// this.initPresets()
		this.status(this.STATUS_WARNING, 'Connecting')
		this.isReady = false
		this.createConnection()
	}

	createConnection() {
		if (this.config.host && this.config.port) {
			this.conn = new telnet(this.config.host, this.config.port, { reconnect_interval: this.config.reconnectTime, reconnect: this.config.autoreconnect })
			this.conn.on('connect', (status, message) => {
				this.isReady = true
				this.checkConnection()
				this.status(this.STATUS_OK, 'Connected')
			});
			this.conn.on('error', (status, message) => {
				this.isReady = true
				this.checkConnection()
				this.status(this.STATUS_ERROR, 'An connection error occured')
				console.error('Connection error: ' + message)
			});
		}
	}

	checkConnection() {
		;
	}

	async actions() {
		this.setActions({
			backlight: {
				label: 'Backlight control',
				options: [
					{
						type: 'checkbox',
						label: 'Powerstate',
						id: 'state',
						required: true,
						default: true,
						tooltip: 'Weather to turn on or off the backlight',
					}
				]
			},
			power: {
				label: 'Power control',
				options: [
					{
						type: 'checkbox',
						label: 'Powerstate',
						id: 'state',
						required: true,
						default: true,
						tooltip: 'Weather to turn on or off the device',
					}
				]
			},
			brightness: {
				label: 'Brightness control',
				options: [
					{
						type: 'number',
						label: 'Brightness',
						id: 'value',
						required: true,
						min: 0,
						max: 100,
						step: 1.0,
						tooltip: 'The brightness of the backlight',
					}
				]
			},
			treble: {
				label: 'Treble control',
				options: [
					{
						type: 'number',
						label: 'Treble',
						id: 'value',
						required: true,
						min: 0,
						max: 100,
						step: 1.0,
						tooltip: 'The treble of the sound',
					}
				]
			},
			bass: {
				label: 'Bass control',
				options: [
					{
						type: 'number',
						label: 'Bass',
						id: 'value',
						required: true,
						min: 0,
						max: 100,
						step: 1.0,
						tooltip: 'The bass of the sound',
					}
				]
			},
			balance: {
				label: 'Balance control',
				options: [
					{
						type: 'number',
						label: 'Balance',
						id: 'value',
						required: true,
						min: 0,
						max: 100,
						step: 1.0,
						tooltip: 'The balance of the sound',
					}
				]
			},
			contrast: {
				label: 'Contrast control',
				options: [
					{
						type: 'number',
						label: 'Contrast',
						id: 'value',
						required: true,
						min: 0,
						max: 100,
						step: 1.0,
						tooltip: 'Image contrast',
					}
				]
			},
			sharpness: {
				label: 'Sharpness control',
				options: [
					{
						type: 'number',
						label: 'Sharpness',
						id: 'value',
						required: true,
						min: 0,
						max: 100,
						step: 1.0,
						tooltip: 'Image Sharpness',
					}
				]
			},
		})
		this.debug("Updated actions")
	}

	initPresets() {
		var presets = []

		this.setPresetDefinitions(presets)
	}

	config_fields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				regex: this.REGEX_IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				default: 4449,
				regex: this.REGEX_PORT,
			},
			{
				type: 'number',
				id: 'reconnectTime',
				label: 'Reconnect interval',
				width: 4,
				default: 1000,
			},
			{
				type: 'checkbox',
				id: 'autoreconnect',
				label: 'Auto reconnect',
			}
		]
	}

	updateConfig(config) {
		tThis = this
		this.config = config
		const tThis = this
		this.isReady = false
		this.status(this.STATUS_WARNING, 'Connecting')
		this.conn.destroy()
		this.createConnection()
	}

	action(action) {
		console.log("TESTING!")
		try {
			console.warn("Running action")

			const commandLookup = {
				'backlight': {
					'type': 0, // 0-> boolean, 1-> number (brightness, etc.), 2-> select (mode, etc.)
					'states': {
						true: ':01S0001',
						false: ':01S0000'
					}
				},
				'power': {
					'type': 0, // 0-> boolean, 1-> number (brightness, etc.), 2-> select (mode, etc.)
					'states': {
						true: ':01S0003',
						false: ':01S0002'
					}
				},
				'brightness': {
					'type': 1, // 0-> boolean, 1-> number (brightness, etc.), 2-> select (mode, etc.)
					'baseMessage': ':01S5'
				},
				'treble': {
					'type': 1, // 0-> boolean, 1-> number (brightness, etc.), 2-> select (mode, etc.)
					'baseMessage': ':01S1'
				},
				'bass': {
					'type': 1, // 0-> boolean, 1-> number (brightness, etc.), 2-> select (mode, etc.)
					'baseMessage': ':01S2'
				},
				'balance': {
					'type': 1, // 0-> boolean, 1-> number (brightness, etc.), 2-> select (mode, etc.)
					'baseMessage': ':01S3'
				},
				'contrast': {
					'type': 1, // 0-> boolean, 1-> number (brightness, etc.), 2-> select (mode, etc.)
					'baseMessage': ':01S4'
				},
				'sharpness': {
					'type': 1, // 0-> boolean, 1-> number (brightness, etc.), 2-> select (mode, etc.)
					'baseMessage': ':01S6'
				}
			}


			const actionData = commandLookup[String(action.action)]
			let dataToWrite = "";
			if (actionData.type == 0) {
				dataToWrite = actionData.states[action.options.state]
			} else if (actionData.type == 1) {
				dataToWrite = actionData.baseMessage + String(action.options.value).padStart(3, '0')
			} else if (actionData.type == 2) {
				dataToWrite = actionData.baseMessage + String(action.options.value)
			}
			console.warn("!!!!!!!!!!!!!!!!!!!!!!!" + dataToWrite)
			console.warn(actionData)

			if (this.isReady) {
				this.conn.write(dataToWrite)
			}
		} catch (error) {
			console.warn("Error running action")
			console.warn(error)
		}
	}



	/*if (this.isReady) {
		if (action.action == 'backlight') {
			if(action.options.powerstate) {
				this.conn.write(":01S0001")
			} else {
				this.conn.write(":01S0000")
			}
			return
		} else if(action.action == 'power') {
			if(action.options.powerstate) {
				this.conn.write(":01S0003")
			} else {
				this.conn.write(":01S0002")
			}
			return
		} else if(action.action == 'brightness') {
			this.conn.write(":01S5" + String(action.options.bright).padStart(3, '0')) // make sure that the value is 3 digits long
			return
		} else if(action.action == 'treble') {
			this.conn.write(":01S1" + String(action.options.bright).padStart(3, '0')) // make sure that the value is 3 digits long
			return
		} else if(action.action == 'bass') {
			this.conn.write(":01S2" + String(action.options.bright).padStart(3, '0')) // make sure that the value is 3 digits long
			return
		} else if(action.action == 'balance') {
			this.conn.write(":01S3" + String(action.options.bright).padStart(3, '0')) // make sure that the value is 3 digits long
			return
		} else if(action.action == 'contrast') {
			this.conn.write(":01S4" + String(action.options.bright).padStart(3, '0')) // make sure that the value is 3 digits long
			return
		}
	}*/


	destroy() {
		this.conn.destroy()
		this.debug('destroy')
	}
}
exports = module.exports = instance
