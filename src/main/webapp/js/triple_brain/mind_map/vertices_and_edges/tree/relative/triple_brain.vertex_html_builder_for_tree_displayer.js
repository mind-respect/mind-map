/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.ui.graph",
    "triple_brain.ui.vertex",
    "triple_brain.vertex",
    "triple_brain.ui.edge",
    "triple_brain.edge",
    "triple_brain.suggestion",
    "triple_brain.mind-map_template",
    "triple_brain.external_resource",
    "triple_brain.ui.identification_menu",
    "triple_brain.ui.suggestion_menu",
    "triple_brain.ui.all",
    "triple_brain.ui.arrow_line",
    "triple_brain.point",
    "triple_brain.segment",
    "triple_brain.graph_displayer",
    "triple_brain.relative_vertex",
    "jquery-ui"
], function (require, $, EventBus, GraphUi, Vertex, VertexService, EdgeUi, EdgeService, Suggestion, MindMapTemplate, ExternalResource, IdentificationMenu, SuggestionMenu, UiUtils, ArrowLine, Point, Segment, GraphDisplayer, RelativeVertex) {
        var api = {};
        api.withServerJson = function (serverVertex) {
            return new VertexCreator(serverVertex);
        };
        function VertexCreator(json) {
            var Vertex = require("triple_brain.ui.vertex");
            var VertexService = require("triple_brain.vertex");
            var Suggestion = require("triple_brain.suggestion");
            var IdentificationMenu = require("triple_brain.ui.identification_menu");
            var SuggestionMenu = require("triple_brain.ui.suggestion_menu");
            var html = MindMapTemplate['relative_vertex'].merge(json);
            $(html).uniqueId();
            this.create = function () {
                createLabel();
                createMenu();
                var vertex = vertexFacade();
                vertex.setUri(json.id);
                vertex.addSuggestions(
                    Suggestion.fromJsonArrayOfServer(
                        json.suggestions
                    )
                );
                if (json.suggestions.length > 0) {
                    vertex.showSuggestionButton();
                }
                vertex.hideButtons();
                $(html).hover(
                    onMouseOver,
                    onMouseOut
                );

                vertex.setNameOfHiddenProperties([]);
                if (json.is_frontier_vertex_with_hidden_vertices) {
                    vertex.setNameOfHiddenProperties(json.name_of_hidden_properties);
                    vertex.buildHiddenNeighborPropertiesIndicator();
                }
                vertex.setTypes([]);
                vertex.setSameAs([]);
                $.each(json.types, function () {
                    var typeFromServer = this;
                    vertex.addType(
                        ExternalResource.fromServerJson(
                            typeFromServer
                        )
                    );
                });

                $.each(json.same_as, function () {
                    var sameAsFromServer = this;
                    vertex.addSameAs(
                        ExternalResource.fromServerJson(
                            sameAsFromServer
                        )
                    );
                });
                vertex.prepareAsYouTypeSuggestions();
                vertex.makeItLowProfile();
                vertex.setOriginalServerObject(
                    json
                );
                EventBus.publish(
                    '/event/ui/html/vertex/created/',
                    vertex
                );
                return vertex;
            }
            function createLabel() {
                var labelContainer = MindMapTemplate['vertex_label_container'].merge(json);
                $(html).append(labelContainer);
                var label = $(labelContainer).find("input[type='text']:first");
                var vertex = vertexFacade();
                vertex.readjustLabelWidth();
                if (vertex.hasDefaultText()) {
                    vertex.applyStyleOfDefaultText();
                }
                label.focus(function (e) {
                    var vertex = vertexOfSubHtmlComponent(this);
                    vertex.highlight();
                    vertex.removeStyleOfDefaultText();
                    if (vertex.hasDefaultText()) {
                        $(this).val("");
                        $(vertex.label()).keydown();
                    }
                });
                label.blur(function (e) {
                    var vertex = vertexOfSubHtmlComponent(this);
                    if (!vertex.isMouseOver()) {
                        vertex.unhighlight();
                    }
                    if ($(this).val() == "") {
                        $(this).val(Vertex.EMPTY_LABEL);
                        vertex.applyStyleOfDefaultText();
                        $(vertex.label()).keydown();
                    } else {
                        vertex.removeStyleOfDefaultText();
                    }
                });

                label.change(function (e) {
                    var vertex = vertexOfSubHtmlComponent(this);
                    $(vertex.label()).keydown();
                    VertexService.updateLabel(vertexOfSubHtmlComponent(this), $(this).val());
                    var relativeVertex = RelativeVertex.withVertex(vertex);
                    relativeVertex.adjustPositionIfApplicable();
                    relativeVertex.adjustAllChildrenPositionIfApplicable();
                    EdgeUi.redrawAllEdges();
                });

                label.keydown(function (e) {
                    var vertex = vertexOfSubHtmlComponent(this);
                    vertex.readjustLabelWidth();
                    var html = vertex.getHtml();
                    if (!$(html).parents(".left-oriented").length > 0) {
                        return;
                    }
                    var children = $(html).closest(
                        ".vertex-tree-container"
                    ).find(
                        ".vertices-children-container .vertex-tree-container"
                    );
                    var parentLabelWidth = $(vertex.label()).width();
                    $.each(children, function () {
                        var child = this;
                        var width = $(child).find(".label").width();
                        $(child).closest(".vertex-tree-container").css(
                            "margin-left", "-" + (width + parentLabelWidth + 200) + "px"
                        );
                    });
                });
                return labelContainer;
            }

            function createMenu() {
                var vertexMenu = MindMapTemplate['vertex_menu'].merge();
                $(html).append(vertexMenu);

                var plusBtn = MindMapTemplate['vertex_plus_button'].merge();
                $(vertexMenu).append(plusBtn);

                $(plusBtn).on("click", function (event) {
                    if (GraphDisplayer.allowsMovingVertices()) {
                        createRelationOrAddVertex(event);
                    } else {
                        var sourceVertex = vertexFacade();
                        VertexService.addRelationAndVertexAtPositionToVertex(
                            sourceVertex,
                            GraphDisplayer
                        );
                    }
                });

                var removeBtn = MindMapTemplate['vertex_remove_button'].merge();
                $(vertexMenu).append(removeBtn);

                removeBtn.click(function (event) {
                    event.stopPropagation();
                    var vertex = vertexOfSubHtmlComponent(this);
                    if (!vertex.isCenterVertex() && vertex.getId() != "default") {
                        VertexService.remove(vertex, function(vertex){
                            var relativeVertex = RelativeVertex.withVertex(
                                vertex
                            );
                            relativeVertex.visitChildren(function(childVertex){
                                vertex.removeConnectedEdges();
                                childVertex.remove();
                            });
                            vertex.removeConnectedEdges();
                            vertex.remove();
                            EdgeUi.redrawAllEdges();
                        });
                    }
                });

                var whatIsThisBtn = MindMapTemplate['vertex_what_is_this_button'].merge();
                $(vertexMenu).append(whatIsThisBtn);
                whatIsThisBtn.click(function (event) {
                    event.stopPropagation();
                    var vertex = vertexOfSubHtmlComponent(this);
                    vertex.setIdentificationMenu(
                        IdentificationMenu.ofVertex(vertex)
                            .create()
                    );
                });

                var suggestionsBtn = MindMapTemplate['vertex_suggestion_button'].merge();
                $(vertexMenu).append(suggestionsBtn);
                suggestionsBtn.click(function (event) {
                    event.stopPropagation();
                    var outOfVertexMenus = $('.peripheral-menu');
                    $(outOfVertexMenus).remove();
                    var vertex = vertexOfSubHtmlComponent(this);
                    vertex.setSuggestionMenu(
                        SuggestionMenu.ofVertex(vertex)
                            .create()
                    )
                });
                $(suggestionsBtn).hide();

                var centerBtn = MindMapTemplate['vertex_center_button'].merge();
                $(vertexMenu).append(centerBtn);
                centerBtn.click(function () {
                    GraphDisplayer.displayUsingNewCentralVertex(
                        vertexOfSubHtmlComponent(this)
                    );
                });
                return vertexMenu;
            }

            function vertexOfSubHtmlComponent(htmlOfSubComponent) {
                return Vertex.withHtml(
                    $(htmlOfSubComponent).closest('.vertex')
                );
            }

            function onMouseOver() {
                var vertex = vertexOfSubHtmlComponent(this);
                GraphUi.setVertexMouseOver(vertex);
                vertex.makeItHighProfile();
            }

            function onMouseOut() {
                var vertex = vertexOfSubHtmlComponent(this)
                GraphUi.unsetVertexMouseOver();
                vertex.makeItLowProfile();
            }

            function createRelationOrAddVertex(mouseDownEvent) {
                var sourceVertex = vertexFacade();
                $('.edge').unbind('mouseenter mouseleave');
                var normalStateEdgesZIndex = $('.edge').css('z-index');
                $('.edge').css('z-index', '1');
                var relationMouseMoveEvent;
                var relationEndPoint = Point.centeredAtOrigin();
                var arrowLine;
                sourceVertex.highlight();
                var selectorThatCoversWholeGraph = "svg";
                $(selectorThatCoversWholeGraph).mousemove(function (mouseMoveEvent) {
                    relationMouseMoveEvent = mouseMoveEvent;
                    if (arrowLine !== undefined) {
                        arrowLine.remove();
                    }
                    relationEndPoint = Point.fromCoordinates(
                        mouseMoveEvent.pageX,
                        mouseMoveEvent.pageY
                    );
                    arrowLine = ArrowLine.withSegment(
                        Segment.withStartAndEndPoint(
                            sourceVertex.labelCenterPoint(),
                            relationEndPoint
                        )
                    );
                    arrowLine.drawInWithDefaultStyle();
                });

                $("body").mouseup(function (mouseUpEvent) {
                    if (arrowLine === undefined) {
                        //something when wrong so return;
                        $("body").unbind(mouseUpEvent);
                        $(selectorThatCoversWholeGraph).unbind(relationMouseMoveEvent);
                        return;
                    }
                    arrowLine.remove();
                    $('.edge').hover(EdgeUi.onMouseOver, EdgeUi.onMouseOut);
                    $('.edge').css('z-index', normalStateEdgesZIndex);
                    $("body").unbind(mouseUpEvent);
                    $(selectorThatCoversWholeGraph).unbind(relationMouseMoveEvent);
                    var destinationVertex = GraphUi.getVertexMouseOver();
                    if (destinationVertex !== undefined) {
                        if (!sourceVertex.equalsVertex(destinationVertex)) {
                            sourceVertex.unhighlight();
                            EdgeService.add(
                                sourceVertex,
                                destinationVertex,
                                GraphDisplayer.addEdgeBetweenExistingVertices
                            );
                        }
                    } else {
                        sourceVertex.unhighlight();
                        VertexService.addRelationAndVertexAtPositionToVertex(sourceVertex, relationEndPoint);
                    }
                });
            }

            function vertexFacade() {
                return Vertex.withHtml(html);
            }
        }

        return api;
    }
)

