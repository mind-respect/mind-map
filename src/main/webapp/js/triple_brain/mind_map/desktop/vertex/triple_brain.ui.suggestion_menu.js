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
    "triple_brain.peripheral_menu",
    "triple_brain.ui.utils"
],
    function (require, $, Freebase, MindMapTemplate, Graph, Point, ExternalResource, VertexService, EdgeService, PeripheralMenu, UiUtils) {
        var api = {
            ofVertex:function (vertex) {
                return new SuggestionMenu(vertex);
            }
        }

        function SuggestionMenu(vertex) {
            var suggestionMenu = this;
            var html;
            this.create = function () {
                html = MindMapTemplate['suggestions_menu'].merge();
                Graph.addHTML(
                    html
                );
                addTitle();
                addSubTitle();
                addSuggestionList();
                position();
                PeripheralMenu.makeHtmlAPeripheralMenu(
                    html
                );
                return suggestionMenu;
            }

            this.reEvaluatePosition = function () {
                position();
            }

            function addTitle() {
                $(html).append(
                    MindMapTemplate['suggestions_menu_title'].merge()
                );
            }

            function addSubTitle() {
                $(html).append(
                    MindMapTemplate['suggestions_menu_sub_title'].merge()
                );
            }

            function addSuggestionList() {
                var suggestionsList = MindMapTemplate['suggestions_list'].merge();
                $(html).append(
                    suggestionsList
                );
                $.each(vertex.suggestions(), function () {
                    var suggestion = this;
                    var htmlSuggestion = MindMapTemplate['suggestion'].merge({
                        domain_id:Freebase.idInFreebaseURI(suggestion.domainUri()),
                        label:suggestion.label()
                    });
                    $(htmlSuggestion).draggable();
                    $(suggestionsList).append(htmlSuggestion);
                    $(htmlSuggestion).bind('dragstop', function (event) {
                        var currentSuggestion = this;
                        Point = require("triple_brain.point");
                        var newVertexPosition = Point.fromCoordinates(
                            $(this).offset().left + $(this).width() / 2,
                            $(this).offset().top
                        );
                        VertexService.addRelationAndVertexAtPositionToVertex(
                            vertex,
                            newVertexPosition,
                            function (triple) {
                                var edgeLabel = $(currentSuggestion).html();
                                EdgeService.updateLabel(
                                    triple.edge(),
                                    edgeLabel
                                );
                                triple.edge().setText(edgeLabel);
                                var typeId = $(currentSuggestion).attr('type-id');
                                var typeUri = Freebase.freebaseIdToURI(typeId);
                                var type = ExternalResource.withUriAndLabel(
                                    typeUri,
                                    $(currentSuggestion).text()
                                );
                                VertexService.addType(
                                    triple.destinationVertex(),
                                    type
                                );
                            }
                        );
                        $(this).remove();
                    });
                });
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