if (triple_brain.id_uri == undefined) {

    var baseUrl= "http://www.triple_brain.org/"
    var idSeparator = "_id_separator_";

    triple_brain.id_uri = {

        baseURI : "http://www.triple_brain.org/",
        encodeUri : function(uri){
            return encodeURIComponent(
                uri
            );
        },
        graphElementIdFromUri: function(uri){
            var segments = $.url(uri).segment();
            var graphElementId = segments[1];
            return graphElementId;
        },
        encodedUriFromGraphElementId : function(id){
            return encodeURIComponent(
                triple_brain.id_uri.uriFromGraphElementId(id)
            );
        },
        uriFromGraphElementId: function(id){
            var username = triple_brain.authenticatedUser.user_name;
            return baseUrl + username + "/" + id;
        }
    }
}