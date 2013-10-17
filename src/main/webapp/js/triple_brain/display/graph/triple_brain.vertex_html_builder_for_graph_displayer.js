/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.ui.graph",
    "triple_brain.graph_vertex",
    "triple_brain.vertex",
    "triple_brain.graph_edge",
    "triple_brain.edge",
    "triple_brain.suggestion",
    "triple_brain.mind-map_template",
    "triple_brain.external_resource",
    "triple_brain.ui.identification_menu",
    "triple_brain.ui.suggestion_menu",
    "triple_brain.straight_arrow_edge_drawer",
    "triple_brain.point",
    "triple_brain.segment",
    "triple_brain.graph_displayer",
    "triple_brain.vertex_html_builder_common",
    "triple_brain.image",
    "jquery-ui"
], function (require, $, EventBus, GraphUi, GraphVertex, VertexService, GraphEdge, EdgeService, Suggestion, MindMapTemplate, ExternalResource, IdentificationMenu, SuggestionMenu, StraightArrowEdgeDrawer, Point, Segment, GraphDisplayer, VertexHtmlCommon, Image) {
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
            var VertexService = require("triple_brain.vertex");
            var Suggestion = require("triple_brain.suggestion");
            var IdentificationMenu = require("triple_brain.ui.identification_menu");
            var SuggestionMenu = require("triple_brain.ui.suggestion_menu");
            var html = $(
                MindMapTemplate['vertex'].merge(serverFormat)
            );
            html.data(
                "uri",
                serverFormat.uri
            );
            html.uniqueId();
            this.create = function () {
                addMoveButton();
                createLabel();
                html.data(
                    "isPublic",
                    serverFormat.is_public
                );
                createMenu();
                var vertex = vertexFacade();
                vertex.setNote(
                    serverFormat.comment
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
                    stop:onDragStop
                });
                position();
                vertex.setTotalNumberOfEdges(
                    serverFormat.number_of_connected_edges
                );
                vertex[
                    serverFormat.is_public ?
                        "makePublic" :
                        "makePrivate"
                    ]();
                VertexHtmlCommon.setUpIdentifications(
                    serverFormat,
                    vertex
                );
                var images = [];
                $.each(serverFormat.images, function(){
                    var imageServerFormat = this;
                    images.push(
                        Image.fromServerJson(
                            imageServerFormat
                        )
                    );
                });
                vertex.addImages(images);
                vertex.setIncludedVertices(serverFormat.included_vertices);
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
                var labelContainer = MindMapTemplate['vertex_label_container'].merge({
                    label : serverFormat.label.trim() === "" ?
                        GraphVertex.getWhenEmptyLabel() :
                        serverFormat.label
                });
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
                    if ($(this).val() === "") {
                        $(this).val(GraphVertex.getWhenEmptyLabel());
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
                VertexHtmlCommon.applyAutoCompleteIdentificationToLabelInput(
                    label
                );
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
                if(serverFormat.included_vertices.length > 0){
                    VertexHtmlCommon.addIncludedVerticesButton(
                        vertexMenu
                    );
                }
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
                VertexHtmlCommon.addImageButton(
                    vertexMenu
                );
                VertexHtmlCommon.addPrivacyManagementButton(
                    vertexMenu
                );
                return vertexMenu;
                function removeButtonClickBehaviour(event, vertex){
                    event.stopPropagation();
                    if (!vertex.isCenterVertex() && vertex.getId() != "default") {
                        VertexService.remove(vertex, function(vertex){
                            vertex.removeConnectedEdges();
                            vertex.remove();
                        });
                    }
                }
                function suggestionsButtonClickBehaviour(event){
                    event.stopPropagation();
                    var outOfVertexMenus = $('.graph-element-menu');
                    $(outOfVertexMenus).remove();
                    var vertex = vertexOfSubHtmlComponent(this);
                    SuggestionMenu.ofVertex(
                        vertex
                    ).create();

                }
                function whatIsThisButtonClickBehaviour(event){
                    event.stopPropagation();
                    var vertex = vertexOfSubHtmlComponent(this);
                    IdentificationMenu.ofGraphElement(vertex)
                        .create();
                }
                function centerButtonClickBehaviour(){
                    GraphDisplayer.displayUsingNewCentralVertex(
                        vertexOfSubHtmlComponent(this)
                    );
                }
            }

            function vertexOfSubHtmlComponent(htmlOfSubComponent) {
                return GraphVertex.withHtml(
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
                if(vertex.hasHiddenRelations()){
                    vertex.removeHiddenPropertiesIndicator();
                }
            }

            function onDragStop(dragStopEvent, ui) {
                var vertex = vertexFacade();
                vertex.redrawConnectedEdgesArrowLine();
                if(vertex.hasHiddenRelations()){
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
                GraphVertex.setVertexMouseOver(vertex);
                vertex.makeItHighProfile();
            }

            function onMouseOut() {
                var vertex = vertexOfSubHtmlComponent(this)
                GraphVertex.unsetVertexMouseOver();
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
                    arrowLine = StraightArrowEdgeDrawer.withSegment(
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
                    var destinationVertex = GraphVertex.getVertexMouseOver();
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
                                triple.destinationVertex().scrollTo();
                            }
                        );
                    }
                });
            }
            function vertexFacade() {
                return GraphVertex.withHtml(html);
            }
        }
        return api;
    }
)

