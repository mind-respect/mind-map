/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.mind_map_info",
    "triple_brain.friendly_resource_service",
    "triple_brain.selection_handler",
    "triple_brain.relative_tree_displayer_templates",
    "triple_brain.identification",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.freebase_autocomplete_provider",
    "triple_brain.graph_element_service",
    "triple_brain.suggestion_service",
    "triple_brain.graph_element_html_builder",
    "triple_brain.bubble_factory"
], function (MindMapInfo, FriendlyResourceService, SelectionHandler, RelativeTreeTemplates, Identification, UserMapAutocompleteProvider, FreebaseAutocompleteProvider, GraphElementService, SuggestionService, GraphElementHtmlBuilder, BubbleFactory) {
    "use strict";
    var api = {};
    api.moveNoteButtonIfIsToTheLeft = function(edge){
        if (edge.isToTheLeft()) {
            var noteButton = edge.getNoteButtonInBubbleContent();
            edge.getInBubbleContainer().append(noteButton);
        }
    };
    api.buildLabel = function (edgeHtml, text, whenEmptyLabel) {
        var bubbleContentContainer = edgeHtml.find(".in-bubble-content");
        var labelContainer = $(
            "<div class='label-container'>"
        ).appendTo(bubbleContentContainer);
        var label = $(
            "<div class='bubble-label label label-info'>"
        ).text(
            text
        ).attr(
            "data-placeholder",
            whenEmptyLabel
        ).on(
            "click",
            function (event) {
                event.stopPropagation();
                var edge = BubbleFactory.fromSubHtml(
                    $(this)
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
        ).appendTo(
            labelContainer
        ).tripleBrainAutocomplete({
                limitNbRequests: true,
                select: function (event, ui) {
                    var edge = BubbleFactory.fromSubHtml(
                        $(this)
                    );
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
                        BubbleFactory.fromHtml(
                            edgeHtml.closest(".bubble")
                        )
                    ),
                    FreebaseAutocompleteProvider.forFetchingAnything()
                ]
            }
        );
        if (!MindMapInfo.isViewOnly()) {
            label.on(
                "dblclick",
                function (event) {
                    event.stopPropagation();
                    var edge = BubbleFactory.fromSubHtml(
                        $(this)
                    );
                    edge.deselect();
                    edge.hideMenu();
                    edge.focus();
                }
            )
        }
        GraphElementHtmlBuilder.setUpLabel(label);
        return label;
    };
    api.buildNoteButton = function(edge){
        var noteButton = GraphElementHtmlBuilder.buildNoteButton(
            edge
        );
        edge.getInBubbleContainer().prepend(
            noteButton
        );
    };
    return api;
});