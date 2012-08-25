/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
],
    function ($) {
       return {
            subscribe:function (event, fn) {
                $(this).bind(event, fn);
            },
            unsubscribe:function (event, fn) {
                $(this).unbind(event, fn);
            },
            publish:function (event, args) {
                $(this).trigger(event, args);
            }
        };
    });
 