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
    "triple_brain.event_bus"
], function ($, Flow, LanguageManager, SchemaService, Schema, IdUri, RelativeTreeVertexMenuHandler, EventBus) {
    "use strict";
    var api = {},
        linkTooltip,
        createTooltip;
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
                list.append(
                    buildSchemaContainer(this)
                );
            });
        });
    };
    EventBus.subscribe("localized-text-loaded", function(){
        linkTooltip = $.i18n.t("schemaList.linkButton");
        createTooltip = $.i18n.t("schemaList.createButton");
    });
    return api;

    function buildSchemaContainer(schema) {
        var schemaContainer = $("<div class='col-md-3 schema-container'>").data(
            "schema-url",
            IdUri.htmlUrlForBubbleUri(
                schema.getUri()
            )
        ).data(
            "schema",
            schema
        ).append(
            $("<div class='overlay'>"),
            buildButtons(),
            $("<div class='row'>").append(
                $(
                    "<div class='row'>"
                ).append(
                    $("<div class='col-md-6 text-right' data-index='1'>"),
                    $("<div class='col-md-6 text-left' data-index='4'>")
                ),
                $("<div class='row schema-label'>").append(
                    $("<div class='col-md-12 text-center'>").text(
                        schema.getLabel()
                    )
                ),
                $(
                    "<div class='row'>"
                ).append(
                    $("<div class='col-md-6 text-right' data-index='2'>"),
                    $("<div class='col-md-6 text-left' data-index='3'>")
                )
            )
        );
        var containerIndex = 4;
        $.each(schema.getProperties(), function () {
            var property = this;
            containerIndex = containerIndex === 4 ? 1 : containerIndex + 1;
            schemaContainer.find(
                "[data-index=" + containerIndex + "]"
            ).append(
                $("<div>").text(
                    property.getLabel()
                )
            );
        });
        return schemaContainer;
    }

    function getContainer() {
        return $("#schemas-container");
    }

    function getList() {
        return getContainer().find(".list");
    }

    function buildButtons() {
        return $("<div class='button-container'>").append(
            buildLinkButton(),
            buildCreateButton()
        ).mouseover(function () {
            $(this).siblings(".overlay").addClass(
                "hover"
            );
        }).mouseleave(function () {
            $(this).siblings(".overlay").removeClass(
                "hover"
            );
        });
    }

    function buildLinkButton() {
        return $("<i class='link button fa fa-link'>").attr(
            "title",
            linkTooltip
        ).click(function () {
            window.location = $(this).closest(
                ".schema-container"
            ).data("schema-url");
        }).tooltip({
            delay: {"show": 0, "hide": 0}
        });
    }

    function buildCreateButton() {
        return $("<i class='create button fa fa-plus'>").attr(
            "title",
            createTooltip
        ).click(
            createBubbleUsingSchemaClickHandler
        ).tooltip({
            delay: {"show": 0, "hide": 0}
        });
    }

    function createBubbleUsingSchemaClickHandler() {
        var schema = $(this).closest(".schema-container").data("schema");
        RelativeTreeVertexMenuHandler.forSingleOwned().createVertexFromSchemaAction(
            schema
        ).done(function (newVertex) {
            window.location = IdUri.htmlUrlForBubbleUri(
                newVertex.getUri()
            );
        });
    }
});