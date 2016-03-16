/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.tree_edge",
        "triple_brain.edge_ui",
        "triple_brain.event_bus",
        "triple_brain.relative_tree_vertex",
        "triple_brain.graph_displayer",
        "triple_brain.graph_element_main_menu",
        "triple_brain.edge_html_builder_common",
        "triple_brain.graph_element_html_builder"
    ],
    function ($, TreeEdge, EdgeUi, EventBus, RelativeTreeVertex, GraphDisplayer, GraphElementMainMenu, EdgeHtmlBuilderCommon, GraphElementHtmlBuilder) {
        "use strict";
        var api = {};
        api.withServerFacade = function (edgeServer) {
            return new EdgeCreator(
                edgeServer
            );
        };
        api.afterChildBuilt = function (edge, parentUi, childUi) {
            var edgeServer = edge.getOriginalServerObject(),
                parentVertexUi = parentUi.isVertex() ?
                    parentUi :
                    parentUi.getParentVertex(),
                isInverse = edgeServer.getSourceVertex().getUri() !== parentVertexUi.getUri();
            edge.getHtml().data(
                "source_vertex_id",
                parentVertexUi.getId()
            ).data(
                "destination_vertex_id",
                childUi.getId()
            );
            var isPublic = parentVertexUi.isPublic() && childUi.isPublic();
            if(isPublic){
                edge.makePublic();
            }
            if (isInverse) {
                edge.inverse();
            }
            GraphElementHtmlBuilder.setUpIdentifications(
                edgeServer,
                edge
            );
            EdgeHtmlBuilderCommon.moveInLabelButtonsContainerIfIsToTheLeft(
                edge
            );
            edge.refreshImages();
            edge.resetOtherInstances();
            edge.reviewInLabelButtonsVisibility();
            EventBus.publish(
                '/event/ui/html/edge/created/',
                edge
            );
            edge.getHtml().closest(
                ".vertex-tree-container"
            ).find("> .vertical-border").addClass("small");
        };
        function EdgeCreator(edgeServer) {
            this.edgeServer = edgeServer;
            this.uri = edgeServer.getUri();
            this.html = $(
                "<div class='relation graph-element bubble'>"
            ).append("<div class='in-bubble-content'>");
        }
        EdgeCreator.prototype.create = function () {
            this.html.uniqueId();
            EdgeHtmlBuilderCommon.buildLabel(
                this.html,
                this.edgeServer.getLabel(),
                TreeEdge.getWhenEmptyLabel()
            );
            this.html.append(
                "<span class='connector'>"
            );
            var edge = TreeEdge.createFromHtmlAndUri(
                this.html,
                this.uri
            );
            edge.setOriginalServerObject(
                this.edgeServer
            );
            edge.setNote(
                this.edgeServer.getComment()
            );
            buildMenu(edge);
            EdgeHtmlBuilderCommon.buildInLabelButtons(
                edge
            );
            edge.hideMenu();
            edge.addImages(
                this.edgeServer.getImages()
            );
            return edge;
        };
        function buildMenu(edge) {
            var edgeHtml = edge.getHtml(),
                menu = $("<span class='relation-menu menu'>");
            edgeHtml.find(".label-container").append(menu);
            GraphElementMainMenu.addRelevantButtonsInMenu(
                menu,
                GraphDisplayer.getRelationMenuHandler().forSingle()
            );
        }
        return api;
    }
);