define([
    "jquery",
    "triple_brain.user",
    "jquery.url"
],
    function ($, UserService) {
        var api = {};
        api.baseUri = "http://www.triple_brain.org/";
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
            return "/users" + username + "/" + id
        };
        return api;
    }
);