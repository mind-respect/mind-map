/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.mind-map_template",
    "triple_brain.ui.graph",
    "triple_brain.peripheral_menu",
    "triple_brain.vertex"
], function($, MindMapTemplate, GraphUi, PeripheralMenu, VertexService){
    var api = {};
    api.ofVertex = function(vertex){
        return new PrivacyManagementMenu(
            vertex
        );
    };
    return api;
    function PrivacyManagementMenu(vertex){
        var self = this;
        var html;
        var peripheralMenu;
        this.create = function () {
            html = $(
                MindMapTemplate['privacy_management_menu'].merge()
            );
            html.data(
                "vertex",
                vertex
            );
            GraphUi.addHTML(html);
            addTitle();
            addChangeButton();
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
                "<h2>Privacy management</h2>"
            );
        }
        function addChangeButton(){
            var button = $("<input class='link-like-button' type='button'>");
            button.data(
                "vertex",
                vertex
            );
            html.append(button);
            vertex.isPublic() ?
                setupForPublic(button) :
                setupForPrivate(button)
            function setupForPublic(button){
                button.val("make private");
                button.off().on("click", function(){
                    var button = $(this);
                    var vertex = button.data("vertex");
                    VertexService.makePrivate(vertex);
                    setupForPrivate(button);
                });
            }
            function setupForPrivate(button){
                button.val("make public");
                button.off().on("click", function(){
                    var button = $(this);
                    var vertex = button.data("vertex");
                    VertexService.makePublic(vertex);
                    setupForPublic(button);
                });
            }
        }
    }
});