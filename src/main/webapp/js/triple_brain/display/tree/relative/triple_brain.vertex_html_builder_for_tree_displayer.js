/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.vertex",
    "triple_brain.ui.edge",
    "triple_brain.edge",
    "triple_brain.suggestion",
    "triple_brain.mind-map_template",
    "triple_brain.external_resource",
    "triple_brain.point",
    "triple_brain.segment",
    "triple_brain.graph_displayer",
    "triple_brain.relative_tree_vertex",
    "triple_brain.ui.vertex_and_edge_common",
    "triple_brain.ui.triple",
    "triple_brain.vertex_html_builder_common",
    "triple_brain.image",
    "triple_brain.selection_handler",
    "triple_brain.keyboard_utils",
    "triple_brain.relative_tree_vertex_menu_handler",
    "jquery-ui",
    "jquery.is-fully-on-screen",
    "jquery.center-on-screen"
], function (require, $, EventBus, VertexService, EdgeUi, EdgeService, Suggestion, MindMapTemplate, ExternalResource, Point, Segment, GraphDisplayer, RelativeTreeVertex, VertexAndEdgeCommon, Triple, VertexHtmlCommon, Image, SelectionHandler, KeyboardUtils, RelativeTreeVertexMenuHandler) {
        var api = {};
        api.withServerJson = function (serverVertex) {
            return new VertexCreator(serverVertex);
        };
        api.addDuplicateVerticesButtonIfApplicable = function (vertex) {
            var otherInstances = vertex.getOtherInstances();
            if (otherInstances.length === 0) {
                return;
            }
            addDuplicateButton(vertex);
            $.each(otherInstances, function () {
                var otherInstance = this;
                otherInstance.resetOtherInstances();
                if (!otherInstance.hasTheDuplicateButton()) {
                    addDuplicateButton(otherInstance);
                }
            });
            function addDuplicateButton(vertex) {
                vertex.getInBubbleContainer().prepend(
                    buildDuplicateButton()
                );
            }

            function buildDuplicateButton() {
                return $(
                    "<button class='duplicate'>"
                ).button({
                        icons:{
                            primary:"ui-icon ui-icon-link"
                        },
                        text:false
                    }).on(
                    "click",
                    function (event) {
                        event.stopPropagation();
                        var vertex = vertexOfSubHtmlComponent($(this));
                        $(
                            vertex.getOtherInstances()[0].getHtml()
                        ).centerOnScreenWithAnimation();
                    }
                );
            }
        };
        EventBus.subscribe(
            '/event/ui/vertex/visit_after_graph_drawn',
            handleVisitAfterGraphDrawn
        );
        return api;
        function handleVisitAfterGraphDrawn(event, vertex) {
            if ("relative_tree" === GraphDisplayer.name()) {
                api.addDuplicateVerticesButtonIfApplicable(
                    vertex
                );
            }
            if(vertex.isToTheLeft()){
                var noteButton = vertex.getNoteButtonInBubbleContent();
                noteButton.next(".overlay-container").after(noteButton);
            }
        }
        function VertexCreator(serverFormat) {
            var VertexService = require("triple_brain.vertex");
            var Suggestion = require("triple_brain.suggestion");
            var html = $(
                MindMapTemplate['relative_vertex'].merge(serverFormat)
            );
            html.data(
                "uri",
                serverFormat.uri
            ).on(
                "dblclick",
                function (event) {
                    event.stopPropagation();
                    var vertex = RelativeTreeVertex.withHtml(
                        $(this)
                    );
                    vertex.deselect();
                    SelectionHandler.refreshSelectionMenu();
                    vertex.getLabel().focus().setCursorToEndOfText();
                }
            ).on(
                "click",
                function () {
                    var vertex = RelativeTreeVertex.withHtml(
                        $(this)
                    );
                    if (KeyboardUtils.isCtrlPressed()) {
                        if (vertex.isSelected()) {
                            vertex.deselect();
                        } else {
                            vertex.select();
                        }
                    } else {
                        SelectionHandler.reset();
                        vertex.select();
                    }
                    SelectionHandler.refreshSelectionMenu();
                }
            );
            html.uniqueId();
            var vertex;
            this.create = function () {
                vertex = vertexFacade();
                vertex.setTotalNumberOfEdges(
                    serverFormat.number_of_connected_edges
                );
                buildLabelHtml(
                    buildInsideBubbleContainer()
                );
                html.data(
                    "isPublic",
                    serverFormat.is_public
                );
                vertex.setIncludedVertices(serverFormat.included_vertices);
                vertex.setIncludedEdges(serverFormat.included_edges);
                if (vertex.hasIncludedGraphElements()) {
                    showItHasIncludedGraphElements();
                }
                vertex.setNote(
                    serverFormat.comment
                );
                createMenu();
                addNoteButtonNextToLabel();
                vertex.addSuggestions(
                    Suggestion.fromJsonArrayOfServer(
                        serverFormat.suggestions
                    )
                );
                vertex.hideButtons();
                html.hover(
                    onMouseOver,
                    onMouseOut
                );

                VertexHtmlCommon.setUpIdentifications(
                    serverFormat,
                    vertex
                );
                var images = [];
                $.each(serverFormat.images, function () {
                    var imageServerFormat = this;
                    images.push(
                        Image.fromServerJson(
                            imageServerFormat
                        )
                    );
                });
                vertex.addImages(images);
                vertex.makeItLowProfile();
                vertex.setOriginalServerObject(
                    serverFormat
                );
                vertex.isPublic() ?
                    vertex.makePublic() :
                    vertex.makePrivate();
                EventBus.publish(
                    '/event/ui/html/vertex/created/',
                    vertex
                );
                return vertex;
            };
            function buildInsideBubbleContainer() {
                return $(
                    "<div class='in-bubble-content'>"
                ).appendTo(html);
            }

            function buildLabelHtml(inContentContainer) {
                var labelContainer = $(
                    "<div class='overlay-container'>"
                ).appendTo(
                    inContentContainer
                );
                var overlay = $("<div class='overlay'>").appendTo(
                    labelContainer
                );
                var label = $(
                    "<input type='text' class='label'>"
                ).val(
                    serverFormat.label.trim() === "" ?
                        RelativeTreeVertex.getWhenEmptyLabel() :
                        serverFormat.label
                ).appendTo(labelContainer);
                vertex.readjustLabelWidth();
                if (vertex.hasDefaultText()) {
                    vertex.applyStyleOfDefaultText();
                }
                label.focus(function () {
                    var vertex = vertexOfSubHtmlComponent(this);
                    vertex.highlight();
                    vertex.removeStyleOfDefaultText();
                    if (vertex.hasDefaultText()) {
                        $(this).val("");
                        $(vertex.label()).keyup();
                    }
                }).blur(function () {
                        var vertex = vertexOfSubHtmlComponent(this);
                        if (!vertex.isMouseOver()) {
                            vertex.unhighlight();
                        }
                        if ("" === $(this).val()) {
                            $(this).val(
                                RelativeTreeVertex.getWhenEmptyLabel()
                            );
                            vertex.applyStyleOfDefaultText();
                            $(vertex.label()).keyup();
                        } else {
                            vertex.removeStyleOfDefaultText();
                        }
                    }).change(function () {
                        var vertex = vertexOfSubHtmlComponent(this);
                        $(vertex.label()).keyup();
                        VertexService.updateLabel(
                            vertexOfSubHtmlComponent(this),
                            $(this).val(),
                            function (vertex) {
                                var otherInstances = RelativeTreeVertex.ofVertex(
                                    vertex
                                ).getOtherInstances();
                                $.each(otherInstances, function () {
                                    var vertex = this;
                                    VertexAndEdgeCommon.highlightLabel(
                                        vertex.getId()
                                    );
                                });
                            }
                        );
                        var relativeVertex = RelativeTreeVertex.ofVertex(vertex);
                        relativeVertex.adjustPositionIfApplicable();
                        relativeVertex.adjustAllChildrenPositionIfApplicable();
                        var otherInstances = RelativeTreeVertex.withHtml(
                            html
                        ).getOtherInstances();
                        $.each(otherInstances, function () {
                            var relativeVertex = RelativeTreeVertex.ofVertex(
                                this
                            );
                            relativeVertex.adjustPositionIfApplicable();
                            relativeVertex.adjustAllChildrenPositionIfApplicable();
                        });
                        EdgeUi.redrawAllEdges();
                    }).keyup(function () {
                        var vertex = vertexOfSubHtmlComponent(this);
                        var html = vertex.getHtml();
                        updateLabelsOfVerticesWithSameUri();
                        vertex.readjustLabelWidth();
                        function updateLabelsOfVerticesWithSameUri() {
                            var text = vertex.text();
                            var otherInstances = RelativeTreeVertex.withHtml(
                                html
                            ).getOtherInstances();
                            $.each(otherInstances, function () {
                                var sameVertex = this;
                                sameVertex.setText(
                                    text
                                );
                                sameVertex.readjustLabelWidth();
                            });
                        }
                    });
                VertexHtmlCommon.applyAutoCompleteIdentificationToLabelInput(
                    label
                );
                return labelContainer;
            }

            function showItHasIncludedGraphElements() {
                html.append(
                    $("<div class='included-graph-elements-flag'>").text(
                        ". . ."
                    )
                ).addClass("includes-vertices")
            }
            function addNoteButtonNextToLabel(){
                var noteButton = vertex.getMenuHtml().find(
                    "> .note-button"
                ).clone().on(
                    "click", clickHandler
                );
                if(!vertex.hasNote()){
                    noteButton.hide();
                }
                vertex.getInBubbleContainer().find("> .overlay-container").before(
                    noteButton
                );
                function clickHandler(event){
                    var button = $(this);
                    RelativeTreeVertexMenuHandler.forSingle().note(
                        event,
                        RelativeTreeVertex.withHtml(
                            button.closest(".vertex")
                        )
                    );
                }
            }
            function createMenu() {
                var vertexMenu = $(
                    MindMapTemplate['vertex_menu'].merge()
                );
                html.append(vertexMenu);
                VertexHtmlCommon.addRelevantButtonsInMenu(
                    vertexMenu
                );
                return vertexMenu;
            }

            function onMouseOver() {
                var vertex = vertexOfSubHtmlComponent(this);
                RelativeTreeVertex.setVertexMouseOver(vertex);
                vertex.makeItHighProfile();
            }

            function onMouseOut() {
                var vertex = vertexOfSubHtmlComponent(this);
                RelativeTreeVertex.unsetVertexMouseOver();
                vertex.makeItLowProfile();
            }

            function vertexFacade() {
                return RelativeTreeVertex.withHtml(html);
            }
        }

        function vertexOfSubHtmlComponent(htmlOfSubComponent) {
            return RelativeTreeVertex.withHtml(
                $(htmlOfSubComponent).closest('.vertex')
            );
        }
    }
);

