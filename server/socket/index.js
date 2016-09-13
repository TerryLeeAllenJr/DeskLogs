/**
 * This module establishes the socket.io connection and manages all requests.
 * @param server
 */

module.exports = function(server){

    var io = require('socket.io').listen(server);
    var redis = require('redis');
    var logger = require('../logger');
    var UsersModule = require('../modules/users');
    var publisher  = redis.createClient(),
        subscriber = redis.createClient(),
        redisClient  = redis.createClient();


    /* Global socket connectoins. */
    io.on('connection',function(socket){
        var userState = {};


        /**
         * Subscription handling. Used to pass data from elsewhere in the backend.
         */
        subscriber.on("message",function(channel,message){
            message = JSON.parse(message);
            if(channel === 'socket::emit'){
                socket.emit(message.msg,message.data)
            }
            if(channel === 'socket::broadcast'){
                io.emit(message.msg,message.data);
            }
        });

        /**
         * Sets the userState object when a user logs in.
         * Adds the user to the Online Users redis set.
         * Broadcasts the "updateOnlineUsers" message over socket.io.
         */
        socket.on('setUserOnline',function(sso){
            userState.sso = sso;
            UsersModule.addOnlineUser(sso)
                .then(function(){ return UsersModule.getOnlineUsers(); })
                .then(function(users){
                    io.emit('updateOnlineUsers',users)
                })
                .catch(function(err){ logger.error(err); });
        });

        socket.on('setUserOffline',function(sso){
            UsersModule.removeOnlineUser(sso)
                .then(function(){ return UsersModule.getOnlineUsers();})
                .then(function(users){
                    io.emit('updateOnlineUsers',users); })
                .catch(function(err) { logger.error(err); });
        });

        socket.on('setJWT',function(jwtData){ userState.jwt = jwtData; });

        /**
         * Used to lock and unlock lists and logs when a user begins editing. Provides collision avoidance.
         */
        socket.on('lockLogEntry',function(selectedLog){ io.emit('lockLogEntry',selectedLog); });
        socket.on('unlockLogEntry',function(selectedLog){ io.emit('unlockLogEntry',selectedLog); });
        socket.on('lockListEntry',function(list){ io.emit('lockListEntry',list); });
        socket.on('unlockListEntry',function(list){ io.emit('unlockListEntry',list); });

        socket.on('disconnect',function(){
            subscriber.unsubscribe("socket::emit");
            subscriber.unsubscribe("socket::broadcast");
            if(userState.hasOwnProperty('sso')){
                UsersModule.removeOnlineUser(userState.sso)
                    .then(function(){ return UsersModule.getOnlineUsers();})
                    .then(function(users){
                        io.emit('updateOnlineUsers',users); })
                    .catch(function(err) { logger.error(err); });
            }
            userState = {};
        });
        subscriber.subscribe("socket::emit");
        subscriber.subscribe("socket::broadcast");
    });
};

