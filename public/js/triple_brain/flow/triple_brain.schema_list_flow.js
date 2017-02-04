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
    "triple_brain.vertex_controller",
    "triple_brain.event_bus",
    "triple_brain.user_service",
    "masonry"
], function ($, Flow, LanguageManager, SchemaService, Schema, IdUri, VertexController, EventBus, UserService, Masonry) {
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
        var list = getList();
        SchemaService.list(function (serverList) {
            $.each(Schema.fromServerList(serverList), function () {
                list.append(
                    buildSchemaContainer(this)
                );
            });
            var msnry = new Masonry('#schemas-container .list', {
                "itemSelector": '.schema-container'
            });
            msnry.layout();
        });
    };
    EventBus.subscribe("localized-text-loaded", function () {
        linkTooltip = $.i18n.t("schemaList.linkButton");
        createTooltip = $.i18n.t("schemaList.createButton");
    });
    return api;

    function buildSchemaContainer(schema) {
        var schemaUrl = IdUri.htmlUrlForBubbleUri(
            schema.getUri()
        );
        var schemaContainer = $("<div class='schema-container'>").data(
            "schema-url",
            schemaUrl
        ).data(
            "schema",
            schema
        ).append(
            $("<div class='overlay'>"),
            $("<div class=''>").append(
                $("<div class='row schema-label'>").append(
                    $("<div class='col-md-12 text-center'>").text(
                        schema.getLabel()
                    )
                ),
                $(
                    "<div class='row'>"
                ).append(
                    $("<div class='col-md-6 text-right' data-index='1'>"),
                    $("<div class='col-md-6 text-left' data-index='2'>")
                )
                // $(
                //     "<div class='row'>"
                // ).append(
                //     $("<div class='col-md-6 text-right' data-index='2'>"),
                //     $("<div class='col-md-6 text-left' data-index='3'>")
                // )
            )
        );
        if (UserService.hasCurrentUser()) {
            schemaContainer.append(
                buildButtons(schemaUrl)
            );
        }

        var containerIndex = 2;
        $.each(schema.getProperties(), function () {
            var property = this;
            containerIndex = containerIndex === 2 ? 1 : containerIndex + 1;
            schemaContainer.find(
                "[data-index=" + containerIndex + "]"
            ).append(
                $("<div>").text(
                    property.getLabel()
                )
            );
        });
        if (UserService.hasCurrentUser()) {
            return schemaContainer;
        } else {
            return $("<a>").attr(
                "href",
                schemaUrl
            ).append(
                schemaContainer
            );
        }
    }

    function getContainer() {
        return $("#schemas-container");
    }

    function getList() {
        return getContainer().find(".list");
    }

    function buildButtons(schemaUrl) {
        return $("<div class='button-container text-center'>").append(
            buildLinkButton(schemaUrl),
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

    function buildLinkButton(schemaUrl) {
        return $("<a>").attr(
            "href",
            schemaUrl
        ).append(
            $("<i class='link button fa fa-link'>").attr(
                "title",
                linkTooltip
            ).tooltip({
                delay: {"show": 0, "hide": 0}
            })
        );
    }

    function buildCreateButton() {
        return $("<i class='create button fa fa-plus'>").attr(
            "title",
            createTooltip
        ).click(
            createBubbleUsingSchemaClickHandler
        ).tooltip({
            delay: {"show": 0, "hide": 0},
            container: 'body'
        });
    }

    function createBubbleUsingSchemaClickHandler() {
        var schema = $(this).closest(".schema-container").data("schema");
        schema.getController().createVertexFromSchema().done(function (newVertex) {
            window.location = IdUri.htmlUrlForBubbleUri(
                newVertex.getUri()
            );
        });
    }
});