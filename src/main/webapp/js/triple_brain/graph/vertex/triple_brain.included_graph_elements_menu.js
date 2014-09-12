/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_element_menu",
    "triple_brain.ui.graph",
    "triple_brain.graph_displayer",
    "jquery.triple_brain.drag_scroll"
], function ($, GraphElementMenu, GraphUi, GraphDisplayer) {
    var api = {};
    api.ofVertex = function (vertex) {
        return new IncludedVerticesMenu(
            vertex
        );
    };
    return api;
    function IncludedVerticesMenu(vertex) {
        "use strict";
        var self = this,
            html;
        this.create = function () {
            html = $("<div class='canvas-parent included-vertices-container'>");
            addTitle();
            GraphUi.addHtml(html);
            var $body = $("body");
            var layout = $("<div class='layout'>").css(
                "min-width", $body.css("width")
            ).css(
                "min-height",
                $body.css("height")
            );
            html.append(layout);
            layout.dragScroll({
                scrollContainer: html
            });
            var drawnTree = addIncludedGraphElements();
            GraphElementMenu.makeForMenuContentAndGraphElement(
                html,
                vertex, {
                    height: 0.5914 * $(window).height(),
                    width: 0.6987 * $(window).width()
                }
            );
            var vertices = drawnTree.vertices;
            var vertexUri = Object.keys(vertices)[0];
            GraphDisplayer.getVertexSelector().lastAddedWithUri(vertexUri).getHtml().centerOnScreen({
                    container: html,
                    containerVisibleSize: {
                        x: html.innerWidth(),
                        y: html.innerHeight()
                    }
                });
            return self;
        };
        function addTitle() {
            html.append(
                "<h2 data-i18n='vertex.menu.included_graph_elements.title'></h2>"
            );
        }

        function addIncludedGraphElements() {
            return GraphDisplayer.buildIncludedGraphElementsView(
                vertex,
                html
            );
        }
    }
});