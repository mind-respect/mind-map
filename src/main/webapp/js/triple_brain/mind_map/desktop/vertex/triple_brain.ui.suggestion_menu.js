/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.ui.suggestion_menu == undefined) {
    var freebaseStatic = triple_brain.freebase;
    triple_brain.ui.suggestion_menu = {

        ofVertex:function (vertex) {
            return new SuggestionMenu(vertex);
        }
    }

    function SuggestionMenu(vertex) {
        var suggestionMenu = this;
        var html;
        this.create = function () {
            html = triple_brain.template['suggestions_menu'].merge();
            triple_brain.ui.graph.addHTML(
                html
            );
            addTitle();
            addSubTitle();
            addSuggestionList();
            position();
            html.click(function (menuClickEvent) {
                menuClickEvent.stopPropagation();
            });
            return suggestionMenu;
        }

        this.reEvaluatePosition = function () {
            position();
        }

        function addTitle() {
            $(html).append(
                triple_brain.template['suggestions_menu_title'].merge()
            );
        }

        function addSubTitle() {
            $(html).append(
                triple_brain.template['suggestions_menu_sub_title'].merge()
            );
        }

        function addSuggestionList() {
            var suggestionsList = triple_brain.template['suggestions_list'].merge();
            $(html).append(
                suggestionsList
            );
            $.each(vertex.suggestions(), function () {
                var suggestion = this;
                var htmlSuggestion = triple_brain.template['suggestion'].merge({
                    domain_id : freebaseStatic.idInFreebaseURI(suggestion.domainUri()),
                    label : suggestion.label()
                });
                $(htmlSuggestion).draggable();
                $(suggestionsList).append(htmlSuggestion);
                $(htmlSuggestion).bind('dragstop', function (event) {
                    var currentSuggestion = this;
                    var newVertexPosition = triple_brain.point.fromCoordinates(
                        $(this).offset().left + $(this).width() / 2,
                        $(this).offset().top
                    );
                    triple_brain.vertex.addRelationAndVertexAtPositionToVertex(
                        vertex,
                        newVertexPosition,
                        function (tripleJson) {
                            tripleJson.edge.label = $(currentSuggestion).html();
                            var typeId = $(currentSuggestion).attr('type-id');
                            var typeUri = freebaseStatic.freebaseIdToURI(typeId);
                            tripleJson.end_vertex.type = triple_brain.external_resource.withUriAndLabel(
                                typeUri,
                                $(currentSuggestion).text()
                            );
                        }
                    );
                    $(this).remove();
                });
            });
        }

        function position() {
            var menuOffset = triple_brain.point.fromCoordinates(
                vertex.width(),
                vertex.height() / 2 - $(html).height() / 2
            )

            var menuPosition = triple_brain.point.sumOfPoints(
                vertex.position(),
                menuOffset
            );
            if (isMenuPositionOffScreen(menuPosition)) {
                menuPosition.y = 10;
            }

            $(html).css('left', menuPosition.x);
            $(html).css('top', menuPosition.y);
        }

        function isMenuPositionOffScreen(menuPosition) {
            return menuPosition.y < 10;
        }
    }

}