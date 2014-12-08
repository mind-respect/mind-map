/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.vertex_ui",
    "triple_brain.vertex_service",
    "triple_brain.graph_element_menu",
    "triple_brain.identification",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.freebase_autocomplete_provider",
    "triple_brain.graph_element_main_menu",
    "triple_brain.mind_map_info",
    "triple_brain.selection_handler",
    "triple_brain.schema_suggestion",
    "triple_brain.suggestion_service",
    "triple_brain.graph_element_html_builder",
    "triple_brain.bubble_factory",
    "jquery-ui",
    "jquery.triple_brain.search",
    "jquery.max_char"
], function ($, GraphDisplayer, VertexUi, VertexService, GraphElementMenu, Identification, UserMapAutocompleteProvider, FreebaseAutocompleteProvider, GraphElementMainMenu, MindMapInfo, SelectionHandler, SchemaSuggestion, SuggestionService, GraphElementHtmlBuilder, BubbleFactory) {
    "use strict";
    var api = {};

    api.applyAutoCompleteIdentificationToLabelInput = function (input) {
        input.tripleBrainAutocomplete({
            limitNbRequests: true,
            select: function (event, ui) {
                var vertex = BubbleFactory.fromSubHtml(
                        $(this)
                    ),
                    identificationResource = Identification.fromSearchResult(
                        ui.item
                    );
                SchemaSuggestion.addSchemaSuggestionsIfApplicable(
                    vertex,
                    ui.item
                );
                VertexService.addGenericIdentification(
                    vertex,
                    identificationResource
                );
            },
            resultsProviders: [
                UserMapAutocompleteProvider.toFetchCurrentUserVerticesAndPublicOnesForIdentification(
                    BubbleFactory.fromSubHtml(input)
                ),
                FreebaseAutocompleteProvider.forFetchingAnything()
            ]
        });
    };

    api.setUpIdentifications = function (serverFormat, vertex) {
        setup(
            vertex.setTypes,
            serverFormat.getTypes,
            vertex.addType
        );
        setup(
            vertex.setSameAs,
            serverFormat.getSameAs,
            vertex.addSameAs
        );
        setup(
            vertex.setGenericIdentifications,
            serverFormat.getGenericIdentifications,
            vertex.addGenericIdentification
        );
        function setup(identificationsSetter, identificationGetter, addFctn) {
            identificationsSetter.call(vertex, []);
            $.each(identificationGetter.call(serverFormat, []), function () {
                var identificationFromServer = this;
                addFctn.call(
                    vertex,
                    identificationFromServer
                );
            });
        }
    };
    api.addRelevantButtonsInMenu = function (menuContainer) {
        GraphElementMainMenu.addRelevantButtonsInMenu(
            menuContainer,
            GraphDisplayer.getVertexMenuHandler().forSingle()
        );
    };
    api.initCache = function (vertex) {
        VertexUi.initCache(
            vertex
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

        label.blur(function () {
            var $input = $(this),
                vertex = BubbleFactory.fromSubHtml($input);
            $input.maxChar();
            if (vertex.isVertexSuggestion()) {
                SuggestionService.accept(
                    vertex,
                    updateLabel
                );
            } else {
                updateLabel();
            }
            updateLabelsOfVerticesWithSameUri();
            function updateLabelsOfVerticesWithSameUri() {
                var text = vertex.text();
                var otherInstances = uiSelector.withHtml(
                    vertex.getHtml()
                ).getOtherInstances();
                $.each(otherInstances, function () {
                    var sameVertex = this;
                    sameVertex.setText(
                        text
                    );
                });
            }

            function updateLabel() {
                VertexService.updateLabel(
                    BubbleFactory.fromSubHtml($input),
                    $input.maxCharCleanText()
                );
            }

            SelectionHandler.setToSingleVertex(vertex);
        });
        if (vertex.isVertex()) {
            api.applyAutoCompleteIdentificationToLabelInput(
                label
            );
        }
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
    api.addNoteButtonNextToLabel = function (vertex) {
        var noteButton = vertex.getNoteButtonInMenu().clone().on(
            "click", clickHandler
        );
        noteButton[
            vertex.hasNote() ?
                "show" :
                "hide"
            ]();
        vertex.getLabel().before(
            noteButton
        );
        function clickHandler(event) {
            var vertex = BubbleFactory.fromSubHtml(
                $(this)
            );
            vertex.getMenuHandler().forSingle().note(
                event,
                vertex
            );
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

    function dblClickHandler() {
        event.stopPropagation();
        BubbleFactory.fromSubHtml(
            $(this)
        ).focus();
    }
});