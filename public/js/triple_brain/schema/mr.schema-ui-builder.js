/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.schema_ui",
    "triple_brain.mind_map_info",
    "mr.vertex-ui-builder-common",
    "triple_brain.graph_element_html_builder",
    "triple_brain.graph_element_main_menu",
    "triple_brain.schema_controller",
    "triple_brain.relative_tree_vertex",
    "triple_brain.graph_ui",
    "triple_brain.event_bus"
], function($, SchemaUi, MindMapInfo, VertexUiBuilderCommon, GraphElementHtmlBuilder, GraphElementMainMenu, SchemaController, RelativeTreeVertex, GraphUi, EventBus){
    "use strict";
    var api = {};

    api.completeBuild = function(){
        if(!MindMapInfo.isSchemaMode()){
            return;
        }
        var schema = SchemaUi.get();
        GraphElementHtmlBuilder.integrateIdentifications(
            schema
        );
        schema.refreshImages();
        schema.reviewInLabelButtonsVisibility();
        if(!MindMapInfo.isViewOnly()){
            GraphUi.showSchemaInstructions();
        }
    };
    api.SchemaUiBuilder = function(){};
    api.SchemaUiBuilder.prototype.create = function(serverFacade, htmlId){
        this.serverFacade = serverFacade;
        this.html = $(
            "<div class='schema vertex graph-element relative bubble'>"
        ).data(
            "uri",
            serverFacade.getUri()
        );
        VertexUiBuilderCommon.setUpClickBehavior(
            this.html
        );
        if(undefined === htmlId){
            htmlId = GraphUi.generateBubbleHtmlId();
        }
        this.html.attr('id', htmlId);
        var schemaUi = SchemaUi.createFromHtml(
            this.html
        );
        schemaUi.setModel(serverFacade);
        VertexUiBuilderCommon.buildLabelHtml(
            schemaUi,
            VertexUiBuilderCommon.buildInsideBubbleContainer(
                this.html
            ),
            SchemaUi,
            this.serverFacade
        );
        GraphElementMainMenu.addRelevantButtonsInMenu(
            this._addMenu(),
            schemaUi.getController()
        );
        schemaUi.addImages(
            this.serverFacade.getImages()
        );
        schemaUi.hideMenu();
        schemaUi.makePublic();
        VertexUiBuilderCommon.buildInLabelButtons(
            schemaUi
        );
        return schemaUi;
    };

    api.SchemaUiBuilder.prototype.getClass = function(){
        return api;
    };

    api.SchemaUiBuilder.prototype._addMenu = function(){
        return $("<div class='menu'>").appendTo(
            this.html
        );
    };
    EventBus.subscribe(
        '/event/ui/graph/drawn',
        api.completeBuild
    );
    return api;

});