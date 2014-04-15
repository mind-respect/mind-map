/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_element_server_facade",
    "triple_brain.vertex_server_facade"
], function (GraphElementServerFacade, VertexServerFacade) {
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new api.Object(
            serverFormat
        );
    };
    api.buildObjectWithUriOfSelfSourceAndDestinationVertex = function (uri, sourceVertexUri, destinationVertexUri) {
        return {
            graphElement: GraphElementServerFacade.buildObjectWithUri(
                uri
            ),
            sourceVertex: VertexServerFacade.buildObjectWithUri(
                sourceVertexUri
            ),
            destinationVertex: VertexServerFacade.buildObjectWithUri(
                destinationVertexUri
            )
        };
    };
    api.Object = function (serverFormat) {
        var sourceVertex,
            destinationVertex;
        if (serverFormat.sourceVertex !== undefined) {
            sourceVertex = getVertexServerFacade().fromServerFormat(
                serverFormat.sourceVertex
            );
        }
        if (serverFormat.destinationVertex !== undefined) {
            destinationVertex = getVertexServerFacade().fromServerFormat(
                serverFormat.destinationVertex
            );
        }
        GraphElementServerFacade.Object.apply(
            this, [serverFormat.graphElement]
        );
        this.getSourceVertex = function () {
            return sourceVertex;
        };
        this.getDestinationVertex = function () {
            return destinationVertex;
        };
    };

    function getVertexServerFacade() {
        if (undefined === VertexServerFacade) {
            VertexServerFacade = require("triple_brain.vertex_server_facade");
        }
        return VertexServerFacade;
    }
    return api;
});