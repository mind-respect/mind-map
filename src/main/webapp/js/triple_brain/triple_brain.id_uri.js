define([
    "jquery",
    "triple_brain/mind_map/triple_brain.user",
    "jquery/jquery.url"
],
    function ($, userService) {
        var api = {};
        api.baseUri = "http://www.triple_brain.org/";
        api.encodeUri = function (uri) {
            return encodeURIComponent(
                uri
            );
        };
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
            var username = userService.authenticatedUserInCache().user_name;
            return api.baseUri + username + "/" + id
        };
        return api;
    }
);