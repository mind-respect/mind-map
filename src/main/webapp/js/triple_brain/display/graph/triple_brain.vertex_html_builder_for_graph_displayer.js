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
    "triple_brain.graph_edge",
    "triple_brain.edge",
    "triple_brain.suggestion",
    "triple_brain.mind-map_template",
    "triple_brain.external_resource",
    "triple_brain.ui.identification_menu",
    "triple_brain.ui.suggestion_menu",
    "triple_brain.ui.arrow_line",
    "triple_brain.point",
    "triple_brain.segment",
    "triple_brain.graph_displayer",
    "triple_brain.vertex_html_builder_common",
    "jquery-ui"
], function (require, $, EventBus, GraphUi, Vertex, VertexService, GraphEdge, EdgeService, Suggestion, MindMapTemplate, ExternalResource, IdentificationMenu, SuggestionMenu, ArrowLine, Point, Segment, GraphDisplayer, VertexHtmlCommon) {
        var api = {};
        api.withJsonHavingAbsolutePosition = function (serverVertex) {
            initAdjustedPosition(serverVertex);
            return new VertexCreator(serverVertex);
        };
        api.withJsonHavingRelativePosition = function (serverVertex) {
            initAdjustedPosition(serverVertex);
            api.addGraphOffsetToJsonPosition(serverVertex);
            return new VertexCreator(serverVertex);
        };
        api.addGraphOffsetToJsonPosition = function (serverVertex) {
            var graphOffset = GraphUi.offset();
            serverVertex.adjustedPosition.x += graphOffset.x;
            serverVertex.adjustedPosition.y += graphOffset.y;
        };
        function initAdjustedPosition(serverVertex){
            serverVertex.adjustedPosition = {
                x:serverVertex.position.x,
                y:serverVertex.position.y
            };
        }

        function VertexCreator(serverFormat) {
            var Vertex = require("triple_brain.ui.vertex");
            var VertexService = require("triple_brain.vertex");
            var Suggestion = require("triple_brain.suggestion");
            var IdentificationMenu = require("triple_brain.ui.identification_menu");
            var SuggestionMenu = require("triple_brain.ui.suggestion_menu");
            var html = $(
                MindMapTemplate['vertex'].merge(serverFormat)
            );
            html.data(
                "uri",
                serverFormat.id
            );
            html.uniqueId();
            this.create = function () {
                addMoveButton();
                createLabel();
                createMenu();
                var vertex = vertexFacade();
                vertex.setNote(
                    serverFormat.note
                );
                vertex.addSuggestions(
                    Suggestion.fromJsonArrayOfServer(
                        serverFormat.suggestions
                    )
                );
                if (serverFormat.suggestions.length > 0) {
                    vertex.showSuggestionButton();
                }
                vertex.adjustWidth();
                vertex.hideButtons();
                $(html).hover(
                    onMouseOver,
                    onMouseOut
                );
                $(html).draggable({
                    handle:".move",
                    start:onDragStart,
                    drag:onDrag,
                    stop:onDragStop
                });
                position();
                vertex.setNameOfHiddenProperties([]);
                if (serverFormat.is_frontier_vertex_with_hidden_vertices) {
                    vertex.setNameOfHiddenProperties(serverFormat.name_of_hidden_properties);
                    vertex.buildHiddenNeighborPropertiesIndicator();
                }
                vertex[
                    serverFormat.is_public ?
                        "makePublic" :
                        "makePrivate"
                    ]();
                vertex.setTypes([]);
                vertex.setSameAs([]);
                $.each(serverFormat.types, function () {
                    var typeFromServer = this;
                    vertex.addType(
                        ExternalResource.fromServerJson(
                            typeFromServer
                        )
                    );
                });

                $.each(serverFormat.same_as, function () {
                    var sameAsFromServer = this;
                    vertex.addSameAs(
                        ExternalResource.fromServerJson(
                            sameAsFromServer
                        )
                    );
                });
                vertex.makeItLowProfile();
                vertex.setOriginalServerObject(
                    serverFormat
                );
                EventBus.publish(
                    '/event/ui/html/vertex/created/',
                    vertex
                );
                return vertex;
            }
            function createLabel() {
                var labelContainer = MindMapTemplate['vertex_label_container'].merge(serverFormat);
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
                    vertex.readjustLabelWidth();
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
                html.append(vertexMenu);

                VertexHtmlCommon.addPlusButton(
                    vertexMenu,
                    createRelationOrAddVertex
                );
                VertexHtmlCommon.addRemoveButton(
                    vertexMenu,
                    removeButtonClickBehaviour
                );
                VertexHtmlCommon.addWhatIsThisButton(
                    vertexMenu,
                    whatIsThisButtonClickBehaviour
                );
                VertexHtmlCommon.addSuggestionsButton(
                    vertexMenu,
                    suggestionsButtonClickBehaviour
                );
                VertexHtmlCommon.addCenterButton(
                    vertexMenu,
                    centerButtonClickBehaviour
                );
                VertexHtmlCommon.addLinkToFarVertexButton(
                    vertexMenu
                );
                VertexHtmlCommon.addNoteButton(
                    vertexMenu
                );
                return vertexMenu;
                function removeButtonClickBehaviour(event){
                    event.stopPropagation();
                    var vertex = vertexOfSubHtmlComponent(this);
                    if (!vertex.isCenterVertex() && vertex.getId() != "default") {
                        VertexService.remove(vertex, function(vertex){
                            vertex.removeConnectedEdges();
                            vertex.remove();
                        });
                    }
                }
                function suggestionsButtonClickBehaviour(event){
                    event.stopPropagation();
                    var outOfVertexMenus = $('.peripheral-menu');
                    $(outOfVertexMenus).remove();
                    var vertex = vertexOfSubHtmlComponent(this);
                    vertex.setSuggestionMenu(
                        SuggestionMenu.ofVertex(vertex)
                            .create()
                    );
                }
                function whatIsThisButtonClickBehaviour(event){
                    event.stopPropagation();
                    var vertex = vertexOfSubHtmlComponent(this);
                    vertex.setIdentificationMenu(
                        IdentificationMenu.ofVertex(vertex)
                            .create()
                    );
                }
                function centerButtonClickBehaviour(){
                    GraphDisplayer.displayUsingNewCentralVertex(
                        vertexOfSubHtmlComponent(this)
                    );
                }
            }

            function vertexOfSubHtmlComponent(htmlOfSubComponent) {
                return Vertex.withHtml(
                    $(htmlOfSubComponent).closest('.vertex')
                );
            }

            function position() {
                $(html).css('left', serverFormat.adjustedPosition.x);
                $(html).css('top', serverFormat.adjustedPosition.y);
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
                    GraphEdge.onMouseOver,
                    GraphEdge.onMouseOut
                );

                var verticesNormalStateZIndex = $("#drawn_graph").data("verticesNormalStateZIndex");
                $('.vertex').hover(onMouseOver, onMouseOut);
                $('.vertex').css('z-index', verticesNormalStateZIndex);
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
                    if(arrowLine !== undefined){
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
                    if(arrowLine === undefined){
                        //something when wrong so return;
                        $("body").unbind(mouseUpEvent);
                        $(selectorThatCoversWholeGraph).unbind(relationMouseMoveEvent);
                        return;
                    }
                    arrowLine.remove();
                    $('.edge').hover(GraphEdge.onMouseOver, GraphEdge.onMouseOut);
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
                        VertexService.addRelationAndVertexAtPositionToVertex(
                            sourceVertex,
                            relationEndPoint,
                            function(triple){
                                triple.destinationVertex().focus();
                            }
                        );
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

