const { Server } = require('socket.io');
const ss = require('socket.io-stream');
const stream = ss.createStream();
const User = require('../Model/userModel/User');
const socketServer = {
	init: function(server) {
		this.io = new Server(server, {
			maxHttpBufferSize: 1e8, //100MB
			pingInterval: 25000,
			pingTimeout: 60000,
			cors: {
				origin: "*"
			}
		});
		this.devices = {};
		this.space = {};
		this.users = {};
		this.deleteFile = {};
		this.io.on('connection', socket => { 
			socket.on('webConnect', (data) => { //for testing in web browser
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
				console.log(this.deleteFile)
				socket.user_id = data.user_id;
				this.users[data.user_id] = {id: socket.id, state: 'online', update: Date.now(), device: 'mobile'};
				User.findOneAndUpdate({_id: data.user_id}, {is_online: true}).then(user => {
					socket.emit('joined', {users: this.users, devices: this.devices, user_id: data.user_id});
					socket.broadcast.emit('newUser', this.users[data.user_id]);
				})
				if (this.deleteFile[data.user_id]) {
					this.io.to(this.users[data.user_id]['id']).emit('deleteFile', {list: this.deleteFile[data.user_id]})
					delete this.deleteFile[data.user_id];
				}
			})
		    socket.on('offer', (data) => {
		        console.log('offer: ', data.from, '->', data.to)
		    	if (this.users[data.to]) {
			        this.io.to(this.users[data.to]['id']).emit('offer', {offer: data.offer, from: data.from, reqdata: data.reqdata})
		    	} else {
		    		socket.emit('offline', {to: data.to})
		    	}
		    })

		    socket.on('answer', (data) => {
		        console.log('answer', data.from, '->', data.to)
		    	if (this.users[data.to]) {
			        this.io.to(this.users[data.to]['id']).emit('answer', {answer: data.answer, from: data.from})
		    	}
		    })
		    socket.on('icecandidate', (data) => {
		        console.log('answer', data.from, '->', data.to, "isOffer -> ", data.isOffer)
		    	if (this.users[data.to]) {
			        this.io.to(this.users[data.to]['id']).emit('icecandidate', {candidate: data.candidate, from: data.from, isOffer: data.isOffer})
		    	}
		    })
		    socket.on('recreateOffer', (data) => {
		    	console.log(data)
				socket.emit('recreateOfferAnswer', {filename: data.filename});
		    });
		    socket.on('traffic', (data) => {
		    	console.log(data)
		    	for (let sub in data) {
		    		Users.findOneAndUpdate({_id: sub}, {$inc: {traffic: data[sub]}}).then(res => {
		    			console.log(res.traffic);
		    		})
		    	}
		    });

		    socket.on('disconnect', (err)=>{
		    	console.log('disconnect', err)
		    	if (this.users[socket.user_id]) {
					User.findOneAndUpdate({_id: socket.user_id}, {is_online: false}).then(user => {
				    	this.users[socket.user_id]['state'] = 'offline';
				    	this.users[socket.user_id]['update'] = Date.now();
					})
		    	}
		    })
		    socket.on('logout', ()=>{
		    	console.log('logout', socket.user_id)
		    	if (this.users[socket.user_id]) {
					User.findOneAndUpdate({_id: socket.user_id}, {is_online: false}).then(user => {
				    	this.users[socket.user_id]['state'] = 'offline';
				    	this.users[socket.user_id]['update'] = Date.now();
					})
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
	sendFragment: function(fragments, user_id) {
		console.log(this.users, user_id);
		let totalSpace = {};
		for (var i = 0; i < fragments.length; i++) {
			const filename = fragments[i]['fragmentID']+"_"+fragments[i]['fileName']+"_"+fragments[i]['user_id']
			for (var j = 0; j < fragments[i]['devices'].length; j++) {
				console.log(fragments[i]['devices'][j]['device_id'])
				if (this.users[fragments[i]['devices'][j]['device_id']]['id']) {
					this.io.to(this.users[fragments[i]['devices'][j]['device_id']]['id']).emit('sendingData', fragments[i])
					if (totalSpace[fragments[i]['devices'][j]['device_id']]) totalSpace[fragments[i]['devices'][j]['device_id']] += fragments[i]['fragment'].length;
					else totalSpace[fragments[i]['devices'][j]['device_id']] = fragments[i]['fragment'].length;
				}
			}
		}
		return totalSpace;
	},
	getDevices: function() {
		const devices = [];
		console.log(this.users)
		for (let key in this.users) {
			if (this.users[key]['state'] === 'online') {
				devices.push({_id: key})
			}
		}
		return devices;
	},
	deleteFileFromDevices: function(obj) {
		for (let id in obj) {
			if (this.users[id]?.state === 'online') {
				this.io.to(this.users[id]['id']).emit('deleteFile', {list: obj[id]})
			} else {
				if (this.deleteFile[id]) {
					this.deleteFile[id] = [...this.deleteFile[id], ...obj[id]];
				} else {
					this.deleteFile[id] = obj[id];
				}
			}
		}
	},
	sendDeleteOffer: function(data) {
		if (this.users[data['user_id']]?.state === 'online') {
			this.io.to(this.users[data['user_id']]['id']).emit('deleteOffer', data);
			return true;
		} else {
			return false;
		}
	},
	sendMoreSpaceOffer: function(user_id, fullRate) {
		if (this.users[user_id]?.state === 'online') {
			this.io.to(this.users[user_id]['id']).emit('moreSpaceOffer', {full: fullRate});
			return true;
		} else {
			return false;
		}
	}
}

const users={}


module.exports = socketServer;
