/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
        "require",
        "jquery",
        "triple_brain.tree_edge",
        "triple_brain.event_bus",
        "triple_brain.relative_tree_vertex",
        "triple_brain.graph_displayer",
        "triple_brain.graph_element_main_menu",
        "triple_brain.edge_html_builder_common",
        "jquery.cursor-at-end"
    ],
    function (require, $, TreeEdge, EventBus, RelativeTreeVertex, GraphDisplayer, GraphElementMainMenu, EdgeHtmlBuilderCommon) {
        "use strict";
        var api = {};
        api.get = function (edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade) {
            return new EdgeCreator(edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade);
        };
        function EdgeCreator(edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade) {
            this.edgeServer = edgeServer;
            this.uri = edgeServer.getUri();
            this.html = $(
                "<span class='relation graph-element'>"
            ).css("display", "inline");
            this.parentVertexHtmlFacade = parentVertexHtmlFacade;
            this.childVertexHtmlFacade = childVertexHtmlFacade;
        }

        EdgeCreator.prototype.create = function () {
            this.html.uniqueId();
            var isInverse = this.edgeServer.getSourceVertex().getUri() !== this.parentVertexHtmlFacade.getUri();
            if (isInverse) {
                this.childVertexHtmlFacade.getHtml().addClass("inverse");
            }
            this.html.data(
                "source_vertex_id",
                isInverse ? this.childVertexHtmlFacade.getId() : this.parentVertexHtmlFacade.getId()
            ).data(
                "destination_vertex_id",
                isInverse ? this.parentVertexHtmlFacade.getId() : this.childVertexHtmlFacade.getId()
            );
            var inBubbleContainer = this.childVertexHtmlFacade.getInBubbleContainer(),
                isToTheLeft = this.childVertexHtmlFacade.isToTheLeft();
            this.html[isToTheLeft ? "appendTo" : "prependTo"](
                inBubbleContainer
            ).css(
                isToTheLeft ? "margin-left" : "margin-right", "1em"
            ).append(this.html);
            EdgeHtmlBuilderCommon.buildNonInputLabel(
                this.html,
                this.edgeServer.getLabel(),
                TreeEdge.getWhenEmptyLabel()
            ).show();
            var edge = this._edgeFacade();
            EdgeHtmlBuilderCommon.buildLabelAsInput(
                edge,
                edge.getHtml(),
                TreeEdge.getWhenEmptyLabel()
            ).hide();
            buildMenu(edge);
            edge.hideMenu();
            edge.setUri(this.uri);
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
            EventBus.publish(
                '/event/ui/html/edge/created/',
                edge
            );
            return edge;
        };

        function buildMenu(edge) {
            var edgeHtml = edge.getHtml(),
                menu = $("<span class='relation-menu'>");
            edgeHtml.append(menu);
            GraphElementMainMenu.addRelevantButtonsInMenu(
                menu,
                GraphDisplayer.getRelationMenuHandler().forSingle()
            );
        }

        EdgeCreator.prototype._edgeFacade = function () {
            return TreeEdge.withHtml(this.html);
        };
        return api;
    }
);