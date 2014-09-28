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
    "jquery-ui",
    "jquery.triple_brain.search"
], function ($, GraphDisplayer, VertexUi, VertexService, GraphElementMenu, Identification, UserMapAutocompleteProvider, FreebaseAutocompleteProvider, GraphElementMainMenu, MindMapInfo, SelectionHandler, SchemaSuggestion, SuggestionService) {
    var api = {};
    api.applyAutoCompleteIdentificationToLabelInput = function (input) {
        input.tripleBrainAutocomplete({
            limitNbRequests: true,
            select: function (event, ui) {
                var vertex = vertexOfSubHtmlComponent($(this)),
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
                    vertexOfSubHtmlComponent(input)
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
        var labelContainer = $(
                "<div class='overlay-container'>"
            ).appendTo(
                inContentContainer
            ),
            overlay = $("<div class='overlay'>").appendTo(
                labelContainer
            ),
            label = $(
                "<input type='text' class='label'>"
            ).val(
                serverFacade.getLabel().trim()
            ).attr(
                "placeholder",
                uiSelector.getWhenEmptyLabel()
            ).appendTo(labelContainer);
        $("<div class='input-size'>").appendTo(
            labelContainer
        );
        label.focus(function () {
            var $input = $(this),
                vertex = vertexOfSubHtmlComponent($input);
            vertex.highlight();
            vertex.removeStyleOfDefaultText();
            if (vertex.hasDefaultText()) {
                $input.val("");
                vertex.getLabel().keyup();
            }
        }).blur(function () {
            var $input = $(this),
                vertex = vertexOfSubHtmlComponent($input);
            if (!vertex.isMouseOver()) {
                vertex.unhighlight();
            }
            SelectionHandler.setToSingleVertex(vertex);
        }).change(function () {
            var $input = $(this).keyup(),
                vertex = vertexOfSubHtmlComponent($input);
            if (vertex.isVertexSuggestion()) {
                SuggestionService.accept(
                    vertex,
                    updateLabel
                );
            } else {
                updateLabel();
            }
            $input.blur();
            function updateLabel() {
                VertexService.updateLabel(
                    vertexOfSubHtmlComponent($input),
                    $input.val()
                );
            }
        }).keydown(function () {
            vertexOfSubHtmlComponent(
                $(this)
            ).readjustLabelWidth();
        }).keyup(function () {
            var $input = $(this),
                vertex = vertexOfSubHtmlComponent($input),
                html = vertex.getHtml();
            vertex.readjustLabelWidth();
            updateLabelsOfVerticesWithSameUri();
            function updateLabelsOfVerticesWithSameUri() {
                var text = vertex.text();
                var otherInstances = uiSelector.withHtml(
                    html
                ).getOtherInstances();
                $.each(otherInstances, function () {
                    var sameVertex = this;
                    sameVertex.setText(
                        text
                    );
                    sameVertex.readjustLabelWidth();
                });
            }
        });
        if (vertex.isVertex()) {
            api.applyAutoCompleteIdentificationToLabelInput(
                label
            );
        }
        return labelContainer;
    };
    api.buildInsideBubbleContainer = function (html) {
        return $(
            "<div class='in-bubble-content'>"
        ).appendTo(html);
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
        vertex.getInBubbleContainer().find("> .overlay-container").before(
            noteButton
        );
        function clickHandler(event) {
            var vertex = vertexOfSubHtmlComponent(
                $(this)
            );
            vertex.getMenuHandler().forSingle().note(
                event,
                vertex
            );
        }
    };
    return api;
    function vertexOfSubHtmlComponent(htmlOfSubComponent) {
        var vertexHtml = htmlOfSubComponent.closest('.vertex')
        if (vertexHtml.hasClass("suggestion")) {
            return GraphDisplayer.getVertexSuggestionSelector().withHtml(
                vertexHtml
            );
        } else if (vertexHtml.hasClass("schema")) {
            return GraphDisplayer.getSchemaSelector().withHtml(
                vertexHtml
            );
        } else {
            return GraphDisplayer.getVertexSelector().withHtml(
                vertexHtml
            );
        }
    }

    function clickHandler(event) {
        event.stopPropagation();
        var vertex = vertexOfSubHtmlComponent(
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
        vertexOfSubHtmlComponent(
            $(this)
        ).focus();
    }
});