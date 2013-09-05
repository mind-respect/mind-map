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
    "triple_brain.ui.identification_menu",
    "triple_brain.external_resource",
    "triple_brain.user_map_autocomplete_provider",
    "jquery.cursor-at-end"

],
    function (require, $, GraphUi, MindMapTemplate, IdUriUtils, VertexAndEdgeCommon, TreeEdge, EdgeService, ArrowLine, EventBus, RelativeVertex, RelativeTreeTemplates, Vertex, IdentificationMenu, ExternalResource, UserMapAutocompleteProvider) {
        var api = {};
        api.get = function (edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade) {
            return new EdgeCreator(edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade);
        };
        function EdgeCreator(edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade) {
            var uri = edgeServer.uri;
            edgeServer.uri= IdUriUtils.graphElementIdFromUri(edgeServer.uri);
            var html = RelativeTreeTemplates['edge'].merge({
                label:edgeServer.label === "" ?
                    TreeEdge.getWhenEmptyLabel() :
                    edgeServer.label
            });
            html = $(html);
            this.create = function () {
                GraphUi.addHtml(
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
                edge.setTypes([]);
                edge.setSameAs([]);
                $.each(edgeServer.types, function () {
                    var typeFromServer = this;
                    edge.addType(
                        ExternalResource.fromServerJson(
                            typeFromServer
                        )
                    );
                });

                $.each(edgeServer.same_as, function () {
                    var sameAsFromServer = this;
                    edge.addSameAs(
                        ExternalResource.fromServerJson(
                            sameAsFromServer
                        )
                    );
                });
                EventBus.publish(
                    '/event/ui/html/edge/created/',
                    edge
                );
                return edge;
            }

            function showRemoveButtonOnlyIfMouseOver(html) {
                html.hover(
                    function () {
                        var html = $(this);
                        var vertex = Vertex.withHtml(
                            html.closest(".vertex")
                        );
                        vertex.hideMenu();
                        var menu = $("<span class='relation-menu'>");
                        html.append(menu);
                        addIdentificationButton();
                        addRemoveButton();
                        function addIdentificationButton() {
                            var identificationButton = $("<button class='identification'>");
                            identificationButton.button({
                                icons:{
                                    primary:"ui-icon ui-icon-info"
                                },
                                text:false
                            });
                            menu.append(identificationButton);
                            identificationButton.on(
                                "click",
                                function(event){
                                    event.stopPropagation();
                                    IdentificationMenu.ofGraphElement(
                                        edgeFromHtml(
                                            $(this).closest(".relation")
                                        )
                                    ).create();
                                }
                            );
                        }

                        function addRemoveButton() {
                            var removeButton = $("<button>");
                            menu.append(
                                removeButton
                            );
                            removeButton.button({
                                icons:{
                                    primary:"ui-icon ui-icon-trash"
                                },
                                text:false
                            });
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
                        }

                    },
                    function () {
                        var html = $(this);
                        Vertex.withHtml(
                            html.closest(".vertex")
                        ).showMenu();
                        html.find(".relation-menu").remove();
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
                input.data(
                    "types",
                    previousEdge.getTypes()
                );
                input.data(
                    "sameAs",
                    previousEdge.getSameAs()
                );
                if (input.val() === TreeEdge.getWhenEmptyLabel()) {
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
                input.tripleBrainAutocomplete({
                    select:function (event, ui) {
                        var edge = edgeFromHtml($(this));
                        var identificationResource = ExternalResource.fromSearchResult(
                            ui.item
                        );
                        EdgeService.addSameAs(
                            edge,
                            identificationResource
                        );
                    },
                    resultsProviders : [
                        UserMapAutocompleteProvider.toFetchRelations()
                    ]
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
                var label = previousEdge.text();
                previousEdge.setText(label);
                var html = RelativeTreeTemplates['edge'].merge({
                    label:label.trim() === "" ?
                        TreeEdge.getWhenEmptyLabel() :
                        previousEdge.text()
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
                html.data(
                    "types",
                    previousEdge.getTypes()
                );
                html.data(
                    "sameAs",
                    previousEdge.getSameAs()
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
                vertex.adjustWidth();
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