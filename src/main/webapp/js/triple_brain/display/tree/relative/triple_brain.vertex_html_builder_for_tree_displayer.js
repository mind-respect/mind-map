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
        "triple_brain.mind_map_info",
        "jquery-ui",
        "jquery.is-fully-on-screen",
        "jquery.center-on-screen"
    ], function ($, EventBus, VertexService, EdgeUi, EdgeService, MindMapTemplate, Point, Segment, GraphDisplayer, RelativeTreeVertex, VertexAndEdgeCommon, Triple, VertexHtmlCommon, SelectionHandler, KeyboardUtils, RelativeTreeVertexMenuHandler, MindMapInfo) {
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
                    "<button class='duplicate graph-element-button'>"
                ).append(
                    $("<i class='fa fa-link'>")
                ).on(
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
        api.completeBuild = function (vertex) {
            vertex.refreshImages();
            api.addDuplicateVerticesButtonIfApplicable(
                vertex
            );
            if (vertex.isToTheLeft()) {
                var noteButton = vertex.getNoteButtonInBubbleContent();
                noteButton.next(".overlay-container").after(noteButton);
            }
            if (vertex.hasHiddenRelations()) {
                vertex.buildHiddenNeighborPropertiesIndicator();
            }
        };
        EventBus.subscribe(
            '/event/ui/vertex/visit_after_graph_drawn',
            handleVisitAfterGraphDrawn
        );
        function handleVisitAfterGraphDrawn(event, vertex) {
            api.completeBuild(vertex);
        }

        function VertexCreator(serverFacade) {
            this.serverFacade = serverFacade;
            this.html = $(
                MindMapTemplate['relative_vertex'].merge()
            ).data(
                "uri",
                serverFacade.getUri()
            ).on(
                "click",
                function (event) {
                    event.stopPropagation();
                    var vertex = RelativeTreeVertex.withHtml(
                        $(this)
                    );
                    if (KeyboardUtils.isCtrlPressed()) {
                        if (vertex.isSelected()) {
                            SelectionHandler.removeVertex(vertex);
                        } else {
                            SelectionHandler.addVertex(vertex);
                        }
                    } else {
                        SelectionHandler.setToSingleVertex(
                            vertex
                        );
                    }
                }
            );
            if (!MindMapInfo.isViewOnly()) {
                this.html.on(
                    "dblclick",
                    function (event) {
                        event.stopPropagation();
                        var vertex = RelativeTreeVertex.withHtml(
                            $(this)
                        );
                        SelectionHandler.removeAll();
                        vertex.getLabel().focus().setCursorToEndOfText();
                    }
                )
            }
        }

        VertexCreator.prototype.create = function (htmlId) {
            this.html.attr('id', htmlId);
            this.vertex = new RelativeTreeVertex.Object(
                this.html
            );
            RelativeTreeVertex.initCache(
                this.vertex
            );
            VertexHtmlCommon.initCache(
                this.vertex
            );
            this.vertex.setTotalNumberOfEdges(
                this.serverFacade.getNumberOfConnectedEdges()
            );
            this._buildLabelHtml(
                this._buildInsideBubbleContainer()
            );
            this.html.data(
                "isPublic",
                this.serverFacade.isPublic()
            );
            this.vertex.setIncludedVertices(
                this.serverFacade.getIncludedVertices()
            );
            this.vertex.setIncludedEdges(
                this.serverFacade.getIncludedEdges()
            );
            if (this.vertex.hasIncludedGraphElements()) {
                this._showItHasIncludedGraphElements();
            }
            this.vertex.setNote(
                this.serverFacade.getComment()
            );
            this._createMenu();
            this._addNoteButtonNextToLabel();
            this.vertex.addSuggestions(
                this.serverFacade.getSuggestions()
            );
            this.vertex.hideMenu();
            this.vertex.getInBubbleContainer().hover(
                onMouseOver,
                onMouseOut
            );
            VertexHtmlCommon.setUpIdentifications(
                this.serverFacade,
                this.vertex
            );
            this.vertex.addImages(
                this.serverFacade.getImages()
            );
            this.vertex.makeItLowProfile();
            this.vertex.setOriginalServerObject(
                this.serverFacade
            );
            this.vertex.getHtml().append(
                "<span class='arrow'>"
            );
            this.vertex.isPublic() ?
                this.vertex.makePublic() :
                this.vertex.makePrivate();
            EventBus.publish(
                '/event/ui/html/vertex/created/',
                this.vertex
            );
            return this.vertex;
        };

        VertexCreator.prototype._buildInsideBubbleContainer = function () {
            return $(
                "<div class='in-bubble-content'>"
            ).appendTo(this.html);
        };

        VertexCreator.prototype._buildLabelHtml = function (inContentContainer) {
            var labelContainer = $(
                    "<div class='overlay-container'>"
                ).appendTo(
                    inContentContainer
                ),
                overlay = $("<div class='overlay'>").appendTo(
                    labelContainer
                ),
                label = $(
                    "<input type='text' class='label'>"
                ).val(
                        this.serverFacade.getLabel().trim() === "" ?
                        RelativeTreeVertex.getWhenEmptyLabel() :
                        this.serverFacade.getLabel()
                ).appendTo(labelContainer);
            if (this.vertex.hasDefaultText()) {
                this.vertex.applyStyleOfDefaultText();
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
        };

        VertexCreator.prototype._showItHasIncludedGraphElements = function () {
            this.html.append(
                $("<div class='included-graph-elements-flag'>").text(
                    ". . ."
                )
            ).addClass("includes-vertices");
        };

        VertexCreator.prototype._addNoteButtonNextToLabel = function () {
            var noteButton = this.vertex.getNoteButtonInMenu().clone().on(
                "click", clickHandler
            );
            noteButton[
                this.vertex.hasNote() ?
                    "show" :
                    "hide"
                ]();
            this.vertex.getInBubbleContainer().find("> .overlay-container").before(
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
        };

        VertexCreator.prototype._createMenu = function () {
            var vertexMenu = $(
                MindMapTemplate['vertex_menu'].merge()
            );
            this.html.append(vertexMenu);
            VertexHtmlCommon.addRelevantButtonsInMenu(
                vertexMenu
            );
            return vertexMenu;
        };

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

        function vertexOfSubHtmlComponent(htmlOfSubComponent) {
            return RelativeTreeVertex.withHtml(
                $(htmlOfSubComponent).closest('.vertex')
            );
        }

        return api;
    }
);

