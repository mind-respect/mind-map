/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.freebase",
    "triple_brain.mind-map_template",
    "triple_brain.ui.graph",
    "triple_brain.point",
    "triple_brain.external_resource",
    "triple_brain.vertex",
    "triple_brain.edge",
    "triple_brain.ui.utils",
    "triple_brain.graph_displayer",
    "triple_brain.graph_element_menu"
],
    function (require, $, Freebase, MindMapTemplate, GraphUi, Point, ExternalResource, VertexService, EdgeService, UiUtils, GraphDisplayer, GraphElementMenu) {
        var api = {
            ofVertex:function (vertex) {
                return new SuggestionMenu(vertex);
            }
        };

        function SuggestionMenu(vertex) {
            var suggestionMenu = this;
            var html;
            var peripheralMenu;
            this.create = function () {
                html = $(
                    MindMapTemplate[
                        'suggestions_menu'
                        ].merge()
                );
                GraphUi.addHTML(
                    html
                );
                addTitle();
                if(GraphDisplayer.allowsMovingVertices()){
                    addInstructions();
                }
                addSuggestionList();
                GraphElementMenu.makeForMenuContentAndGraphElement(
                    html,
                    vertex
                );
                return suggestionMenu;
            };

            this.reEvaluatePosition = function () {
                peripheralMenu.position();
            };

            function addTitle() {
                $(html).append(
                    MindMapTemplate['suggestions_menu_title'].merge()
                );
            }

            function addInstructions() {
                $(html).append(
                    MindMapTemplate['suggestions_instructions'].merge()
                );
            }

            function addSuggestionList() {
                var suggestionsList = MindMapTemplate['suggestions_list'].merge();
                $(html).append(
                    suggestionsList
                );
                $.each(vertex.suggestions(), function () {
                    var suggestion = this;
                    var htmlSuggestion = $(MindMapTemplate['suggestion'].merge({
                        label:suggestion.label()
                    }));
                    htmlSuggestion.data(
                        "typeId",
                        Freebase.idInFreebaseURI(suggestion.domainUri())
                    );
                    suggestionsList.append(htmlSuggestion);
                    if(GraphDisplayer.allowsMovingVertices()){
                        htmlSuggestion.draggable();
                        htmlSuggestion.bind('dragstop', function(){
                            var htmlSuggestion = $(this);
                            addHtmlSuggestionAsVertexAndRelationInMap(
                                htmlSuggestion
                            );
                        });
                    }else{
                        var addSuggestionButton = $(
                            "<button class='add-button-in-list'>"
                        );
                        addSuggestionButton.append(
                            "+"
                        );
                        addSuggestionButton.on("click", function(){
                            addHtmlSuggestionAsVertexAndRelationInMap(
                                $(this).closest("li")
                            );
                        });
                        htmlSuggestion.prepend(
                            addSuggestionButton
                        );
                    }
                });

                function addHtmlSuggestionAsVertexAndRelationInMap(suggestionAsHtml){
                    Point = require("triple_brain.point");
                    var offset = suggestionAsHtml.offset();
                    var newVertexPosition = Point.fromCoordinates(
                        offset.left + suggestionAsHtml.width() / 2,
                        offset.top
                    );
                    var typeId = suggestionAsHtml.data(
                        'typeId'
                    );
                    VertexService.addRelationAndVertexAtPositionToVertex(
                        vertex,
                        newVertexPosition,
                        function (triple) {
                            var suggestionLabel = suggestionAsHtml.find(
                                "> .text"
                            ).text();
                            EdgeService.updateLabel(
                                triple.edge(),
                                suggestionLabel
                            );
                            triple.edge().setText(suggestionLabel);
                            var typeUri = Freebase.freebaseIdToURI(
                                typeId
                            );
                            var type = ExternalResource.withUriAndLabel(
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
                    $(suggestionAsHtml).remove();
                }
            }

            function position() {
                UiUtils.positionRight(
                    html,
                    vertex.getHtml()
                )
            }
        }

        return api;
    }
);