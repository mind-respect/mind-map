/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.flow",
    "triple_brain.language_manager",
    "triple_brain.schema_service",
    "triple_brain.schema",
    "triple_brain.id_uri",
    "triple_brain.relative_tree_vertex_menu_handler",
    "triple_brain.graph_displayer"
], function ($, Flow, LanguageManager, SchemaService, Schema, IdUri, RelativeTreeVertexMenuHandler, GraphDisplayer) {
    "use strict";
    var api = {};
    api.enter = function () {
        Flow.hideAllFlowSpecificHtml();
        LanguageManager.loadLocaleContent(function () {
            $("html").i18n();
            getContainer().removeClass("hidden");
            $("body").removeClass("hidden");
        });
        SchemaService.list(function (serverList) {
            var list = getList();
            $.each(Schema.fromServerList(serverList), function () {
                var schema = this;
                var anchor = $("<a>").text(
                    schema.getLabel()
                ).attr(
                    "href",
                    IdUri.htmlUrlForBubbleUri(
                        schema.getUri()
                    )
                );
                var createBubbleButton = $("<button class='create link-like-button'>").text(
                    "create bubble using schema"
                ).click(createBubbleUsingSchemaClickHandler);
                list.append(
                    $("<li class='list-group-item'>").append(
                        anchor,
                        createBubbleButton
                    ).data(
                        "schema", schema
                    )
                );
            });
        });
    };
    return api;
    function createBubbleUsingSchemaClickHandler(){
        var schema = $(this).closest("li").data("schema");
        RelativeTreeVertexMenuHandler.forSingleOwned().createVertexFromSchemaAction(
            schema
        ).done(function(newVertex){
            window.location = IdUri.htmlUrlForBubbleUri(
                newVertex.getUri()
            );
        });
    }
    function getContainer() {
        return $("#schemas-container");
    }

    function getList() {
        return getContainer().find("ul");
    }
});