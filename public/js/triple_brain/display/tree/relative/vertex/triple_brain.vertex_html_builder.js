/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.event_bus",
        "triple_brain.mind-map_template",
        "triple_brain.relative_tree_vertex",
        "triple_brain.vertex_html_builder_common",
        "triple_brain.graph_element_html_builder",
        "triple_brain.graph_element_ui",
        "triple_brain.graph_ui",
        "triple_brain.center_bubble",
        "jquery-ui",
        "jquery.is-fully-on-screen",
        "jquery.center-on-screen"
    ], function ($, EventBus, MindMapTemplate, RelativeTreeVertex, VertexHtmlCommon, GraphElementHtmlBuilder, GraphElementUi, GraphUi, CenterBubble) {
        "use strict";
        var api = {};
        api.withServerFacade = function (serverFacade) {
            return new VertexCreator(serverFacade);
        };
        api.completeBuild = function (vertex) {
            GraphElementHtmlBuilder.setUpIdentifications(
                vertex.getModel(),
                vertex
            );
            vertex.refreshImages();
            VertexHtmlCommon.moveInLabelButtonsContainerIfIsToTheLeft(
                vertex
            );
            var hasAnExpandedOtherInstance = false;
            vertex.applyToOtherInstances(function (otherInstance) {
                if (otherInstance.getNumberOfChild() > 0) {
                    hasAnExpandedOtherInstance = true;
                    return false;
                }
            });
            vertex.buildHiddenNeighborPropertiesIndicator();
            if (!vertex.hasHiddenRelations() || hasAnExpandedOtherInstance) {
                vertex.getHiddenRelationsContainer().hide();
            }
            vertex.reviewInLabelButtonsVisibility();
            GraphElementHtmlBuilder._setupChildrenContainerDragOverAndDrop(vertex);
            var parentVertex = vertex.getParentVertex();
            if (parentVertex.isCenterBubble()) {
                CenterBubble.usingBubble(
                    parentVertex
                ).reviewAddBubbleButtonDirection();
            }
            EventBus.publish(
                '/event/ui/vertex/build_complete',
                vertex
            );
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
            );
            VertexHtmlCommon.setUpClickBehavior(
                this.html
            );
        }

        VertexCreator.prototype.create = function (htmlId) {
            if (undefined === htmlId) {
                htmlId = GraphUi.generateBubbleHtmlId();
            }
            this.html.attr('id', htmlId);
            this.vertexUi = RelativeTreeVertex.createFromHtml(
                this.html
            );
            var label = VertexHtmlCommon.buildLabelHtml(
                this.vertexUi,
                VertexHtmlCommon.buildInsideBubbleContainer(
                    this.html
                ),
                RelativeTreeVertex,
                this.serverFacade
            ).blur(function () {
                var $label = $(this);
                $label.html(
                    linkify(
                        $label.html()
                    )
                );
            });
            label.html(
                linkify(
                    label.html()
                )
            );
            GraphElementHtmlBuilder.setupDragAndDrop(
                this.vertexUi
            );
            this.vertexUi.setIncludedVertices(
                this.serverFacade.getIncludedVertices()
            );
            this.vertexUi.setIncludedEdges(
                this.serverFacade.getIncludedEdges()
            );
            if (this.vertexUi.hasIncludedGraphElements()) {
                this._showItHasIncludedGraphElements();
            }
            this.vertexUi.setNote(
                this.serverFacade.getComment()
            );
            this._createMenu();
            VertexHtmlCommon.buildInLabelButtons(
                this.vertexUi
            );
            this.vertexUi.hideMenu();
            this.vertexUi.addImages(
                this.serverFacade.getImages()
            );
            this.vertexUi.getHtml().append(
                $("<span class='arrow'>")
            );
            EventBus.publish(
                '/event/ui/html/vertex/created/',
                this.vertexUi
            );
            return this.vertexUi;
        };

        VertexCreator.prototype._showItHasIncludedGraphElements = function () {
            this.html.append(
                $("<div class='included-graph-elements-flag'>").text(
                    ". . ."
                )
            ).addClass("includes-vertices");
        };

        VertexCreator.prototype._createMenu = function () {
            var vertexMenu = $(
                MindMapTemplate['vertex_menu'].merge()
            );
            this.html.find(
                ".in-bubble-content"
            ).append(vertexMenu);
            VertexHtmlCommon.addRelevantButtonsInMenu(
                vertexMenu,
                this.vertexUi
            );
            return vertexMenu;
        };
        return api;
        function linkify(htmlContent) {
            //http://stackoverflow.com/a/25821576/541493
            var originalContent = htmlContent;
            htmlContent = htmlContent.replace(
                /\n/g,
                ''
            );
            var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
            var hasLink = false;
            var htmlWithLink = htmlContent.replace(urlRegex, function (url, b, c) {
                var url2 = (c === 'www.') ? 'http://' + url : url;
                hasLink = true;
                return '<a href="' + url2 + '" target="_blank">' + originalContent + '</a>';
            });
            return hasLink ? htmlWithLink : originalContent;
        }
    }
);

