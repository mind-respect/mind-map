/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.id_uri",
        "triple_brain.graph_displayer",
        "triple_brain.user_map_autocomplete_provider",
        "triple_brain.event_bus",
        "triple_brain.mind_map_info",
        "jquery-ui"
    ],
    function ($, IdUri, GraphDisplayer, UserMapAutocompleteProvider, EventBus, MindMapInfo) {
        "use strict";
        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function(){
            if(MindMapInfo.isAnonymous()){
                return;
            }
            init();
        });
        function init(){
            getInput().empty().tripleBrainAutocomplete({
                select: function (event, ui) {
                    var vertexUri = ui.item.uri,
                        input = $(this);
                    if(MindMapInfo.isTagCloudFlow()){
                        window.location = IdUri.htmlUrlForBubbleUri(vertexUri);
                        return;
                    }
                    GraphDisplayer.displayForBubbleWithUri(
                        vertexUri
                    );
                    input.val("").blur();
                    event.preventDefault();
                },
                resultsProviders: [
                    UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas()
                ]
            });
        }
        function getInput(){
            return $("#vertex-search-input");
        }
    }
);