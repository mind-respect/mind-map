/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.graph_ui",
        "triple_brain.event_bus",
        "triple_brain.graph_displayer",
        "triple_brain.edge_service",
        "triple_brain.graph_element_button",
        "triple_brain.selection_handler",
        "triple_brain.graph_element_ui",
        "triple_brain.bubble"
    ],
    function ($, GraphUi, EventBus, GraphDisplayer, EdgeService, GraphElementButton, SelectionHandler, GraphElementUi, Bubble) {
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
        
        api.EdgeUi = function (html) {
            this.html = html;
            Bubble.Bubble.apply(this, [html]);
        };

        api.EdgeUi.prototype = new Bubble.Bubble();

        api.EdgeUi.prototype.getMenuHtml = function () {
            return this.html.find('.relation-menu');
        };
        api.EdgeUi.prototype.getGraphElementType = function () {
            return GraphElementUi.Types.Relation;
        };
        api.EdgeUi.prototype.serverFacade = function () {
            return EdgeService;
        };
        api.EdgeUi.prototype.getDestinationVertex = function () {
            return GraphDisplayer.getVertexSelector().withId(
                this.html.data('destination_vertex_id')
            );
        };
        api.EdgeUi.prototype.getSourceVertex = function () {
            return GraphDisplayer.getVertexSelector().withId(
                this.html.data("source_vertex_id")
            );
        };
        api.EdgeUi.prototype.inverseAbstract = function () {
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
        api.EdgeUi.prototype.serverFacade = function () {
            return EdgeService;
        };

        api.EdgeUi.prototype.showMenu = function () {
            this.getMenuHtml().show();
        };
        api.EdgeUi.prototype.hideMenu = function () {
            this.getMenuHtml().hide();
        };
        api.EdgeUi.prototype.getHtml = function () {
            return this.html;
        };

        api.EdgeUi.prototype.select = function () {
            this.html.addClass("selected");
        };
        api.EdgeUi.prototype.makeSingleSelected = function () {
            this.html.addClass("single-selected");
            this.showMenu();
        };
        api.EdgeUi.prototype.deselect = function () {
            this.html.removeClass("selected");
            this.html.removeClass("single-selected");
            this.hideMenu();
        };
        api.EdgeUi.prototype.isSelected = function () {
            return this.html.hasClass("selected");
        };

        api.EdgeUi.prototype.isSetAsSameAsGroupRelation = function () {
            return this.getHtml().hasClass(
                "same-as-group-relation"
            );
        };

        api.EdgeUi.prototype.setAsNotSameAsGroupRelation = function () {
            return this.getHtml().removeClass(
                "same-as-group-relation"
            );
        };

        api.EdgeUi.prototype.setAsSameAsGroupRelation = function () {
            return this.getHtml().addClass(
                "same-as-group-relation"
            );
        };

        api.EdgeUi.prototype.hasHiddenRelations = function () {
            return false;
        };

        api.EdgeUi.prototype.getYPosition = function () {
            var edgeIsSetAsSameAsGroupRelation = this.isSetAsSameAsGroupRelation();
            if(edgeIsSetAsSameAsGroupRelation){
                this.setAsNotSameAsGroupRelation();
            }
            var y = this.getLabel().offset().top;
            if(edgeIsSetAsSameAsGroupRelation){
                this.setAsSameAsGroupRelation();
            }
            return y;
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
