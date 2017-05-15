/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "mr.graph-ui-builder",
    "mr.vertex-ui-builder",
    "mr.edge-ui-builder",
    "triple_brain.edge",
    "triple_brain.id_uri",
    "triple_brain.event_bus",
    "triple_brain.bubble_factory",
    "mr.meta_service",
    "triple_brain.id_uri"
], function ($, GraphUiBuilder, VertexUiBuilder, EdgeUiBuilder, Edge, IdUri, EventBus, BubbleFactory, MetaService) {
    "use strict";
    var api = {};
    api.buildFromMetaSubGraph = function (metaSubGraph) {
        var deferred = $.Deferred();
        if(metaSubGraph.getMetaCenter()){
            deferred.resolve(
                api._build(metaSubGraph)
            );
        }
        else {
            MetaService.getForUri(
                IdUri.getGraphElementUriInUrl()
            ).then(function(metaCenter){
                metaSubGraph.setMetaCenter(metaCenter);
                deferred.resolve(
                    api._build(metaSubGraph)
                );
            });
        }
        return deferred.promise();
    };
    api._build = function(metaSubGraph){
        var container = GraphUiBuilder.buildRootBubbleContainer();
        var graphUiBuilder = GraphUiBuilder.usingVertexUiBuilder(
            VertexUiBuilder.withOptions({
                htmlClass: "meta"
            })
        );
        var metaCenter = graphUiBuilder.buildRootBubble(
            metaSubGraph.getMetaCenter(),
            container
        );
        graphUiBuilder.setVertexUiBuilder(
            new VertexUiBuilder.VertexUiBuilder()
        );
        graphUiBuilder.setEdgeUiBuilder(
            EdgeUiBuilder.withOptions({
                htmlClass: "meta-relation",
                isViewOnly: true
            })
        );
        api._edgePopoverText = $.t("meta_relation.remove_tooltip");
        metaSubGraph.getSubGraph().visitVertices(function (vertex) {
            var edgeRelatedToMeta;
            metaSubGraph.getSubGraph().visitEdgesRelatedToVertex(vertex, function(edge){
                if(edge.hasIdentification(metaSubGraph.getMetaCenter())){
                    edgeRelatedToMeta = edge;
                    edgeRelatedToMeta.setSourceVertex(vertex);
                    edgeRelatedToMeta.setDestinationVertex(metaCenter);
                }
            });
            var edge = edgeRelatedToMeta || Edge.withLabelSelfSourceAndDestinationUri(
                    "m",
                    IdUri.generateUuid(),
                    vertex.getUri(),
                    metaCenter.getUri()
                );
            var edgeUi = graphUiBuilder.addEdge(
                edge,
                metaCenter
            );
            var sourceVertexUi = graphUiBuilder.addVertex(
                vertex,
                edgeUi
            );
            graphUiBuilder.getEdgeUiBuilder().getClass().afterChildBuilt(
                edgeUi,
                metaCenter,
                sourceVertexUi
            );
            api._setupEdgeUi(edgeUi);
        });
        return container;
    };
    api._setupEdgeUi = function(edgeUi){
        edgeUi.getLabel().addClass("hidden");
        edgeUi.getHtml().prepend("<i class='fa fa-remove remove-relation-button on-edge-button'>").click(function () {
            var edgeUi = BubbleFactory.fromSubHtml(
                $(this)
            );
            edgeUi.getController().remove();
        }).attr(
            "title",
            api._edgePopoverText
        ).popoverLikeToolTip();
    };
    EventBus.subscribe(
        '/event/ui/graph/drawing_info/updated/',
        function (event, centralBubbleUri) {
            if (!IdUri.isMetaUri(centralBubbleUri)) {
                return;
            }
            VertexUiBuilder.completeBuild(
                BubbleFactory.getGraphElementFromUri(
                    centralBubbleUri
                )
            );
        }
    );
    return api;
});