/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
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
                    var vertexUri = ui.item.uri;
                    GraphDisplayer.displayForBubbleWithUri(
                        vertexUri
                    );
                },
                resultsProviders: [
                    UserMapAutocompleteProvider.toFetchOnlyCurrentUserVertices()
                ]
            });
        }
        function getInput(){
            return $("#vertex-search-input");
        }
    }
);