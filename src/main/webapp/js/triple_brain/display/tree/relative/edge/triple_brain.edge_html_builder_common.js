/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.ui.property",
    "triple_brain.tree_edge",
    "triple_brain.mind_map_info",
    "triple_brain.friendly_resource_service",
    "triple_brain.selection_handler",
    "triple_brain.relative_tree_displayer_templates",
    "triple_brain.identification",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.freebase_autocomplete_provider",
    "triple_brain.graph_element_service",
    "triple_brain.suggestion_relation_ui",
    "triple_brain.suggestion_service"
], function (PropertyUi, TreeEdge, MindMapInfo, FriendlyResourceService, SelectionHandler, RelativeTreeTemplates, Identification, UserMapAutocompleteProvider, FreebaseAutocompleteProvider, GraphElementService, SuggestionRelationUi, SuggestionService) {
    "use strict";
    var api = {};
    api.buildOverlay = function () {
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
                if (event.ctrlKey) {
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
                    edge._changeToInput();
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
            var edge = edgeFromHtml($(this));
            edge._changeToSpan();
            SelectionHandler.setToSingleRelation(edge);
        });
        input.change(function () {
            var input = $(this);
            var edge = edgeFromHtml(input);
            if(edge.isRelationSuggestion()){
                SuggestionService.accept(
                    edge.childVertexInDisplay(),
                    updateLabel
                );
            }else{
                updateLabel();
            }
            function updateLabel(){
                FriendlyResourceService.updateLabel(edge, edge.text());
            }
            input.blur();
        });
        input.tripleBrainAutocomplete({
            limitNbRequests: true,
            select: function (event, ui) {
                var edge = edgeFromHtml($(this));
                edge._changeToSpan();
                var identificationResource = Identification.fromSearchResult(
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
        return input;
    };
    return api;

    function edgeFromHtml(htmlComponent) {
        var html = htmlComponent.hasClass("relation") ?
            htmlComponent : htmlComponent.closest(".relation");
        var uiFacade;
        if (html.hasClass("suggestion")) {
            uiFacade = SuggestionRelationUi;
        } else if (html.hasClass("property")) {
            uiFacade = PropertyUi;
        } else {
            uiFacade = TreeEdge;
        }
        return uiFacade.withHtml(
            html
        );
    }
});