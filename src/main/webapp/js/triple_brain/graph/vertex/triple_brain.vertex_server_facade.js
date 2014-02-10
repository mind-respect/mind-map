    /*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "triple_brain.graph_element_server_facade",
    "triple_brain.edge_server_facade",
    "triple_brain.suggestion_server_facade"
],function(require, GraphElementServerFacade, EdgeServerFacade, SuggestionServerFacade){
    var api = {};
    api.fromServerFormat = function(serverFormat){
        return new Object(
            serverFormat
        );
    };
    return api;
    function Object(serverFormat){
        var _includedVertices = buildIncludedVertices();
        var _includedEdges = buildIncludedEdges();
        var _suggestions = buildSuggestions();
        GraphElementServerFacade.Object.apply(
            this, [serverFormat.graphElement]
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
            return serverFormat.numberOfConnectedEdges;
        };
        this.isPublic = function(){
            return serverFormat.isPublic;
        };
        function buildIncludedEdges(){
            var includedEdges = [];
            $.each(serverFormat.includedEdges, function(){
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
            $.each(serverFormat.includedVertices, function(key, value){
                includedVertices[key] = api.fromServerFormat(
                    value
                );
            });
            return includedVertices;
        }
        function buildSuggestions(){
            var suggestions = [];
            $.each(serverFormat.suggestions, function(){
                suggestions.push(
                    SuggestionServerFacade.fromServerFormat(
                        this
                    )
                );
            });
            return suggestions;
        }
    }
    function getEdgeServerFacade(){
        if(undefined === EdgeServerFacade){
            EdgeServerFacade = require("triple_brain.edge_server_facade");
        }
        return EdgeServerFacade;
    }
});