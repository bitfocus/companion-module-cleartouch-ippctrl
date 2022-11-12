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

		// this.actions() // export actions
		// this.variables()
		// this.initPresets()
		this.status(this.STATUS_WARNING, 'Connecting')
		this.isReady = false
		this.vardefs = []
        this.createConnection()
	}

    createConnection() {
        if(this.config.host && this.config.port) {
            this.conn = new telnet(this.config.host, this.config.port, {reconnect_interval: this.config.reconnectTime, reconnect: this.config.autoreconnect})
            this.conn.on('connect', (status, message) => {
                this.isReady = true
                this.checkConnection()
                this.status(this.STATUS_OK, 'Connected')
            });
            this.conn.on('error', (status, message) => {
                this.isReady = true
                this.checkConnection()
                this.status(this.STATUS_ERROR, 'An connection error occured')
            });
        }
    }

	checkConnection() {
		 ;
	}

	updateVariables() {
		;
	}

	variables() {
		const tThis = this
		try {
			const variables = []

			variables.push({
				name: 'amount_sounds_currently_playing',
				label: 'Songs currently playing',
			})
			this.setVariableDefinitions(variables)
			variables.forEach(function handleList(item) {
				tThis.setVariable(item.name, '0')
			})
			this.vardefs = variables
			// this.setVariable('amount_sounds_currently_playing', '0')
		} catch (error) {
			console.error(error)
		}

	}

	async actions() {
		const optis = await this.retrieveSound()
		this.setActions({
			backlight: {
				label: 'Backlight control',
                options: [
                        {
                            type: 'bool',
                            label: 'Powerstate',
                            id: 'powerstate',
                            required: true,
                            tooltip: 'Weather to turn on or off the backlight',
                        }
                    ]
			},
            power: {
				label: 'Power control',
                options: [
                        {
                            type: 'bool',
                            label: 'Powerstate',
                            id: 'powerstate',
                            required: true,
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
                            id: 'bright',
                            required: true,
							min: 0,
							max: 100,
                            tooltip: 'The brightness of the backlight',
                        }
                    ]
			},
		})
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
				type: 'bool',
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
		const tTemp = this
		if (this.isReady) {
			if (action.action == 'backlight') {
				if(action.options.powerstate) {
                    this.conn.write(":01S0000")
                } else {
                    this.conn.write(":01S0001")
                }
				return
			} else if(action.action == 'power') {
                if(action.options.powerstate) {
                    this.conn.write(":01S0002")
                } else {
                    this.conn.write(":01S0003")
                }
                return
            } else if(action.action == 'brightness') {
				this.conn.write(":01S5" + String(action.options.bright).padStart(3, '0')) // make sure that the value is 3 digits long
				return
			}
		}
	}

	destroy() {
		this.conn.destroy()
		this.debug('destroy')
	}
}
exports = module.exports = instance
