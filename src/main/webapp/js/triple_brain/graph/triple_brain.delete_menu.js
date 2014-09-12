/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_element_menu",
    "triple_brain.ui.graph"
],
    function ($, GraphElementMenu, GraphUi) {
        var api = {};
        api.ofVertexAndDeletionBehavior = function (vertex, deleteCallback) {
            return new DeleteMenu(
                vertex,
                deleteCallback
            );
        };
        return api;
        function DeleteMenu(vertex, deleteCallback) {
            var self = this;
            var html = $("<div class='delete-menu'>");
            this.build = function () {
                GraphUi.addHtml(html);
                html.append(
                    title(),
                    buttons()
                );
                GraphElementMenu.makeForMenuContentAndGraphElement(
                    html,
                    vertex
                );
                return self;
            };

            function title(){
                return $(
                    "<h2>"
                ).attr(
                    "data-i18n",
                    "vertex.menu.delete.title"
                );
            }

            function buttons() {
                return $(
                    "<div>"
                ).append(
                    confirmButton(),
                    cancelButton()
                ).css(
                    "margin-top",
                    "1.5em"
                )
                function confirmButton(){
                    return $(
                        "<button>"
                    ).attr(
                        "data-i18n",
                        "vertex.menu.delete.button.confirm"
                    ).data(
                        "vertex",
                        vertex
                    ).on(
                        "click",
                        function(event){
                            var button = $(this);
                            deleteCallback(
                                event,
                                button.data("vertex")
                            );
                            GraphElementMenu.fromContentComponent(
                                button
                            ).close();
                        }
                    ).css(
                        "margin-right",
                        "1.5em"
                    ).button();
                }
                function cancelButton(){
                    return $(
                        "<button>"
                    ).attr(
                        "data-i18n",
                        "vertex.menu.delete.button.cancel"
                    ).on(
                        "click",
                        function(){
                            GraphElementMenu.fromContentComponent(
                                $(this)
                            ).close();
                        }
                    ).button();
                }
            }
        }
    }
);