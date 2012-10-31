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
    "triple_brain.id_uri",
    "triple_brain.mind-map_template",
    "triple_brain.external_resource",
    "triple_brain.ui.identification_menu",
    "triple_brain.ui.suggestion_menu",
    "triple_brain.drawn_graph",
    "triple_brain.ui.all",
    "triple_brain.ui.arrow_line",
    "triple_brain.point",
    "triple_brain.segment",
    "jquery-ui.min"
], function (require, $, EventBus, Graph, Vertex, VertexService, Edge, EdgeService, Suggestion, IdUriUtils, MindMapTemplate, ExternalResource, IdentificationMenu, SuggestionMenu, DrawnGraph, UiUtils, ArrowLine, Point, Segment) {
        var api = {};
        api.createWithArrayOfJsonHavingRelativePosition = function (jsonArray) {
            $.each(jsonArray, function () {
                var json = this;
                api.withArrayOfJsonHavingRelativePosition(
                    json
                ).create();
            });
        };

        api.withArrayOfJsonHavingAbsolutePosition = function (json) {
            return new VertexCreator(json);
        };
        api.withArrayOfJsonHavingRelativePosition = function (json) {
            api.addGraphOffsetToJsonPosition(json);
            return new VertexCreator(json);
        };
        api.addGraphOffsetToJsonPosition = function (json) {
            var graphOffset = Graph.offset();
            json.position.x += graphOffset.x;
            json.position.y += graphOffset.y;
        }

        function VertexCreator(json) {
            var Graph = require("triple_brain.ui.graph");
            var IdUriUtils = require("triple_brain.id_uri");
            var MindMapTemplate = require("triple_brain.mind-map_template");
            var Vertex = require("triple_brain.ui.vertex");
            var VertexService = require("triple_brain.vertex");
            var Suggestion = require("triple_brain.suggestion");
            var IdentificationMenu = require("triple_brain.ui.identification_menu");
            var SuggestionMenu = require("triple_brain.ui.suggestion_menu");
            json.id = IdUriUtils.graphElementIdFromUri(json.id);
            var html = MindMapTemplate['vertex'].merge(json);
            this.create = function () {
                Graph.addHTML(
                    html
                );
                addMoveButton();
                createLabel();
                createMenu();
                var vertex = vertexFacade();
                vertex.addSuggestions(
                    Suggestion.fromJsonArrayOfServer(
                        json.suggestions
                    )
                );
                if (json.suggestions.length > 0) {
                    vertex.showSuggestionButton();
                }
                vertex.adjustWidth();
                vertex.hideButtons();
                $(html).hover(
                    onMouseOver,
                    onMouseOut
                );
                var graphCanvas = Graph.canvas();
                $(html).draggable({
                    handle:".move",
                    start:onDragStart,
                    drag:onDrag,
                    stop:onDragStop
                });
                json.position.x -= $(html).width() / 2;
                json.position.y -= $(html).height() / 2;
                position();
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
                vertex.makeItLowProfile();
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
                $(label).draggable('disabled');

                if (vertex.hasDefaultText()) {
                    vertex.applyStyleOfDefaultText();
                }
                label.focus(function (e) {
                    var vertex = vertexOfSubHtmlComponent(this);
                    vertex.highlight();
                    vertex.removeStyleOfDefaultText();
                    if (vertex.hasDefaultText()) {
                        $(this).val("");
                        vertex.readjustLabelWidth();
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
                        vertex.readjustLabelWidth()
                    } else {
                        vertex.removeStyleOfDefaultText();
                    }
                });

                label.change(function (e) {
                    VertexService.updateLabel(vertexOfSubHtmlComponent(this), $(this).val());
                });

                label.keydown(function (e) {
                    vertexOfSubHtmlComponent(this).readjustLabelWidth();
                });
                label.keyup(function (e) {
                    var vertex = vertexOfSubHtmlComponent(this);
                    vertex.readjustLabelWidth();
                });
                return labelContainer;
            }

            function addMoveButton() {
                $(html).append(
                    MindMapTemplate['vertex_move_button'].merge()
                );
            }

            function createMenu() {
                var vertexMenu = MindMapTemplate['vertex_menu'].merge();
                $(html).append(vertexMenu);

                var plusBtn = MindMapTemplate['vertex_plus_button'].merge();
                $(vertexMenu).append(plusBtn);

                $(plusBtn).on("click", createRelationOrAddVertex);

                var removeBtn = MindMapTemplate['vertex_remove_button'].merge();
                $(vertexMenu).append(removeBtn);

                removeBtn.click(function (event) {
                    event.stopPropagation();
                    var vertex = vertexOfSubHtmlComponent(this);
                    if (!vertex.isCenterVertex() && vertex.getId() != "default") {
                        VertexService.remove(vertex);
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
                    DrawnGraph.getWithNewCentralVertex(
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

            function position() {
                $(html).css('left', json.position.x);
                $(html).css('top', json.position.y);
            }

            function onDragStart(mouseDownEvent, ui) {
                var vertex = vertexFacade();
                $('.edge').unbind('mouseenter mouseleave');
                $("#drawn_graph").data("edgesNormalStateZIndex", $('.edge').css('z-index'));
                $('.edge').css('z-index', '1');

                $('.vertex').unbind('mouseenter mouseleave');
                $("#drawn_graph").data("verticesNormalStateZIndex", $('.vertex').css('z-index'));
                $('.vertex').css('z-index', '1');

                vertex.highlight();
                $(html).css('z-index', $("#drawn_graph").data("verticesNormalStateZIndex"));
                if(vertex.hasHiddenProperties()){
                    vertex.removeHiddenPropertiesIndicator();
                }
            }

            function onDrag(dragEvent, ui) {
                var vertex = Vertex.withHtml(
                    ui.helper
                );
                if (vertex.hasIdentificationMenu()) {
                    vertex.getIdentificationMenu().reEvaluatePosition();
                }
                if (vertex.hasSuggestionMenu()) {
                    vertex.getSuggestionMenu().reEvaluatePosition();
                }
                if (vertex.hasSuggestionMenu()) {
                    vertex.getSuggestionMenu().reEvaluatePosition();
                }
            }

            function onDragStop(dragStopEvent, ui) {
                var vertex = vertexFacade();
                vertex.redrawConnectedEdgesArrowLine();
                if(vertex.hasHiddenProperties()){
                    vertex.buildHiddenNeighborPropertiesIndicator();
                }
                var edgesNormalStateZIndex = $("#drawn_graph").data("edgesNormalStateZIndex");
                $('.edge').css('z-index', edgesNormalStateZIndex);
                $('.edge').hover(
                    Edge.onMouseOver,
                    Edge.onMouseOut
                );

                var verticesNormalStateZIndex = $("#drawn_graph").data("verticesNormalStateZIndex");
                $('.vertex').hover(onMouseOver, onMouseOut);
                $('.vertex').css('z-index', verticesNormalStateZIndex);
            }

            function onMouseOver() {
                var vertex = vertexOfSubHtmlComponent(this);
                Graph.setVertexMouseOver(vertex);
                vertex.makeItHighProfile();
            }

            function onMouseOut() {
                var vertex = vertexOfSubHtmlComponent(this)
                Graph.unsetVertexMouseOver();
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
                    if(arrowLine !== undefined){
                        arrowLine.remove();
                    }
                    relationEndPoint = Point.fromCoordinates(
                        mouseMoveEvent.pageX,
                        mouseMoveEvent.pageY
                    );
                    arrowLine = ArrowLine.withSegment(
                        Segment.withStartAndEndPoint(
                            sourceVertex.centerPoint(),
                            relationEndPoint
                        )
                    );
                    arrowLine.drawInWithDefaultStyle();
                });

                $("body").mouseup(function (mouseUpEvent) {
                    if(arrowLine === undefined){
                        //something when wrong so return;
                        $("body").unbind(mouseUpEvent);
                        $(selectorThatCoversWholeGraph).unbind(relationMouseMoveEvent);
                        return;
                    }
                    arrowLine.remove();
                    $('.edge').hover(Edge.onMouseOver, Edge.onMouseOut);
                    $('.edge').css('z-index', normalStateEdgesZIndex);
                    $("body").unbind(mouseUpEvent);
                    $(selectorThatCoversWholeGraph).unbind(relationMouseMoveEvent);
                    var destinationVertex = Graph.getVertexMouseOver();
                    if (destinationVertex !== undefined) {
                        if (!sourceVertex.equalsVertex(destinationVertex)) {
                            sourceVertex.unhighlight();
                            EdgeService.add(sourceVertex, destinationVertex);
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

