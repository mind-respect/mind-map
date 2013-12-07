/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.vertex",
    "triple_brain.mind-map_template",
    "triple_brain.graph_element_menu",
    "triple_brain.external_resource",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.freebase_autocomplete_provider",
    "triple_brain.graph_element_main_menu",
    "triple_brain.event_bus",
    "triple_brain.selection_handler",
    "jquery-ui",
    "jquery.triple_brain.search"
], function ($, GraphDisplayer, VertexService, MindMapTemplate, GraphElementMenu, ExternalResource, UserMapAutocompleteProvider, FreebaseAutocompleteProvider, GraphElementMainMenu, EventBus, SelectionHandler) {
    var api = {};
    api.applyAutoCompleteIdentificationToLabelInput = function (input) {
        input.tripleBrainAutocomplete({
            limitNbRequests:true,
            select:function (event, ui) {
                var vertex = vertexOfSubHtmlComponent($(this));
                var identificationResource = ExternalResource.fromSearchResult(
                    ui.item
                );
                VertexService.addGenericIdentification(
                    vertex,
                    identificationResource
                );
            },
            resultsProviders:[
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
            "types",
            vertex.addType
        );
        setup(
            vertex.setSameAs,
            "same_as",
            vertex.addSameAs
        );
        setup(
            vertex.setGenericIdentifications,
            "generic_identifications",
            vertex.addGenericIdentification
        );
        function setup(identificationsSetter, identificationProperty, addFctn) {
            identificationsSetter([]);
            $.each(serverFormat[identificationProperty], function () {
                var identificationFromServer = this;
                addFctn(
                    ExternalResource.fromServerJson(
                        identificationFromServer
                    )
                );
            });
        }
    };
    api.addRelevantButtonsInMenu = function(menuContainer){
        var clickHandler = GraphDisplayer.getVertexMenuHandler().forSingle();
        GraphElementMainMenu.visitButtons(function(button){
            if(!button.canActionBePossiblyMade(clickHandler)){
                return;
            }
            button.cloneInto(menuContainer);
        });
    };
    EventBus.subscribe("/event/ui/selection/changed",
        function (event, selectedElements) {
            var onlyOneGraphElementSelected = 1 === SelectionHandler.getNbSelected();
            if(!onlyOneGraphElementSelected){
                $.each(selectedElements, function(){
                    var selectedElement = this;
                    if(!selectedElement.isConcept()){
                        return;
                    }
                    selectedElement.hideMenu();
                });
                return;
            }
            if(!selectedElements.isConcept()){
                return;
            }
            selectedElements.showMenu();
            displayOnlyRelevantButtonsInVertexMenu(
                selectedElements
            );
        }
    );
    return api;
    function vertexOfSubHtmlComponent(htmlOfSubComponent) {
        return GraphDisplayer.getVertexSelector().withHtml(
            $(htmlOfSubComponent).closest('.vertex')
        );
    }
    function displayOnlyRelevantButtonsInVertexMenu(vertex){
        var clickHandler = GraphDisplayer.getVertexMenuHandler().forSingle();
        vertex.visitMenuButtons(function(button){
            button.showOnlyIfApplicable(
                clickHandler,
                vertex
            );
        });
    }
});