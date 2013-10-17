/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.ui.graph",
    "triple_brain.vertex",
    "triple_brain.ui.edge",
    "triple_brain.edge",
    "triple_brain.suggestion",
    "triple_brain.mind-map_template",
    "triple_brain.external_resource",
    "triple_brain.ui.identification_menu",
    "triple_brain.ui.suggestion_menu",
    "triple_brain.point",
    "triple_brain.segment",
    "triple_brain.graph_displayer",
    "triple_brain.relative_tree_vertex",
    "triple_brain.ui.vertex_and_edge_common",
    "triple_brain.ui.triple",
    "triple_brain.vertex_html_builder_common",
    "triple_brain.image",
    "triple_brain.ui.utils",
    "jquery-ui",
    "jquery.is-fully-on-screen",
    "jquery.center-on-screen"
], function (require, $, EventBus, GraphUi, VertexService, EdgeUi, EdgeService, Suggestion, MindMapTemplate, ExternalResource, IdentificationMenu, SuggestionMenu, Point, Segment, GraphDisplayer, RelativeTreeVertex, VertexAndEdgeCommon, Triple, VertexHtmlCommon, Image, UiUtils) {
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
                vertex.getTextContainer().prepend(
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
                    function () {
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
            if("relative_tree" === GraphDisplayer.name()){
                api.addDuplicateVerticesButtonIfApplicable(
                    vertex
                );
            }
        }

        function VertexCreator(serverFormat) {
            var VertexService = require("triple_brain.vertex");
            var Suggestion = require("triple_brain.suggestion");
            var IdentificationMenu = require("triple_brain.ui.identification_menu");
            var SuggestionMenu = require("triple_brain.ui.suggestion_menu");
            var html = $(
                MindMapTemplate['relative_vertex'].merge(serverFormat)
            );
            html.data(
                "uri",
                serverFormat.uri
            );
            html.uniqueId();
            this.create = function () {
                var vertex = vertexFacade();
                vertex.setTotalNumberOfEdges(
                    serverFormat.number_of_connected_edges
                );
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
                vertex.hideButtons();
                $(html).hover(
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
                vertex.setIncludedVertices(serverFormat.included_vertices);
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
            function createLabel() {
                var labelContainer = $(MindMapTemplate['vertex_label_container'].merge({
                    label:serverFormat.label.trim() === "" ?
                        RelativeTreeVertex.getWhenEmptyLabel() :
                        serverFormat.label
                })).appendTo(html);
                var label = labelContainer.find("input[type='text']:first");
                var vertex = vertexFacade();
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
                        if ($(this).val() == "") {
                            $(this).val(RelativeTreeVertex.getWhenEmptyLabel());
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
                    });

                label.keyup(function () {
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

            function createMenu() {
                var vertexMenu = MindMapTemplate['vertex_menu'].merge();
                $(html).append(vertexMenu);
                VertexHtmlCommon.addPlusButton(
                    vertexMenu,
                    addButtonClickBehaviour
                );
                VertexHtmlCommon.addRemoveButton(
                    vertexMenu,
                    removeButtonClickBehaviour
                );
                if (serverFormat.included_vertices.length > 0) {
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
                VertexHtmlCommon.addNoteButton(
                    vertexMenu
                );
                VertexHtmlCommon.addImageButton(
                    vertexMenu
                );
                VertexHtmlCommon.addLinkToFarVertexButton(
                    vertexMenu
                );
                VertexHtmlCommon.addPrivacyManagementButton(
                    vertexMenu
                );
                function addButtonClickBehaviour() {
                    var sourceVertex = vertexFacade();
                    VertexService.addRelationAndVertexToVertex(
                        sourceVertex, function (triple, tripleServerFormat) {
                            var sourceVertex = RelativeTreeVertex.ofVertex(
                                triple.sourceVertex()
                            );
                            var destinationHtml = triple.destinationVertex().getHtml();
                            if (!UiUtils.isElementFullyOnScreen(destinationHtml)) {
                                destinationHtml.centerOnScreenWithAnimation();
                            }
                            RelativeTreeVertex.ofVertex(
                                triple.destinationVertex()
                            ).resetOtherInstances();
                            sourceVertex.applyToOtherInstances(function (vertex) {
                                Triple.createUsingServerTriple(
                                    vertex,
                                    tripleServerFormat
                                );

                            });
                        }
                    );
                }
                function removeButtonClickBehaviour(event, vertex) {
                    event.stopPropagation();
                    if (!vertex.isCenterVertex() && vertex.getId() != "default") {
                        VertexService.remove(vertex, function (vertex) {
                            removeChildren(vertex);
                            RelativeTreeVertex.ofVertex(vertex).applyToOtherInstances(function (vertex) {
                                removeChildren(vertex);
                                removeEdges(vertex);
                            });
                            removeEdges(vertex);
                            EdgeUi.redrawAllEdges();
                            function removeChildren(vertex) {
                                var relativeVertex = RelativeTreeVertex.ofVertex(
                                    vertex
                                );
                                relativeVertex.visitChildren(function (childVertex) {
                                    vertex.removeConnectedEdges();
                                    childVertex.remove();
                                });
                            }

                            function removeEdges(vertex) {
                                vertex.removeConnectedEdges();
                                vertex.remove();
                            }
                        });
                    }
                }

                function suggestionsButtonClickBehaviour(event) {
                    event.stopPropagation();
                    var outOfVertexMenus = $('.graph-element-menu');
                    $(outOfVertexMenus).remove();
                    var vertex = vertexOfSubHtmlComponent(this);
                    SuggestionMenu.ofVertex(
                        vertex
                    ).create();
                }

                function whatIsThisButtonClickBehaviour(event) {
                    event.stopPropagation();
                    var vertex = vertexOfSubHtmlComponent(this);
                    IdentificationMenu.ofGraphElement(
                        vertex
                    ).create();

                }

                function centerButtonClickBehaviour() {
                    GraphDisplayer.displayUsingNewCentralVertex(
                        vertexOfSubHtmlComponent(this)
                    );
                }

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

