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
    "jquery-ui",
    "jquery.triple_brain.search"
], function ($, GraphDisplayer, VertexService, MindMapTemplate, GraphElementMenu, ExternalResource, UserMapAutocompleteProvider, FreebaseAutocompleteProvider, GraphElementMainMenu) {
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
            identificationsSetter([]);
            $.each(identificationGetter(), function () {
                var identificationFromServer = this;
                addFctn(
                    ExternalResource.fromServerFormatFacade(
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

    return api;
    function vertexOfSubHtmlComponent(htmlOfSubComponent) {
        return GraphDisplayer.getVertexSelector().withHtml(
            $(htmlOfSubComponent).closest('.vertex')
        );
    }
});