const { Server } = require('socket.io');
const socketServer = {
	init: function(server) {
		this.io = new Server(server, {
			maxHttpBufferSize: 1e8, //100MB
			cors: {
				origin: "*"
			}
		});
		this.devices = {};
		this.users = {};
		this.io.on('connection', socket => { 
			socket.on('webConnect', (data) => {
				let randomId = this.getRandomId();
				if (data.user_id) {
					randomId = data.user_id;
				}
				console.log("new web device connected.. ", randomId)
				socket.user_id = randomId;
				this.users[randomId] = {id: socket.id, state: 'online', update: Date.now(), device: 'web'};
				socket.emit('joined', {users: this.users, devices: this.devices, user_id: randomId});
				socket.broadcast.emit('newUser', this.users[randomId]);
			})
			socket.on('joinUser', (data) => {
				console.log("new mobile device connected.. ", data.user_id)
				// if (this.users[data.user_id] && this.users[data.user_id].state === 'online') {
				// 	socket.emit('reconnect', this.users[data.user_id])
				// } else {
					socket.user_id = data.user_id;
					this.users[data.user_id] = {id: socket.id, state: 'online', update: Date.now(), device: 'mobile'};
					socket.emit('joined', {users: this.users, devices: this.devices, user_id: data.user_id});
					socket.broadcast.emit('newUser', this.users[data.user_id]);
				// }
			})
			socket.on('startStorage', (data) => {
		    	// device_id = data.device_id;
		    	// socket.device_id = device_id;
		    	console.log(data);
		    	// this.devices[device_id] = {id: socket.id, state: 'online', update: Date.now()};
		    	// socket.emit('startedStorage', device_id)
		    	// this.io.sockets.emit('newDevice', device_id)
		    })
		    socket.on('offer', (data) => {
		        // console.log('offer: ', data.from, '->', data.to, this.users[data.to])
		    	if (this.users[data.to]) {
			        this.io.to(this.users[data.to]['id']).emit('offer', {offer: data.offer, from: data.from, reqdata: data.reqdata})
		    	}
		    })

		    socket.on('answer', (data) => {
		        // console.log('answer', data.from, '->', data.to)
		    	if (this.users[data.to]) {
			        this.io.to(this.users[data.to]['id']).emit('answer', {answer: data.answer, from: data.from})
		    	}
		    })
		    socket.on('icecandidate', (data) => {
		    	// console.log('icecandidate', data);
		    	if (this.users[data.to]) {
			        this.io.to(this.users[data.to]['id']).emit('icecandidate', {candidate: data.candidate, from: data.from, isOffer: data.isOffer})
		    	}
		    })
		    socket.on('disconnect', (err)=>{
		    	console.log('disconnect', err)
		    	if (this.users[socket.user_id]) {
			    	// delete this.users[socket.user_id]
			    	this.users[socket.user_id]['state'] = 'offline';
			    	this.users[socket.user_id]['update'] = Date.now();
		    	}
		    })
		    socket.on('reconnect', () => {
		    	console.log('reconnect')
		    })
		    socket.on('close', (data)=>{
		    	console.log('close')
		        this.io.to(this.users[data.to]['id']).emit('close')
		    })
		    socket.on('rejected', (data)=>{
		    	console.log('rejected')
		        this.io.to(this.users[data.to]['id']).emit('rejected')
		    })
		})
	},
	sendFragment: function(fragments) {
		console.log(fragments.length);
		for (var i = 0; i < fragments.length; i++) {
			const filename = fragments[i]['fragmentID']+"_"+fragments[i]['fileName']+"_"+fragments[i]['user_id']
			// console.log(filename, this.users[fragments[i]['devices'][0]['device_id']]['id'])
			this.io.to(this.users[fragments[i]['devices'][0]['device_id']]['id']).emit('sendingData', fragments[i])
		}
		return true;
		//TO DO
		//send fragment to each device.
	},
	getDevices: function() {
		const devices = [];
		console.log(this.users)
		for (const key in this.users) {
			if (this.users[key]['state'] === 'online') {
				devices.push({_id: key})
			}
		}
		return devices;
	},
	checkDevice: function(devices) {
		console.log(devices);
		//TO DO 
		//check device is online or not
		return devices;
	},
	getRandomId: function() {
		return Math.random().toString(36).substring(2,7);
	}

}

const users={}


module.exports = socketServer;