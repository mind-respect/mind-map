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
        idFromUri: function(uri){
            var segments = $.url(uri).segment();
            return segments[0] + idSeparator + segments[1];
        },
        encodedUriFromId : function(id){
            return encodeURIComponent(
                triple_brain.id_uri.uriFromId(id)
            );
        },
        uriFromId: function(id){
            var idSegments = id.split(idSeparator);
            var username = idSegments[0];
            var graphElementId = idSegments[1];
            return baseUrl + username + "/" + graphElementId;
        }
    }
}