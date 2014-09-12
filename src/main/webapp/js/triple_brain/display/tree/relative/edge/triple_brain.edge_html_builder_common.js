/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.ui.property",
    "triple_brain.tree_edge",
    "triple_brain.mind_map_info",
    "triple_brain.friendly_resource_service",
    "triple_brain.keyboard_utils",
    "triple_brain.selection_handler",
    "triple_brain.relative_tree_displayer_templates",
    "triple_brain.identification_server_facade",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.freebase_autocomplete_provider",
    "triple_brain.graph_element_service"
], function (PropertyUi, TreeEdge, MindMapInfo, FriendlyResourceService, KeyboardUtils, SelectionHandler, RelativeTreeTemplates, IdentificationFacade, UserMapAutocompleteProvider, FreebaseAutocompleteProvider, GraphElementService) {
    "use strict";
    var api = {};
    api.buildOverlay = function(){
        return $(
            "<div class='overlay-container'>"
        ).append();
    };
    api.buildNonInputLabel = function (container, text, whenEmptyLabel) {
        var overlayContainer = $(
            "<div class='overlay-container'>"
        ).appendTo(container).on(
            "click",
            function (event) {
                event.stopPropagation();
                var edge = edgeFromHtml(
                    $(this).closest(".relation")
                );
                if (KeyboardUtils.isCtrlPressed()) {
                    if (edge.isSelected()) {
                        SelectionHandler.removeRelation(edge);
                    } else {
                        SelectionHandler.addRelation(edge);
                    }
                } else {
                    SelectionHandler.setToSingleRelation(edge);
                }
            }
        );
        if (!MindMapInfo.isViewOnly()) {
            overlayContainer.on(
                "dblclick",
                function (event) {
                    event.stopPropagation();
                    var edge = edgeFromHtml(
                        $(this)
                    );
                    edge.deselect();
                    edge.hideMenu();
                    changeToInput(
                        edge
                    );
                }
            )
        }
        var overlay = $(
            "<div class='overlay'>"
        ).appendTo(overlayContainer);
        return $(
            "<span>"
        ).addClass(
            "label label-info"
        ).text(
                text.trim() === "" ?
                whenEmptyLabel :
                text
        ).appendTo(
            overlayContainer
        );
    };
    api.buildLabelAsInput = function (edge, container, whenEmptyLabel) {
        var input = $(RelativeTreeTemplates['edge_input'].merge({
            label: edge.text()
        })).attr(
            "placeholder",
            whenEmptyLabel
        );
        input.blur(function () {
            changeToSpan(
                edgeFromHtml($(this))
            );
        });
        input.change(function () {
            var html = $(this);
            var edge = edgeFromHtml(html);
            FriendlyResourceService.updateLabel(edge, edge.text());
        });
        input.tripleBrainAutocomplete({
            limitNbRequests: true,
            select: function (event, ui) {
                var edge = edgeFromHtml($(this));
                changeToSpan(edge);
                var identificationResource = IdentificationFacade.fromSearchResult(
                    ui.item
                );
                GraphElementService.addSameAs(
                    edge,
                    identificationResource
                );
                var newLabel = ui.item.label;
                edge.setText(newLabel);
                FriendlyResourceService.updateLabel(
                    edge,
                    newLabel
                );
            },
            resultsProviders: [
                UserMapAutocompleteProvider.toFetchRelationsForIdentification(
                    edge
                ),
                FreebaseAutocompleteProvider.forFetchingAnything()
            ]
        });
        input.keydown(function () {
            $(this).keyup();
        });
        input.keyup(function () {
            var edge = edgeFromHtml(
                $(this)
            );
            edge.adjustWidthToNumberOfChars();
        });
        container.prepend(
            input
        );
        edge.adjustWidthToNumberOfChars();
        input.focus().setCursorToEndOfText();
        return input;
    };
    return api;
    function changeToInput(edge) {
        edge.getLabel().hide();
        var edgeHtml = edge.getHtml(),
            input = edgeHtml.find("input"),
            whenEmptyLabel = edge.isProperty() ?
                PropertyUi.getWhenEmptyLabel() :
                TreeEdge.getWhenEmptyLabel();
        if (input.val() === whenEmptyLabel) {
            input.val("");
        }
        input.show().focus();
        edge.adjustWidthToNumberOfChars();
    }

    function changeToSpan(edge) {
        var edgeText = edge.text();
        var whenEmptyLabel = edge.isProperty() ?
            PropertyUi.getWhenEmptyLabel() :
            TreeEdge.getWhenEmptyLabel();
        var nonInputLabel = edge.getHtml().find(
            "span.label"
        ).text(
                edgeText.trim() === "" ?
                whenEmptyLabel :
                edgeText
        );
        edge.getLabel().hide();
        nonInputLabel.show();
        return edge;
    }

    function edgeFromHtml(htmlComponent) {
        htmlComponent = $(htmlComponent);
        var html = htmlComponent.hasClass("relation") ?
            htmlComponent : htmlComponent.closest(".relation");
        return html.hasClass("property") ?
            PropertyUi.withHtml(
                html
            ) :
            TreeEdge.withHtml(
                html
            );
    }
});