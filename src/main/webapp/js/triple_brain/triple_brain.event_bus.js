/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "jquery"
    ],
    function ($) {
        var promises = {};
        return {
            subscribe: function (events, fn) {
                $(this).on(events, fn);
            },
            unsubscribe: function (events, fn) {
                $(this).off(events, fn);
            },
            publish: function (events, args) {
                $(this).trigger(events, args);
            },
            before : function (event, promise) {
                if(promises[event] === undefined){
                    promises[event] = [];
                }
                promises[event].push(
                    promise
                );
            },
            executeAfterForEvent: function(event, afterPromises, params){
                if(undefined === promises[event]){
                    afterPromises();
                    return;
                }
                var built = [],
                    hasMultipleParams = params instanceof Array;
                $.each(promises[event], function(){
                    built.push(
                        hasMultipleParams ?
                            this.apply(this, params):
                            this(params)
                    );
                });
                $.when.apply($,built).done(afterPromises);
            },
            reset: function(){
                promises = {};
            }
        };
    }
);
 