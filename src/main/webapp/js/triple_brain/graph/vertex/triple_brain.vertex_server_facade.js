    /*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "triple_brain.graph_element_server_facade",
    "triple_brain.edge_server_facade",
    "triple_brain.suggestion"
],function(require, GraphElementServerFacade, EdgeServerFacade, Suggestion){
    var api = {};
    api.fromServerFormat = function(serverFormat){
        return new Object(
            serverFormat
        );
    };
    api.buildObjectWithUri = function(uri){
        return {
            vertex: {
                graphElement: GraphElementServerFacade.buildObjectWithUri(uri)
            }
        };
    };
    return api;
    function Object(serverFormat){
        var _includedVertices = buildIncludedVertices();
        var _includedEdges = buildIncludedEdges();
        var _suggestions = buildSuggestions();
        GraphElementServerFacade.Object.apply(
            this, [serverFormat.vertex.graphElement]
        );
        this.getIncludedVertices = function(){
            return _includedVertices;
        };
        this.getIncludedEdges = function(){
            return _includedEdges;
        };
        this.getSuggestions = function(){
            return _suggestions;
        };
        this.getNumberOfConnectedEdges = function(){
            return serverFormat.vertex.numberOfConnectedEdges;
        };
        this.isPublic = function(){
            return serverFormat.vertex.isPublic;
        };
        function buildIncludedEdges(){
            var includedEdges = [];
            if(serverFormat.vertex.includedEdges === undefined){
                return includedEdges;
            }
            $.each(serverFormat.vertex.includedEdges, function(){
                includedEdges.push(
                    getEdgeServerFacade().fromServerFormat(
                        this
                    )
                );
            });
            return includedEdges;
        }
        function buildIncludedVertices(){
            var includedVertices = {};
            if(serverFormat.vertex.includedVertices === undefined){
                return includedVertices;
            }
            $.each(serverFormat.vertex.includedVertices, function(key, value){
                includedVertices[key] = api.fromServerFormat(
                    value
                );
            });
            return includedVertices;
        }
        function buildSuggestions(){
            var suggestions = [];
            if(serverFormat.vertex.suggestions === undefined){
                return suggestions;
            }
            return Suggestion.fromJsonArrayOfServer(
                serverFormat.vertex.suggestions
            );
        }
    }
    function getEdgeServerFacade(){
        if(undefined === EdgeServerFacade){
            EdgeServerFacade = require("triple_brain.edge_server_facade");
        }
        return EdgeServerFacade;
    }
});