/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
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
        "jquery.center-on-screen",
        "jquery.i18next"
    ], function ($, EventBus, MindMapTemplate, RelativeTreeVertex, VertexHtmlCommon, GraphElementHtmlBuilder, GraphUi) {
        var api = {};
        api.withServerFacade = function (serverFacade) {
            return new VertexCreator(serverFacade);
        };
        api.completeBuild = function (vertex) {
            vertex.refreshImages();
            GraphElementHtmlBuilder.addDuplicateElementButtonIfApplicable(
                vertex
            );
            if (vertex.isToTheLeft()) {
                var noteButton = vertex.getNoteButtonInBubbleContent();
                noteButton.next(".bubble-label").after(noteButton);
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
            );
            VertexHtmlCommon.setUpClickBehavior(
                this.html
            );
        }

        VertexCreator.prototype.create = function (htmlId) {
            if(undefined === htmlId){
                htmlId = GraphUi.generateBubbleHtmlId();
            }
            this.html.attr('id', htmlId);
            this.vertex = new RelativeTreeVertex.Object().init(
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
            VertexHtmlCommon.addNoteButtonNextToLabel(
                this.vertex
            );
            this.vertex.addSuggestions(
                this.serverFacade.getSuggestions()
            );
            this.vertex.hideMenu();
            VertexHtmlCommon.setUpIdentifications(
                this.serverFacade,
                this.vertex
            );
            this.vertex.addImages(
                this.serverFacade.getImages()
            );

            this.vertex.getHtml().append(
                $("<span class='arrow'>")
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

