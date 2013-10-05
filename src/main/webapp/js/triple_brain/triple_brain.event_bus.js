/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
],
    function ($) {
       return {
            subscribe:function (events, fn) {
                $(this).on(events, fn);
            },
            unsubscribe:function (events, fn) {
                $(this).off(events, fn);
            },
            publish:function (events, args) {
                $(this).trigger(events, args);
            },
            subscribeOnce:function (events, fn) {
                $(this).one(events, fn);
            }
        };
    });
 