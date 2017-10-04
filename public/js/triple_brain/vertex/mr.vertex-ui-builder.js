/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.event_bus",
        "triple_brain.mind-map_template",
        "triple_brain.bubble_factory",
        "triple_brain.relative_tree_vertex",
        "mr.vertex-ui-builder-common",
        "triple_brain.graph_element_html_builder",
        "triple_brain.graph_element_ui",
        "triple_brain.graph_ui",
        "triple_brain.center_bubble",
        "triple_brain.mind_map_info",
        "jquery.is-fully-on-screen",
        "jquery.center-on-screen"
    ], function ($, EventBus, MindMapTemplate, BubbleFactory, RelativeTreeVertex, VertexUiBuilderCommon, GraphElementHtmlBuilder, GraphElementUi, GraphUi, CenterBubble, MindMapInfo) {
        "use strict";
        var api = {};
        api.withOptions = function (options) {
            return new api.VertexUiBuilder(
                options
            );
        };
        api.completeBuild = function (vertexUi) {
            if (!vertexUi.isMeta()) {
                GraphElementHtmlBuilder.integrateIdentifications(
                    vertexUi
                );
            }
            vertexUi.refreshImages();
            VertexUiBuilderCommon.moveInLabelButtonsContainerIfIsToTheLeft(
                vertexUi
            );
            var hasAnExpandedOtherInstance = false;
            vertexUi.applyToOtherInstances(function (otherInstance) {
                if (otherInstance.getNumberOfChild() > 0) {
                    hasAnExpandedOtherInstance = true;
                    return false;
                }
            });
            vertexUi.buildHiddenNeighborPropertiesIndicator();
            if (!vertexUi.hasHiddenRelations() || hasAnExpandedOtherInstance) {
                vertexUi.getHiddenRelationsContainer().hide();
            }
            vertexUi.reviewInLabelButtonsVisibility();
            if (!MindMapInfo.isViewOnly() && !vertexUi.isCenterBubble()) {
                GraphElementHtmlBuilder.setupDrag(vertexUi);
            }
            GraphElementHtmlBuilder._setupChildrenContainerDragOverAndDrop(vertexUi);
            var parentVertex = vertexUi.getParentVertex();
            if (parentVertex.isCenterBubble()) {
                CenterBubble.usingBubble(
                    parentVertex
                ).reviewAddBubbleButtonDirection();
            }
            RelativeTreeVertex.setupVertexCopyButton(
                vertexUi
            );
            GraphElementHtmlBuilder.completeBuild(
                vertexUi
            );
            EventBus.publish(
                '/event/ui/vertex/build_complete',
                vertexUi
            );
        };
        EventBus.subscribe(
            '/event/ui/vertex/visit_after_graph_drawn',
            handleVisitAfterGraphDrawn
        );

        function handleVisitAfterGraphDrawn(event, vertex) {
            api.completeBuild(vertex);
        }

        api.VertexUiBuilder = function (options) {
            this.options = options || {};
        };

        api.VertexUiBuilder.prototype.create = function (serverFacade, htmlId) {
            this.serverFacade = serverFacade;
            this.html = $(
                MindMapTemplate['relative_vertex'].merge()
            ).addClass(
                this.options.htmlClass
            ).data(
                "uri",
                serverFacade.getUri()
            );
            VertexUiBuilderCommon.setUpClickBehavior(
                this.html,
                this.options.isViewOnly
            );
            if (undefined === htmlId) {
                htmlId = GraphUi.generateBubbleHtmlId();
            }
            this.html.attr('id', htmlId);
            this.vertexUi = BubbleFactory.getUiObjectClassFromHtml(
                this.html
            ).createFromHtml(
                this.html
            );
            this.vertexUi.setModel(serverFacade);
            var label = VertexUiBuilderCommon.buildLabelHtml(
                this.vertexUi,
                VertexUiBuilderCommon.buildInsideBubbleContainer(
                    this.html
                ),
                this.vertexUi.getSelector(),
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
            GraphElementHtmlBuilder.setupDrop(
                this.vertexUi
            );

            if (this.vertexUi.isVertex() && this.serverFacade.hasIncludedGraphElements()) {
                this._showItHasIncludedGraphElements();
            }
            this._createMenu();
            VertexUiBuilderCommon.buildInLabelButtons(
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

        api.VertexUiBuilder.prototype.getClass = function () {
            return api;
        };

        api.VertexUiBuilder.prototype._showItHasIncludedGraphElements = function () {
            this.html.append(
                $("<div class='included-graph-elements-flag'>").text(
                    ". . ."
                )
            ).addClass("includes-vertices");
        };

        api.VertexUiBuilder.prototype._createMenu = function () {
            var vertexMenu = $(
                MindMapTemplate['vertex_menu'].merge()
            );
            this.html.find(
                ".in-bubble-content"
            ).append(vertexMenu);
            VertexUiBuilderCommon.addRelevantButtonsInMenu(
                vertexMenu,
                this.vertexUi
            );
            return vertexMenu;
        };
        return api;

        function linkify(htmlContent) {
            //http://stackoverflow.com/a/25821576/541493
            htmlContent = htmlContent.replace(
                /\n/g,
                ''
            );
            var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
            var hasLink = false;
            var htmlWithLink = htmlContent.replace(urlRegex, function (url, b, c) {
                var url2 = (c === 'www.') ? 'http://' + url : url;
                hasLink = true;
                return '<a href="' + url2 + '" target="_blank">' + url + '</a>';
            });
            return $.maxCharText(
                htmlWithLink
            );
        }
    }
);

