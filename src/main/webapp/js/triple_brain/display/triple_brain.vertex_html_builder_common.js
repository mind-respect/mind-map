/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.ui.vertex",
    "triple_brain.vertex",
    "triple_brain.mind-map_template",
    "triple_brain.graph_element_menu",
    "triple_brain.identification_server_facade",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.freebase_autocomplete_provider",
    "triple_brain.graph_element_main_menu",
    "triple_brain.identification_server_update_handler",
    "jquery-ui",
    "jquery.triple_brain.search"
], function ($, GraphDisplayer, Vertex, VertexService, MindMapTemplate, GraphElementMenu, IdentificationFacade, UserMapAutocompleteProvider, FreebaseAutocompleteProvider, GraphElementMainMenu, IdentificationUpdateHandler) {    var api = {};
    api.applyAutoCompleteIdentificationToLabelInput = function (input) {
        input.tripleBrainAutocomplete({
            limitNbRequests:true,
            select:function (event, ui) {
                var vertex = vertexOfSubHtmlComponent($(this));
                var identificationResource = IdentificationFacade.fromSearchResult(
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
    api.listenForUpdates = function(serverFormat){
        IdentificationUpdateHandler.forFriendlyResource(
            serverFormat
        );
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
                    identificationFromServer
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
    api.initCache = function(vertex){
        Vertex.initCache(
            vertex
        );
    };
    return api;
    function vertexOfSubHtmlComponent(htmlOfSubComponent) {
        return GraphDisplayer.getVertexSelector().withHtml(
            $(htmlOfSubComponent).closest('.vertex')
        );
    }
});