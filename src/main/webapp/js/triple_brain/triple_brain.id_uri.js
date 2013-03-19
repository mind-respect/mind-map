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
        }
        api.graphElementIdFromUri = function (uri) {
            var segments = $.url(uri).segment();
            var graphElementId = segments[1];
            return graphElementId;
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