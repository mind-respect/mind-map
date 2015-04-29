/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
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
            if (isInverse) {
                edge.inverse();
            }
            GraphElementHtmlBuilder.addDuplicateElementButtonIfApplicable(edge);
            GraphElementHtmlBuilder.moveNoteButtonIfIsToTheLeft(
                edge
            );
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
            ).append("<div class='in-bubble-content label label-info'>");
        }

        EdgeCreator.prototype.create = function () {
            this.html.uniqueId();
            EdgeHtmlBuilderCommon.buildLabel(
                this.html.find(".in-bubble-content"),
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
            GraphElementHtmlBuilder.addNoteButtonNextToLabel(
                edge
            );
            edge.hideMenu();
            edge.setTypes([]);
            edge.setSameAs([]);
            edge.setGenericIdentifications([]);
            $.each(this.edgeServer.getTypes(), function () {
                var typeFromServer = this;
                edge.addType(
                    typeFromServer
                );
            });
            $.each(this.edgeServer.getSameAs(), function () {
                var sameAsFromServer = this;
                edge.addSameAs(
                    sameAsFromServer
                );
            });
            return edge;
        };
        function buildMenu(edge) {
            var edgeHtml = edge.getHtml(),
                menu = $("<span class='relation-menu menu'>");
            edgeHtml.append(menu);
            GraphElementMainMenu.addRelevantButtonsInMenu(
                menu,
                GraphDisplayer.getRelationMenuHandler().forSingle()
            );
        }
        return api;
    }
);