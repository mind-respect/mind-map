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
    "triple_brain.ui.arrow_line",
    "triple_brain.point",
    "triple_brain.segment",
    "triple_brain.graph_displayer",
    "triple_brain.relative_vertex",
    "triple_brain.tree_vertex",
    "triple_brain.ui.vertex_and_edge_common",
    "triple_brain.ui.triple",
    "triple_brain.vertex_html_builder_common",
    "jquery-ui"
], function (require, $, EventBus, GraphUi, Vertex, VertexService, EdgeUi, EdgeService, Suggestion, MindMapTemplate, ExternalResource, IdentificationMenu, SuggestionMenu, ArrowLine, Point, Segment, GraphDisplayer, RelativeVertex, TreeVertex, VertexAndEdgeCommon, Triple, VertexHtmlCommon) {
        var api = {};
        api.withServerJson = function (serverVertex) {
            return new VertexCreator(serverVertex);
        };
        function VertexCreator(serverFormat) {
            var Vertex = require("triple_brain.ui.vertex");
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
                createLabel();
                html.data(
                    "isPublic",
                    serverFormat.is_public
                );
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
                vertex.hideButtons();
                $(html).hover(
                    onMouseOver,
                    onMouseOut
                );
                vertex.setNameOfHiddenProperties(
                    serverFormat.is_frontier_vertex_with_hidden_vertices ?
                        serverFormat.name_of_hidden_properties :
                        []
                );
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
                var labelContainer = MindMapTemplate['vertex_label_container'].merge({
                    label:serverFormat.label.trim() === "" ?
                        Vertex.getWhenEmptyLabel() :
                        serverFormat.label
                });
                $(html).append(labelContainer);
                var label = $(labelContainer).find("input[type='text']:first");
                var vertex = vertexFacade();
                vertex.readjustLabelWidth();
                if (vertex.hasDefaultText()) {
                    vertex.applyStyleOfDefaultText();
                }
                label.focus(function(){
                    var vertex = vertexOfSubHtmlComponent(this);
                    vertex.highlight();
                    vertex.removeStyleOfDefaultText();
                    if (vertex.hasDefaultText()) {
                        $(this).val("");
                        $(vertex.label()).keyup();
                    }
                });
                label.blur(function (e) {
                    var vertex = vertexOfSubHtmlComponent(this);
                    if (!vertex.isMouseOver()) {
                        vertex.unhighlight();
                    }
                    if ($(this).val() == "") {
                        $(this).val(Vertex.getWhenEmptyLabel());
                        vertex.applyStyleOfDefaultText();
                        $(vertex.label()).keyup();
                    } else {
                        vertex.removeStyleOfDefaultText();
                    }
                });

                label.change(function (e) {
                    var vertex = vertexOfSubHtmlComponent(this);
                    $(vertex.label()).keyup();
                    VertexService.updateLabel(
                        vertexOfSubHtmlComponent(this),
                        $(this).val(),
                        function (vertex) {
                            var otherInstances = TreeVertex.ofVertex(
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
                    var relativeVertex = RelativeVertex.withVertex(vertex);
                    relativeVertex.adjustPositionIfApplicable();
                    relativeVertex.adjustAllChildrenPositionIfApplicable();
                    var otherInstances = TreeVertex.withHtml(
                        html
                    ).getOtherInstances();
                    $.each(otherInstances, function () {
                        var relativeVertex = RelativeVertex.withVertex(
                            this
                        );
                        relativeVertex.adjustPositionIfApplicable();
                        relativeVertex.adjustAllChildrenPositionIfApplicable();
                    });
                    EdgeUi.redrawAllEdges();
                });

                label.keyup(function (e) {
                    var vertex = vertexOfSubHtmlComponent(this);
                    var html = vertex.getHtml();
                    updateLabelsOfVerticesWithSameUri();
                    vertex.readjustLabelWidth();
                    function updateLabelsOfVerticesWithSameUri() {
                        var text = vertex.text();
                        var otherInstances = TreeVertex.withHtml(
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
                            var sourceVertex = TreeVertex.ofVertex(
                                triple.sourceVertex()
                            );
                            triple.destinationVertex().focus();
                            TreeVertex.ofVertex(
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

                function removeButtonClickBehaviour(event) {
                    event.stopPropagation();
                    var vertex = vertexOfSubHtmlComponent(this);
                    if (!vertex.isCenterVertex() && vertex.getId() != "default") {
                        VertexService.remove(vertex, function (vertex) {
                            removeChildren(vertex);
                            TreeVertex.ofVertex(vertex).applyToOtherInstances(function (vertex) {
                                removeChildren(vertex);
                                removeEdges(vertex);
                            });
                            removeEdges(vertex);
                            EdgeUi.redrawAllEdges();
                            function removeChildren(vertex) {
                                var relativeVertex = RelativeVertex.withVertex(
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

            function vertexFacade() {
                return Vertex.withHtml(html);
            }
        }

        return api;
    }
)

