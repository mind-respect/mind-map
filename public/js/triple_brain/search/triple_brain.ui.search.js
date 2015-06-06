/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.graph_displayer",
        "triple_brain.user_map_autocomplete_provider",
        "triple_brain.event_bus",
        "triple_brain.mind_map_info",
        "jquery-ui"
    ],
    function ($, GraphDisplayer, UserMapAutocompleteProvider, EventBus, MindMapInfo) {
        "use strict";
        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function(){
            if(MindMapInfo.isAnonymous()){
                $("#search-component").hide();
            }else{
                init();
            }
        });
        function init(){
            getInput().empty().tripleBrainAutocomplete({
                select: function (event, ui) {
                    var vertexUri = ui.item.uri,
                        input = $(this);
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