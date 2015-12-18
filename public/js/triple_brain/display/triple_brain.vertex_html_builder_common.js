/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.vertex_ui",
    "triple_brain.vertex_service",
    "triple_brain.graph_element_menu",
    "triple_brain.identification",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.graph_element_main_menu",
    "triple_brain.mind_map_info",
    "triple_brain.selection_handler",
    "triple_brain.schema_suggestion",
    "triple_brain.graph_element_html_builder",
    "triple_brain.bubble_factory",
    "jquery-ui",
    "jquery.triple_brain.search",
    "jquery.max_char"
], function ($, GraphDisplayer, VertexUi, VertexService, GraphElementMenu, Identification, UserMapAutocompleteProvider, GraphElementMainMenu, MindMapInfo, SelectionHandler, SchemaSuggestion, GraphElementHtmlBuilder, BubbleFactory) {
    "use strict";
    var api = {};

    api.applyAutoCompleteIdentificationToLabelInput = function (input) {
        input.tripleBrainAutocomplete(  {
            select: function (event, ui) {
                api._labelAutocompleteSelectHandler(
                    BubbleFactory.fromSubHtml(
                        $(this)
                    ),
                    ui.item
                );
            },
            resultsProviders: [
                UserMapAutocompleteProvider.toFetchCurrentUserVerticesAndPublicOnesForIdentification(
                    BubbleFactory.fromSubHtml(input)
                )
            ]
        });
    };

    api._labelAutocompleteSelectHandler = function(bubble, searchResult){
        var identificationResource = Identification.fromSearchResult(
            searchResult
        );
        if(bubble.isSuggestion()){
            bubble.whenItIntegrates().then(handle);
        }else{
            handle(bubble);
        }
        function handle(bubble){
            SchemaSuggestion.addSchemaSuggestionsIfApplicable(
                bubble,
                searchResult
            );
            VertexService.addGenericIdentification(
                bubble,
                identificationResource
            );
        }
    };

    api.addRelevantButtonsInMenu = function (menuContainer) {
        GraphElementMainMenu.addRelevantButtonsInMenu(
            menuContainer,
            GraphDisplayer.getVertexMenuHandler().forSingle()
        );
    };
    api.buildLabelHtml = function (vertex, inContentContainer, uiSelector, serverFacade) {
        var label = $(
            "<div class='bubble-label'>"
        ).text(
            serverFacade.getLabel().trim()
        ).attr(
            "data-placeholder",
            uiSelector.getWhenEmptyLabel()
        ).maxChar().appendTo(inContentContainer);
        GraphElementHtmlBuilder.setUpLabel(label);
        api.applyAutoCompleteIdentificationToLabelInput(
            label
        );
        return label;
    };
    api.buildInsideBubbleContainer = function (html) {
        var wrapper = $(
                "<div class='in-bubble-content-wrapper'>"
            ),
            container = $(
                "<div class='in-bubble-content'>"
            );
        wrapper.append(container).appendTo(html);
        return container;
    };
    api.setUpClickBehavior = function (html) {
        html.on(
            "click",
            clickHandler
        );
        if (!MindMapInfo.isViewOnly()) {
            html.on(
                "dblclick",
                dblClickHandler
            );
        }
    };
    api.buildNoteButton = function (vertex) {
        var noteButton = GraphElementHtmlBuilder.buildNoteButton(
            vertex
        );
        vertex.getLabel().before(
            noteButton
        );
    };
    api.moveNoteButtonIfIsToTheLeft = function (vertex) {
        if (vertex.isToTheLeft()) {
            var noteButton = vertex.getNoteButtonInBubbleContent();
            noteButton.next(".bubble-label").after(noteButton);
        }
    };
    return api;
    function clickHandler(event) {
        event.stopPropagation();
        var vertex = BubbleFactory.fromSubHtml(
            $(this)
        );
        if (event.ctrlKey) {
            if (vertex.isSelected()) {
                SelectionHandler.removeVertex(vertex);
            } else {
                SelectionHandler.addVertex(vertex);
            }
        } else {
            SelectionHandler.setToSingleVertex(
                vertex
            );
        }
    }

    function dblClickHandler(event) {
        event.stopPropagation();
        BubbleFactory.fromSubHtml(
            $(this)
        ).focus();
    }
});