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
        "triple_brain.graph_element_ui"
    ],
    function ($, IdUri, GraphDisplayer, UserMapAutocompleteProvider, EventBus, MindMapInfo, GraphElementUi) {
        "use strict";
        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function () {
            if (MindMapInfo.isAnonymous()) {
                return;
            }
            init();
        });
        EventBus.subscribe('/event/ui/flow/landing', function () {
            init();
        });

        function init() {
            getInput().empty().mrAutocomplete({
                createBubbleIfNoResults: true,
                select: function (event, ui) {
                    if (ui.item.uri === "create") {
                        event.preventDefault();
                        return GraphDisplayer.getAppController().createVertex(
                            ui.item.searchTerm
                        );
                    } else {
                        window.location = IdUri.htmlUrlForBubbleUri(
                            ui.item.uri
                        );
                    }
                },
                resultsProviders: [
                    UserMapAutocompleteProvider.toFetchAllOwned({
                        noFilter: true,
                        prioritizeVertex: true
                    })
                ]
            }).click(function () {
                $(this).val("");
            });
        }

        function getInput() {
            return $("#vertex-search-input");
        }
    }
);
