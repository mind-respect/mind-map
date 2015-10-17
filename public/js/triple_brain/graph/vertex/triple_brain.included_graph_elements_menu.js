/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element_menu",
    "triple_brain.ui.graph",
    "triple_brain.graph_displayer",
    "dragscroll"
], function ($, GraphElementMenu, GraphUi, GraphDisplayer, DragScroll) {
    "use strict";
    var api = {};
    api.ofVertex = function (vertex) {
        return new IncludedVerticesMenu(
            vertex
        );
    };
    return api;
    function IncludedVerticesMenu(vertex) {
        var self = this,
            html;
        this.create = function () {
            html = $("<div class='included-vertices-container dragscroll'>");
            addTitle();
            GraphUi.addHtml(html);
            var $body = $("body"),
                layout = $("<div class='layout'>").css(
                    "min-width", $body.css("width")
                ).css(
                    "min-height",
                    $body.css("height")
                );
            html.append(layout);
            var tree = addIncludedGraphElements();
            GraphElementMenu.makeForMenuContentAndGraphElement(
                html,
                vertex, {
                    height: 0.5914 * $(window).height(),
                    width: 0.4 * $(window).width(),
                    draggable: false
                }
            );
            var centerVertexHtml = tree.find(".center-vertex:first");
            centerVertexHtml.centerOnScreen({
                container: html,
                containerVisibleSize: {
                    x: html.innerWidth(),
                    y: html.innerHeight()
                }
            });
            DragScroll.reset();
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