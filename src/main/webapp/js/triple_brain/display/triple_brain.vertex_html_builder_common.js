/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.ui.vertex",
    "triple_brain.vertex_service",
    "triple_brain.graph_element_menu",
    "triple_brain.identification_server_facade",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.freebase_autocomplete_provider",
    "triple_brain.graph_element_main_menu",
    "triple_brain.mind_map_info",
    "triple_brain.selection_handler",
    "jquery-ui",
    "jquery.triple_brain.search"
], function ($, GraphDisplayer, VertexUi, VertexService, GraphElementMenu, IdentificationFacade, UserMapAutocompleteProvider, FreebaseAutocompleteProvider, GraphElementMainMenu, MindMapInfo, SelectionHandler) {
    var api = {};
    api.applyAutoCompleteIdentificationToLabelInput = function (input) {
        input.tripleBrainAutocomplete({
            limitNbRequests: true,
            select: function (event, ui) {
                var vertex = vertexOfSubHtmlComponent($(this)),
                    identificationResource = IdentificationFacade.fromSearchResult(
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
            var $input = $(this),
                vertex = vertexOfSubHtmlComponent($input);
            vertex.getLabel().keyup();
            VertexService.updateLabel(
                vertexOfSubHtmlComponent($input),
                $input.val()
            );
            $input.blur();
        }).keyup(function () {
            var $input = $(this),
                vertex = vertexOfSubHtmlComponent($input),
                html = vertex.getHtml();
            updateLabelsOfVerticesWithSameUri();
            vertex.readjustLabelWidth();
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
        if(vertex.isVertex()){
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
    api.setUpClickBehavior = function(html, uiSelector){
        html.on(
            "click",
            function (event) {
                event.stopPropagation();
                var vertex = uiSelector.withHtml(
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
        );
        if (!MindMapInfo.isViewOnly()) {
            html.on(
                "dblclick",
                function (event) {
                    event.stopPropagation();
                    var vertex = uiSelector.withHtml(
                        $(this)
                    );
                    vertex.focus();
                }
            )
        }
    };
    return api;
    function vertexOfSubHtmlComponent(htmlOfSubComponent) {
        var vertexHtml = htmlOfSubComponent.closest('.vertex')
        return vertexHtml.hasClass("schema") ?
            GraphDisplayer.getSchemaSelector().withHtml(
                vertexHtml
            ) :
            GraphDisplayer.getVertexSelector().withHtml(
                vertexHtml
            );
    }
});