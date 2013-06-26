/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.mind-map_template",
    "triple_brain.ui.graph",
    "triple_brain.peripheral_menu",
    "triple_brain.user_map_autocomplete_provider"
], function($, MindMapTemplate, GraphUi, PeripheralMenu, UserMapAutocompleteProvider){
    var api = {};
    api.ofVertex = function(vertex){
        return new LinkToFarVertexMenu(
            vertex
        );
    };
    return api;
    function LinkToFarVertexMenu(vertex){
        var self = this;
        var html;
        var peripheralMenu;
        this.create = function () {
            html = $(
                MindMapTemplate['link_to_far_vertex_menu'].merge()
            );
            html.data(
                "vertex",
                vertex
            );
            addTitle();
            addSearchBox();
            GraphUi.addHTML(html);
            peripheralMenu = PeripheralMenu.peripheralMenuForMenuHtmlAndVertex(
                html,
                vertex
            ).init();
            return self;
        };
        this.reEvaluatePosition = function () {
            peripheralMenu.position();
        };
        function addTitle(){
            html.append(
                "<h2>Search for a concept to link to</h2>"
            );
        }
        function addSearchBox(){
            var searchBox = $("<input type='text'>");
            searchBox.tripleBrainAutocomplete({
                select:function (event, ui) {
                    var menu = $(this).closest('.peripheral-menu');
                    var vertex = $(menu).data("vertex");
                    var searchResult = ui.item;

                },
                resultsProviders : [
                    UserMapAutocompleteProvider
                ]
            });
            html.append(
                searchBox
            );
        }
    }
});