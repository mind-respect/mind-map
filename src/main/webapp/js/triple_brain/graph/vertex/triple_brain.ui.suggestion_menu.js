/**
 * Copyright Mozilla Public License 1.1
 */

define([
        "jquery",
        "triple_brain.freebase_uri",
        "triple_brain.mind-map_template",
        "triple_brain.ui.graph",
        "triple_brain.point",
        "triple_brain.identification_server_facade",
        "triple_brain.vertex",
        "triple_brain.edge",
        "triple_brain.ui.utils",
        "triple_brain.graph_displayer",
        "triple_brain.graph_element_menu"
    ],
    function ($, FreebaseUri, MindMapTemplate, GraphUi, Point, IdentificationFacade, VertexService, EdgeService, UiUtils, GraphDisplayer, GraphElementMenu) {
        return {
            ofVertex: function (vertex) {
                return new SuggestionMenu(vertex);
            }
        };
        function SuggestionMenu(vertex) {
            var suggestionMenu = this;
            var html;
            this.create = function () {
                html = $(
                    MindMapTemplate[
                        'suggestions_menu'
                        ].merge()
                );
                GraphUi.addHtml(
                    html
                );
                addTitle();
                if (GraphDisplayer.allowsMovingVertices()) {
                    addInstructions();
                }
                addSuggestionList();
                GraphElementMenu.makeForMenuContentAndGraphElement(
                    html,
                    vertex
                );
                return suggestionMenu;
            };


            function addTitle() {
                html.append(
                    MindMapTemplate['suggestions_menu_title'].merge()
                );
            }

            function addInstructions() {
                html.append(
                    MindMapTemplate['suggestions_instructions'].merge()
                );
            }

            function addSuggestionList() {
                var suggestionsList = MindMapTemplate['suggestions_list'].merge();
                html.append(
                    suggestionsList
                );
                $.each(vertex.suggestions(), function () {
                    var suggestion = this;
                    var htmlSuggestion = $(MindMapTemplate['suggestion'].merge({
                        label: suggestion.label()
                    }));
                    htmlSuggestion.data(
                        "typeId",
                        FreebaseUri.idInFreebaseURI(suggestion.domainUri())
                    );
                    suggestionsList.append(htmlSuggestion);

                    var addSuggestionButton = $(
                        "<button class='add-button-in-list'>"
                    );
                    addSuggestionButton.append(
                        "+"
                    );
                    addSuggestionButton.on("click", function () {
                        addHtmlSuggestionAsVertexAndRelationInMap(
                            $(this).closest("li")
                        );
                    });
                    htmlSuggestion.prepend(
                        addSuggestionButton
                    );

                });

                function addHtmlSuggestionAsVertexAndRelationInMap(suggestionAsHtml) {
                    var typeId = suggestionAsHtml.data(
                        'typeId'
                    );
                    VertexService.addRelationAndVertexToVertex(
                        vertex,
                        vertex,
                        function (triple) {
                            var suggestionLabel = suggestionAsHtml.find(
                                "> .text"
                            ).text();
                            EdgeService.updateLabel(
                                triple.edge(),
                                suggestionLabel
                            );
                            triple.edge().setText(suggestionLabel);
                            var typeUri = FreebaseUri.freebaseIdToURI(
                                typeId
                            );
                            var type = IdentificationFacade.withUriAndLabel(
                                typeUri,
                                suggestionLabel
                            );
                            triple.edge().readjustLabelWidth();
                            triple.destinationVertex().readjustLabelWidth();
                            VertexService.addType(
                                triple.destinationVertex(),
                                type
                            );
                        }
                    );
                    suggestionAsHtml.remove();
                }
            }
        }
    }
);