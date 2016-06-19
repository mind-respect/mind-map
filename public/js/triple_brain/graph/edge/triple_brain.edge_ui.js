/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.graph_ui",
        "triple_brain.event_bus",
        "triple_brain.graph_displayer",
        "triple_brain.identified_bubble",
        "triple_brain.edge_service",
        "triple_brain.graph_element_button",
        "triple_brain.selection_handler",
        "triple_brain.graph_element_ui"
    ],
    function ($, GraphUi, EventBus, GraphDisplayer, IdentifiedBubble, EdgeService, GraphElementButton, SelectionHandler, GraphElementUi) {
        "use strict";
        var api = {};
        api.getWhenEmptyLabel = function () {
            return $.t("edge.default");
        };
        api.buildCommonConstructors = function (api) {
            GraphElementUi.buildCommonConstructors(api);
            api.visitAllEdges = function (visitor) {
                api.visitAll(function (element) {
                    if (element.isRelation()) {
                        visitor(element);
                    }
                });
            };
        };
        api.buildCommonConstructors(api);
        
        api.Object = function (html) {
            this.html = html;
            IdentifiedBubble.Object.apply(this, [html]);
        };

        api.Object.prototype = new IdentifiedBubble.Object();

        api.Object.prototype.getMenuHtml = function () {
            return this.html.find('.relation-menu');
        };
        api.Object.prototype.getGraphElementType = function () {
            return GraphElementUi.Types.Relation;
        };
        api.Object.prototype.serverFacade = function () {
            return EdgeService;
        };
        api.Object.prototype.getDestinationVertex = function () {
            return GraphDisplayer.getVertexSelector().withId(
                this.html.data('destination_vertex_id')
            );
        };
        api.Object.prototype.getSourceVertex = function () {
            return GraphDisplayer.getVertexSelector().withId(
                this.html.data("source_vertex_id")
            );
        };
        api.Object.prototype.inverseAbstract = function () {
            var sourceVertexUri = this.html.data("source_vertex_id");
            var destinationVertexUri = this.html.data("destination_vertex_id");
            this.html.data(
                "source_vertex_id",
                destinationVertexUri
            );
            this.html.data(
                "destination_vertex_id",
                sourceVertexUri
            );
        };
        api.Object.prototype.serverFacade = function () {
            return EdgeService;
        };

        api.Object.prototype.showMenu = function () {
            this.getMenuHtml().show();
        };
        api.Object.prototype.hideMenu = function () {
            this.getMenuHtml().hide();
        };
        api.Object.prototype.getHtml = function () {
            return this.html;
        };

        api.Object.prototype.select = function () {
            this.html.addClass("selected");
        };
        api.Object.prototype.makeSingleSelected = function () {
            this.showMenu();
        };
        api.Object.prototype.deselect = function () {
            this.html.removeClass("selected");
            this.hideMenu();
        };
        api.Object.prototype.isSelected = function () {
            return this.html.hasClass("selected");
        };
        
        api.Object.prototype.isPublic = function () {
            if(this.isProperty()){
                return true;
            }
            return this.getParentVertex().isPublic() && this.getDestinationVertex().isPublic();
        };

        EventBus.subscribe(
            '/event/ui/graph/vertex/privacy/updated',
            function(event, graphElement){
                graphElement.applyToConnectedEdges(function(edge){
                    edge.reviewInLabelButtonsVisibility();
                });
            }
        );

        return api;
    }
);
