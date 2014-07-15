define([
    "jquery",
    "triple_brain.user",
    "jquery.url"
],
    function ($, UserService) {
        "use strict";
        var api = {};
        api.encodeUri = function (uri) {
            return encodeURIComponent(
                uri
            );
        };
        api.decodeUri = function(uri){
            return decodeURIComponent(
                uri
            );
        };
        api.usernameFromUri = function(uri){
            var segments = $.url(uri).segment();
            return segments[2];
        };
        api.encodedUriFromGraphElementId = function (id) {
            return encodeURIComponent(
                api.uriFromGraphElementId(id)
            );
        };
        api.uriFromGraphElementId = function (id) {
            var username = UserService.authenticatedUserInCache().user_name;
            return "/users" + username + "/" + id;
        };
        api.removeDomainNameFromGraphElementUri = function(uri){
            return uri.substr(
                uri.indexOf("/service")
            );
        };
        api.elementIdFromUri = function(uri){
            return uri.substr(
                uri.lastIndexOf("/") + 1
            );
        };
        api.generateUuid = function(){
            // http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
            var buf = new Uint16Array(8);
            crypto.getRandomValues(buf);
            var S4 = function(num) {
                var ret = num.toString(16);
                while(ret.length < 4){
                    ret = "0"+ret;
                }
                return ret;
            };
            return (S4(buf[0])+S4(buf[1])+"-"+S4(buf[2])+"-"+S4(buf[3])+"-"+S4(buf[4])+"-"+S4(buf[5])+S4(buf[6])+S4(buf[7]));
        };
        return api;
    }
);