/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.ui.graph",
    "triple_brain.mind-map_template",
    "triple_brain.id_uri",
    "triple_brain.ui.vertex_and_edge_common",
    "triple_brain.tree_edge",
    "triple_brain.edge",
    "triple_brain.ui.arrow_line",
    "triple_brain.event_bus",
    "triple_brain.relative_vertex",
    "triple_brain.relative_tree_displayer_templates",
    "triple_brain.ui.vertex",
    "jquery.cursor-at-end"

],
    function (require, $, GraphUi, MindMapTemplate, IdUriUtils, VertexAndEdgeCommon, TreeEdge, EdgeService, ArrowLine, EventBus, RelativeVertex, RelativeTreeTemplates, Vertex) {
        var api = {};
        api.get = function (edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade) {
            return new EdgeCreator(edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade);
        };
        function EdgeCreator(edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade) {
            var uri = edgeServer.id;
            edgeServer.id = IdUriUtils.graphElementIdFromUri(edgeServer.id);
            var html = RelativeTreeTemplates['edge'].merge(edgeServer);
            html = $(html);
            this.create = function () {
                GraphUi.addHTML(
                    html
                );
                var isInverse = edgeServer.source_vertex_id !== parentVertexHtmlFacade.getUri();
                if (isInverse) {
                    html.addClass("inverse");
                }
                html.data(
                    "source_vertex_id",
                    isInverse ? childVertexHtmlFacade.getId() : parentVertexHtmlFacade.getId()
                );
                html.data(
                    "destination_vertex_id",
                    isInverse ? parentVertexHtmlFacade.getId() : childVertexHtmlFacade.getId()
                );

                html.click(function () {
                    changeToInput($(this));
                });
                showRemoveButtonOnlyIfMouseOver(html);
                var relativeVertex = RelativeVertex.withVertex(
                    childVertexHtmlFacade
                );
                var textContainer = childVertexHtmlFacade.textContainer();
                var isToTheLeft = relativeVertex.isToTheLeft();
                if (isToTheLeft) {
                    textContainer.append(html);
                } else {
                    textContainer.prepend(html);
                }
                childVertexHtmlFacade.adjustWidth();
                if (isToTheLeft) {
                    relativeVertex.adjustPosition();
                }
                drawArrowLine();
                var edge = edgeFacade();
                edge.setUri(uri);
                edge.hideMenu();
                EventBus.publish(
                    '/event/ui/html/edge/created/',
                    edge
                );
                return edge;
            }

            function showRemoveButtonOnlyIfMouseOver(html) {
                html.hover(
                    function () {
                        var removeButton = $("<span class='close_button'>&#10006</span>");
                        $(this).append(
                            removeButton
                        );
                        removeButton.on("click", function (event) {
                            event.stopPropagation();
                            var edge = edgeFromHtml(
                                $(this).closest(".relation")
                            );
                            EdgeService.remove(edge,
                                function (edge) {
                                    var vertex = edge.childVertexInDisplay();
                                    var relativeVertex = RelativeVertex.withVertex(
                                        vertex
                                    );
                                    relativeVertex.visitChildren(function (childVertex) {
                                        childVertex.removeConnectedEdges();
                                        childVertex.remove();
                                    });
                                    edge.remove();
                                    vertex.remove();
                                    TreeEdge.redrawAllEdges();
                               }
                            );
                        });
                    },
                    function () {
                        $(this).find("> .close_button").remove();
                    }
                );
            }

            function changeToInput(html) {
                var previousEdge = edgeFromHtml(html);
                var input = RelativeTreeTemplates['edge_input'].merge({
                    label:previousEdge.text()
                });
                input = $(input);
                if (previousEdge.isInverse()) {
                    input.addClass("inverse");
                }
                input.data(
                    "source_vertex_id",
                    previousEdge.sourceVertex().getId()
                );
                input.data(
                    "destination_vertex_id",
                    previousEdge.destinationVertex().getId()
                );
                if (input.val() === TreeEdge.EMPTY_LABEL) {
                    input.val("");
                }
                input.blur(function () {
                    var html = $(this);
                    changeToSpan(html);
                });
                VertexAndEdgeCommon.adjustWidthToNumberOfChars(
                    input
                );
                input.change(function () {
                    var html = $(this);
                    var edge = edgeFromHtml(html);
                    EdgeService.updateLabel(edge, edge.text());
                });
                input.keydown(function () {
                    $(this).keyup();
                });
                input.keyup(function () {
                    var html = $(this);
                    VertexAndEdgeCommon.adjustWidthToNumberOfChars(
                        html
                    );
                    var vertex = Vertex.withHtml(
                        html.closest(".vertex")
                    );
                    vertex.adjustWidth();
                });
                var uri = previousEdge.getUri();
                var arrowLine = previousEdge.arrowLine();
                $(html).replaceWith(
                    input
                );
                var edge = edgeFromHtml(input);
                edge.setUri(uri);
                edge.setArrowLine(arrowLine);
                input.focus();
                input.setCursorToTextEnd();
                var vertex = Vertex.withHtml(
                    input.closest(".vertex")
                );
                vertex.adjustWidth();
            }

            function changeToSpan(previousHtml) {
                var previousEdge = edgeFromHtml(
                    previousHtml
                );
                var html = RelativeTreeTemplates['edge'].merge({
                    label:previousEdge.text()
                });
                html = $(html);
                showRemoveButtonOnlyIfMouseOver(html);
                if (previousEdge.isInverse()) {
                    html.addClass("inverse");
                }
                html.data(
                    "source_vertex_id",
                    previousEdge.sourceVertex().getId()
                );
                html.data(
                    "destination_vertex_id",
                    previousEdge.destinationVertex().getId()
                );
                html.click(function () {
                    changeToInput($(this));
                });
                var uri = previousEdge.getUri();
                var arrowLine = previousEdge.arrowLine();
                previousHtml.replaceWith(html);
                var edge = edgeFromHtml(html);
                edge.setUri(uri);
                edge.setArrowLine(arrowLine);
                var vertex = Vertex.withHtml(html.closest(".vertex"));
                var relativeVertex = RelativeVertex.withVertex(vertex);
                relativeVertex.adjustPositionIfApplicable();
                relativeVertex.adjustAllChildrenPositionIfApplicable();
                TreeEdge.redrawAllEdges();
            }

            function edgeFromHtml(htmlComponent) {
                htmlComponent = $(htmlComponent);
                var html = htmlComponent.hasClass("relation") ?
                    htmlComponent : htmlComponent.closest(".relation");
                return TreeEdge.withHtml(
                    html
                );
            }

            function drawArrowLine() {
                var edge = edgeFacade();
                edge.setArrowLine(
                    ArrowLine.ofEdgeHavingUndefinedArrowLine(
                        edge
                    )
                );
                edge.arrowLine().drawInWithDefaultStyle();
            }

            function edgeFacade() {
                return TreeEdge.withHtml(html);
            }
        }

        return api;
    }
);