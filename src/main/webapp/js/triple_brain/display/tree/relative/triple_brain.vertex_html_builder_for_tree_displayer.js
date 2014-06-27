/**
 * Copyright Mozilla Public License 1.1
 */

define([
        "jquery",
        "triple_brain.event_bus",
        "triple_brain.vertex",
        "triple_brain.ui.edge",
        "triple_brain.edge",
        "triple_brain.mind-map_template",
        "triple_brain.point",
        "triple_brain.segment",
        "triple_brain.graph_displayer",
        "triple_brain.relative_tree_vertex",
        "triple_brain.ui.vertex_and_edge_common",
        "triple_brain.ui.triple",
        "triple_brain.vertex_html_builder_common",
        "triple_brain.selection_handler",
        "triple_brain.keyboard_utils",
        "triple_brain.relative_tree_vertex_menu_handler",
        "jquery-ui",
        "jquery.is-fully-on-screen",
        "jquery.center-on-screen"
    ], function ($, EventBus, VertexService, EdgeUi, EdgeService, MindMapTemplate, Point, Segment, GraphDisplayer, RelativeTreeVertex, VertexAndEdgeCommon, Triple, VertexHtmlCommon, SelectionHandler, KeyboardUtils, RelativeTreeVertexMenuHandler) {
        var api = {};
        api.withServerFacade = function (serverFacade) {
            return new VertexCreator(serverFacade);
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
                        icons: {
                            primary: "ui-icon ui-icon-link"
                        },
                        text: false
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
        api.completeBuild = function(vertex){
            vertex.refreshImages();
            api.addDuplicateVerticesButtonIfApplicable(
                vertex
            );
            if (vertex.isToTheLeft()) {
                var noteButton = vertex.getNoteButtonInBubbleContent();
                noteButton.next(".overlay-container").after(noteButton);
            }
        };
        EventBus.subscribe(
            '/event/ui/vertex/visit_after_graph_drawn',
            handleVisitAfterGraphDrawn
        );
        return api;
        function handleVisitAfterGraphDrawn(event, vertex) {
            api.completeBuild(vertex);
        }

        function VertexCreator(serverFacade) {
            var html = $(
                MindMapTemplate['relative_vertex'].merge()
            );
            html.data(
                "uri",
                serverFacade.getUri()
            ).on(
                "dblclick",
                function (event) {
                    event.stopPropagation();
                    var vertex = RelativeTreeVertex.withHtml(
                        $(this)
                    );
                    SelectionHandler.removeAll();
                    vertex.getLabel().focus().setCursorToEndOfText();
                }
            ).on(
                "click",
                function (event) {
                    event.stopPropagation();
                    var vertex = RelativeTreeVertex.withHtml(
                        $(this)
                    );
                    if (KeyboardUtils.isCtrlPressed()) {
                        if (vertex.isSelected()) {
                            SelectionHandler.removeBubble(vertex);
                        } else {
                            SelectionHandler.addBubble(vertex);
                        }
                    } else {
                        SelectionHandler.setToSingleBubble(
                            vertex
                        );
                    }
                }
            );
            html.uniqueId();
            var vertex;
            this.create = function () {
                vertex = vertexFacade();
                vertex.setTotalNumberOfEdges(
                    serverFacade.getNumberOfConnectedEdges()
                );
                buildLabelHtml(
                    buildInsideBubbleContainer()
                );
                html.data(
                    "isPublic",
                    serverFacade.isPublic()
                );
                vertex.setIncludedVertices(serverFacade.getIncludedVertices());
                vertex.setIncludedEdges(serverFacade.getIncludedEdges());
                if (vertex.hasIncludedGraphElements()) {
                    showItHasIncludedGraphElements();
                }
                vertex.setNote(
                    serverFacade.getComment()
                );
                createMenu();
                addNoteButtonNextToLabel();
                vertex.addSuggestions(
                    serverFacade.getSuggestions()
                );
                vertex.hideMenu();
                vertex.getInBubbleContainer().hover(
                    onMouseOver,
                    onMouseOut
                );

                VertexHtmlCommon.listenForUpdates(
                    serverFacade
                );
                VertexHtmlCommon.setUpIdentifications(
                    serverFacade,
                    vertex
                );
                vertex.addImages(
                    serverFacade.getImages()
                );
                vertex.makeItLowProfile();
                vertex.setOriginalServerObject(
                    serverFacade
                );
                vertex.getHtml().append(
                    "<span class='arrow'>"
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
                        serverFacade.getLabel().trim() === "" ?
                        RelativeTreeVertex.getWhenEmptyLabel() :
                        serverFacade.getLabel()
                ).appendTo(labelContainer);
                if (vertex.hasDefaultText()) {
                    vertex.applyStyleOfDefaultText();
                }
                label.focus(function () {
                    var vertex = vertexOfSubHtmlComponent(this);
                    vertex.highlight();
                    vertex.removeStyleOfDefaultText();
                    if (vertex.hasDefaultText()) {
                        $(this).val("");
                        vertex.getLabel().keyup();
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
                        vertex.getLabel().keyup();
                    } else {
                        vertex.removeStyleOfDefaultText();
                    }
                }).change(function () {
                    var vertex = vertexOfSubHtmlComponent(this);
                    vertex.getLabel().keyup();
                    VertexService.updateLabel(
                        vertexOfSubHtmlComponent(this),
                        $(this).val()
                    );
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

            function addNoteButtonNextToLabel() {
                var noteButton = vertex.getNoteButtonInMenu().clone().on(
                    "click", clickHandler
                );
                noteButton[
                    vertex.hasNote() ?
                        "show" :
                        "hide"
                    ]();
                vertex.getInBubbleContainer().find("> .overlay-container").before(
                    noteButton
                );
                function clickHandler(event) {
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

