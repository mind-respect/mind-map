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
        "triple_brain.ui.graph",
        "jquery-ui",
        "jquery.is-fully-on-screen",
        "jquery.center-on-screen"
    ], function ($, EventBus, MindMapTemplate, RelativeTreeVertex, VertexHtmlCommon, GraphElementHtmlBuilder, GraphUi) {
        "use strict";
        var api = {};
        api.withServerFacade = function (serverFacade) {
            return new VertexCreator(serverFacade);
        };
        api.completeBuild = function (vertex) {
            GraphElementHtmlBuilder.setUpIdentifications(
                vertex.getOriginalServerObject(),
                vertex
            );
            vertex.refreshImages();
            GraphElementHtmlBuilder.addDuplicateElementButtonIfApplicable(
                vertex
            );
            VertexHtmlCommon.moveNoteButtonIfIsToTheLeft(
                vertex
            );
            if (vertex.hasHiddenRelations()) {
                vertex.buildHiddenNeighborPropertiesIndicator();
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
            this.vertex = RelativeTreeVertex.createFromHtml(
                this.html
            );
            this.vertex.setTotalNumberOfEdges(
                this.serverFacade.getNumberOfConnectedEdges()
            );
            VertexHtmlCommon.buildLabelHtml(
                this.vertex,
                VertexHtmlCommon.buildInsideBubbleContainer(
                    this.html
                ),
                RelativeTreeVertex,
                this.serverFacade
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
            VertexHtmlCommon.buildNoteButton(
                this.vertex
            );
            this.vertex.addSuggestions(
                this.serverFacade.getSuggestions()
            );
            this.vertex.hideMenu();
            this.vertex.addImages(
                this.serverFacade.getImages()
            );
            this.vertex.getHtml().append(
                $("<span class='arrow'>")
            );
            if (this.vertex.isPublic()) {
                this.vertex.makePublic();
            } else {
                this.vertex.makePrivate();
            }
            EventBus.publish(
                '/event/ui/html/vertex/created/',
                this.vertex
            );
            return this.vertex;
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
                vertexMenu
            );
            return vertexMenu;
        };
        return api;
    }
);

