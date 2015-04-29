/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.schema_ui",
    "triple_brain.vertex_html_builder_common",
    "triple_brain.graph_element_html_builder",
    "triple_brain.graph_element_main_menu",
    "triple_brain.schema_menu_handler",
    "triple_brain.relative_tree_vertex",
    "triple_brain.ui.graph"
], function(SchemaUi, VertexHtmlCommon, GraphElementHtmlBuilder, GraphElementMainMenu, SchemaMenuHandler, RelativeTreeVertex, GraphUi){
    "use strict";
    var api = {};
    api.withServerFacade = function(serverFacade){
        return new Self(
            serverFacade
        );
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
        var schema = SchemaUi.createFromHtml(
            this.html
        );
        VertexHtmlCommon.buildLabelHtml(
            schema,
            VertexHtmlCommon.buildInsideBubbleContainer(
                this.html
            ),
            SchemaUi,
            this.serverFacade
        );
        GraphElementMainMenu.addRelevantButtonsInMenu(
            this._addMenu(),
            SchemaMenuHandler.forSingle()
        );
        schema.hideMenu();
        schema.makePublic();
        schema.setNote(
            this.serverFacade.getComment()
        );
        GraphElementHtmlBuilder.addNoteButtonNextToLabel(
            schema
        );
        return schema;
    };
    Self.prototype._addMenu = function(){
        return $("<div class='menu'>").appendTo(
            this.html
        );
    };

    return api;
});