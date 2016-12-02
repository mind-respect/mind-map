/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.schema_ui",
    "triple_brain.mind_map_info",
    "triple_brain.vertex_html_builder_common",
    "triple_brain.graph_element_html_builder",
    "triple_brain.graph_element_main_menu",
    "triple_brain.schema_controller",
    "triple_brain.relative_tree_vertex",
    "triple_brain.graph_ui",
    "triple_brain.event_bus"
], function($, SchemaUi, MindMapInfo, VertexHtmlCommon, GraphElementHtmlBuilder, GraphElementMainMenu, SchemaController, RelativeTreeVertex, GraphUi, EventBus){
    "use strict";
    var api = {};
    api.withServerFacade = function(serverFacade){
        return new Self(
            serverFacade
        );
    };
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
    function Self(serverFacade){
        this.serverFacade = serverFacade;
        this.html = $(
            "<div class='schema vertex graph-element relative bubble'>"
        ).data(
            "uri",
            serverFacade.getUri()
        );
        VertexHtmlCommon.setUpClickBehavior(
            this.html
        );
    }
    Self.prototype.create = function(htmlId){
        if(undefined === htmlId){
            htmlId = GraphUi.generateBubbleHtmlId();
        }
        this.html.attr('id', htmlId);
        var schemaUi = SchemaUi.createFromHtml(
            this.html
        );
        VertexHtmlCommon.buildLabelHtml(
            schemaUi,
            VertexHtmlCommon.buildInsideBubbleContainer(
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
        schemaUi.setNote(
            this.serverFacade.getComment()
        );
        VertexHtmlCommon.buildInLabelButtons(
            schemaUi
        );
        return schemaUi;
    };
    Self.prototype._addMenu = function(){
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