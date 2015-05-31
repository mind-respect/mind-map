/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "require",
    "jquery",
    "triple_brain.template.vertices_list",
    "triple_brain.ui.left_panel",
    "triple_brain.module.vertices_list"
],
    function (require, $, Template, LeftPanel, VerticesList) {
        "use strict";
        return {
            create:function () {
                return new VerticesListCreator().create()
            }
        };

        function VerticesListCreator() {
            var html = $(
                Template['panel'].merge()
            );
            this.create = function () {
                VerticesList = require("triple_brain.module.vertices_list");
                LeftPanel.addHtml(html);
                addTitle();
                addSortMenu();
                addFilterInput();
                addVerticesList();
                $('.sort-vertices-btn').css('padding', '0px');
                $('#sort-by-label').click(function () {
                    var verticesList = VerticesList.get();
                    verticesList.sortByLabel();
                });
                $('#sort-by-min-number-of-edges-from-center-vertex').click(function () {
                    var verticesList = VerticesList.get();
                    verticesList.sortByDistanceFromCentralVertex();
                });
                $.i18n.loadNamespace(
                    "vertices_list",
                   function(){
                       html.i18n({
                           ns : "vertices_list"
                       });
                   }
                );
                return VerticesList.get();
            };

            function addTitle() {
                $(html).append(
                    Template['title'].merge()
                )
            }

            function addSortMenu() {
                var sortMenu = Template['sort_menu'].merge();
                $(html).append(sortMenu);
                var title = Template['sort_menu_title'].merge();
                $(sortMenu).append(title);
                var optionsList = Template['options_list'].merge();
                $(sortMenu).append(optionsList);
                var sortByLabelOption = Template['sort_by_label_option'].merge();
                $(optionsList).append(sortByLabelOption);
                var sortByDistanceFromCentralVertex = Template['sort_by_distance_from_central_vertex'].merge();
                $(optionsList).append(sortByDistanceFromCentralVertex);
            }

            function addFilterInput(){
                $('<div class="col-md-12">').append(
                    buildInput()
                ).appendTo(html);
                function buildInput(){
                    return $(
                        "<input type='text' class='filter form-control input-sm'>"
                    ).attr(
                        "data-i18n",
                        "[placeholder]filter"
                    ).on(
                        "keyup",
                        function(){
                            var val = $(this).val().toLowerCase();
                            getActualList().find("> li").each(function(){
                                var listElement = $(this);
                                var text = listElement.find(
                                    "> input"
                                ).val().toLowerCase();
                                if (text.search(val) > -1) {
                                    listElement.show();
                                }
                                else {
                                    listElement.hide();
                                }
                            });
                        }
                    );
                }
            }

            function addVerticesList() {
                html.append(
                    $('<div class="col-md-12">').append(
                        Template['vertices_list'].merge()
                    )
                );
            }
        }
        function getActualList(){
            return $("#vertices-list");
        }
    }
);
