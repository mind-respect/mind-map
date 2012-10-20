/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.event_bus",
    "jquery.cometd",
    "jquery.cometd-ack",
    "jquery.cometd-reload",
    "jquery.cometd-timestamp",
    "jquery.cometd-timesync"
],
    function ($, EventBus) {
        var api = {};
        var cometd = $.cometd;
        // Function that manages the connection status with the Bayeux server]
        var _connected = false;

        // Disconnect when the page unloads
//        $(window).unload(function(){
//            cometd.disconnect(true);
//        });

        var cometURL = location.protocol + "//" + location.host + "/cometd";
        cometd.configure({
            url: cometURL
//            logLevel: 'debug'
        });

        api.init = function(callback){
            console.log("intiliazing cometd");
            cometd.addListener('/meta/handshake', function(handshake){
                _metaHandshake(handshake, callback)
            });
            cometd.addListener('/meta/connect', _metaConnect);
            cometd.addListener('/meta/subscribe', _metaSubscribe)
            cometd.handshake();
        };

        api.subscribe = function (event, notificationCallBack, subscriptionDoneCallBack) {
            try{
                EventBus.subscribe(
                    "/subscription" + event,
                    subscriptionDoneCallBack
                );
                cometd.subscribe(event, function(message){
                    notificationCallBack(
                        message.data
                    );
                });
            }catch(e){
                console.log("cometd subscription failed");
                api.init();
            }
        };
        api.unsubscribe = function (event, fn) {
             $(this).unbind(event, fn);
        };

        return api;
        function _metaConnect(message){
            if (cometd.isDisconnected()){
                _connected = false;
                console.log("push server connection closed");
                return;
            }

            var wasConnected = _connected;
            _connected = message.successful === true;
            if (!wasConnected && _connected){
                console.log("push server connection established");
            }
            else if (wasConnected && !_connected){
                console.log("push server connection broken");
            }
        }

        function _metaSubscribe(subscribeInfo){
            EventBus.publish(
                "/subscription" + subscribeInfo.subscription,
                [subscribeInfo]
            );
        }

        // Function invoked when first contacting the server and
        // when the server has lost the state of this client
        function _metaHandshake(handshake, callback){
            if (handshake.successful === true){
                callback();
            }else{
                console.log("failed to handshake push server")
            }
        }
    });
