/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_element_menu",
    "triple_brain.ui.graph",
    "triple_brain.graph_displayer"
], function ($, GraphElementMenu, GraphUi, GraphDisplayer) {
    var api = {};
    api.ofVertex = function (vertex) {
        return new IncludedVerticesMenu(
            vertex
        );
    };
    return api;
    function IncludedVerticesMenu(vertex) {
        var self = this;
        var html;
        this.create = function () {
            html = $("<div>");
            GraphUi.addHtml(html);
            addTitle();
            addIncludedVertices();
            GraphElementMenu.makeForMenuContentAndGraphElement(
                html,
                vertex
            );
            return self;
        };
        function addTitle() {
            html.append(
                "<h2 data-i18n='vertex.menu.included_vertices.title'></h2>"
            );
        }

        function addIncludedVertices() {
            var includedVerticesList = $("<ul>")
            $.each(vertex.getIncludedVertices(), function () {
                var includedVertex = this;
                $("<li>").append(
                    buildAnchor(includedVertex)
                ).appendTo(
                    includedVerticesList
                );
            });
            html.append(includedVerticesList);
            function buildAnchor(includedVertex) {
                return $("<a href='#'>").text(
                    includedVertex.label
                ).data(
                    "includedVertex",
                    includedVertex
                ).on(
                    "click",
                    function (event) {
                        event.preventDefault();
                        var includedVertex = $(this).data("includedVertex");
                        GraphDisplayer.displayUsingNewCentralVertexUri(
                            includedVertex.uri
                        );
                    }
                );
            }
        }
    }
});