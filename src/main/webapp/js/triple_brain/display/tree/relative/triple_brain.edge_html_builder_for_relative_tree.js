/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.mind-map_template",
    "triple_brain.ui.vertex_and_edge_common",
    "triple_brain.tree_edge",
    "triple_brain.edge",
    "triple_brain.event_bus",
    "triple_brain.relative_tree_vertex",
    "triple_brain.relative_tree_displayer_templates",
    "triple_brain.ui.identification_menu",
    "triple_brain.external_resource",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.freebase_autocomplete_provider",
    "triple_brain.graph_displayer",
    "triple_brain.keyboard_utils",
    "triple_brain.selection_handler",
    "jquery.cursor-at-end"
],
    function (require, $, MindMapTemplate, VertexAndEdgeCommon, TreeEdge, EdgeService, EventBus, RelativeTreeVertex, RelativeTreeTemplates, IdentificationMenu, ExternalResource, UserMapAutocompleteProvider, FreebaseAutocompleteProvider, GraphDisplayer, KeyboardUtils, SelectionHandler) {
        var api = {};
        api.get = function (edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade) {
            return new EdgeCreator(edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade);
        };
        function EdgeCreator(edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade) {
            var uri = edgeServer.uri;
            var html = $(
                "<span>"
            ).addClass(
                "relation"
            ).css("display", "inline");
            this.create = function () {
                var isInverse = edgeServer.source_vertex_id !== parentVertexHtmlFacade.getUri();
                if (isInverse) {
                    html.addClass("inverse");
                }
                html.data(
                    "source_vertex_id",
                    isInverse ? childVertexHtmlFacade.getId() : parentVertexHtmlFacade.getId()
                ).data(
                    "destination_vertex_id",
                    isInverse ? parentVertexHtmlFacade.getId() : childVertexHtmlFacade.getId()
                );
                var inBubbleContainer = childVertexHtmlFacade.getInBubbleContainer();
                var isToTheLeft = childVertexHtmlFacade.isToTheLeft();
                html[isToTheLeft ? "appendTo" : "prependTo"](
                    inBubbleContainer
                ).css(
                    isToTheLeft ? "margin-left" : "margin-right", "1em"
                ).append(html);
                buildNonInputLabel(
                    html,
                    edgeServer.label
                ).show();
                childVertexHtmlFacade.adjustWidth();
                if (isToTheLeft) {
                    childVertexHtmlFacade.adjustPosition();
                }
                drawArrowLine();
                var edge = edgeFacade();
                buildLabelAsInput(edge).hide();
                buildMenu(edge);
                edge.hideMenu();
                edge.setUri(uri);
                edge.setTypes([]);
                edge.setSameAs([]);
                edge.setGenericIdentifications([]);
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
            };
            function buildMenu(edge){
                var edgeHtml = edge.getHtml();
                var vertex = RelativeTreeVertex.withHtml(
                    edgeHtml.closest(".vertex")
                );
                var menu = $("<span class='relation-menu'>");
                edgeHtml.append(menu);
                addIdentificationButton();
                addInverseButton();
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
                        function (event) {
                            event.stopPropagation();
                            IdentificationMenu.ofGraphElement(
                                edgeFromHtml(
                                    $(this)
                                )
                            ).create();
                        }
                    );
                }

                function addInverseButton() {
                    var buttonClass = vertex.isToTheLeft() ?
                        "ui-icon-arrowreturnthick-1-e" :
                        "ui-icon-arrowreturnthick-1-w";
                    $(
                        "<button>"
                    ).appendTo(
                        menu
                    ).button({
                            icons:{
                                primary:"ui-icon " + buttonClass
                            },
                            text:false
                        }).on(
                        "click",
                        function(event){
                            event.stopPropagation();
                            var edge = edgeFromHtml(this);
                            EdgeService.inverse(
                                edge,
                                edge.inverse
                            );
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
                            $(this)
                        );
                        EdgeService.remove(edge,
                            function (edge) {
                                var vertex = edge.childVertexInDisplay();
                                vertex.visitChildren(function (childVertex) {
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
            }

            function buildLabelAsInput(edge){
                var input = RelativeTreeTemplates['edge_input'].merge({
                    label:edge.text()
                });
                input = $(input);
                if (input.val() === TreeEdge.getWhenEmptyLabel()) {
                    input.val("");
                }
                input.blur(function () {
                    changeToSpan(
                        edgeFromHtml($(this))
                    );
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
                    limitNbRequests:true,
                    select:function (event, ui) {
                        var edge = edgeFromHtml($(this));
                        changeToSpan(edge);
                        var identificationResource = ExternalResource.fromSearchResult(
                            ui.item
                        );
                        EdgeService.addSameAs(
                            edge,
                            identificationResource
                        );
                        var newLabel = ui.item.label;
                        edge.setText(newLabel);
                        EdgeService.updateLabel(
                            edge,
                            newLabel
                        );
                    },
                    resultsProviders:[
                        UserMapAutocompleteProvider.toFetchRelationsForIdentification(
                            edge
                        ),
                        FreebaseAutocompleteProvider.forFetchingAnything()
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
                    var vertex = RelativeTreeVertex.withHtml(
                        html.closest(".vertex")
                    );
                    vertex.adjustWidth();
                });
                edge.getHtml().prepend(
                    input
                );
                input.focus().setCursorToEndOfText();
                var vertex = RelativeTreeVertex.withHtml(
                    input.closest(".vertex")
                );
                vertex.adjustWidth();
                return input;
            }

            function changeToInput(edge) {
                edge.getLabel().hide();
                var edgeHtml = edge.getHtml();
                var input = edgeHtml.find("input");
                if (input.val() === TreeEdge.getWhenEmptyLabel()) {
                    input.val("");
                }
                input.show().focus();
            }

            function changeToSpan(edge) {
                var edgeText = edge.text();
                var nonInputLabel = edge.getHtml().find(
                    ">.overlay-container span.label"
                ).text(
                    edgeText.trim() === "" ?
                        TreeEdge.getWhenEmptyLabel() :
                        edgeText
                );
                edge.getLabel().hide();
                nonInputLabel.show();
                var vertex = RelativeTreeVertex.withHtml(html.closest(".vertex"));
                vertex.adjustWidth();
                vertex.adjustPositionIfApplicable();
                vertex.adjustAllChildrenPositionIfApplicable();
                TreeEdge.redrawAllEdges();
                return edge;
            }

            function buildNonInputLabel(html, label) {
                var overlayContainer = $(
                    "<div class='overlay-container'>"
                ).appendTo(html).on(
                    "dblclick",
                    function(event){
                        event.stopPropagation();
                        var edge = edgeFromHtml(
                            $(this)
                        );
                        edge.deselect();
                        edge.hideMenu();
                        changeToInput(
                            edge
                        );
                    }
                ).on(
                    "click",
                    function(event){
                        event.stopPropagation();
                        var edge = edgeFromHtml(
                            $(this).closest(".relation")
                        );
                        if(KeyboardUtils.isCtrlPressed()){
                            if(edge.isSelected()){
                                edge.deselect();
                            }else{
                                edge.select();
                            }
                        }else{
                            SelectionHandler.reset();
                            edge.select();
                        }
                        SelectionHandler.refreshSelectionMenu();
                    }
                );
                var overlay = $(
                    "<div class='overlay'>"
                ).appendTo(overlayContainer);
                var labelSpan = $(
                    "<span>"
                ).addClass(
                    "label label-info"
                ).text(
                    label.trim() === "" ?
                        TreeEdge.getWhenEmptyLabel() :
                        label
                ).appendTo(
                    overlayContainer
                );
                return labelSpan;
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
                    GraphDisplayer.getEdgeDrawer().ofEdge(
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