/**
 * Copyright Mozilla Public License 1.1
 */
if (triple_brain.module.vertices_list_creator == undefined) {
    (function($) {
        triple_brain.module.vertices_list_creator = {
            create : function(){
                return new VerticesListCreator().create()
            }
        };

        function VerticesListCreator(){
            var html = triple_brain.template.vertices_list['panel'].merge();
            this.create = function(){
                triple_brain.ui.left_panel.addHTML(html);
                addTitle();
                addSortMenu();
                addVerticesList();
                $('.sort-vertices-btn').css('padding', '0px');
                $('#sort-by-label').click(function (e) {
                    var verticesList = triple_brain.module.vertices_list.get();
                    verticesList.sortByLabel();
                });
                $('#sort-by-min-number-of-edges-from-center-vertex').click(function (e) {
                    var verticesList = triple_brain.module.vertices_list.get();
                    verticesList.sortByDistanceFromCentralVertex();
                });
                return triple_brain.module.vertices_list.get();
            }

            function addTitle(){
                $(html).append(
                    triple_brain.template.vertices_list['title'].merge()
                )
            }
            function addSortMenu(){
                var sortMenu = triple_brain.template.vertices_list['sort_menu'].merge();
                $(html).append(sortMenu);
                var title = triple_brain.template.vertices_list['sort_menu_title'].merge();
                $(sortMenu).append(title);
                var optionsList = triple_brain.template.vertices_list['options_list'].merge();
                $(sortMenu).append(optionsList);
                var sortByLabelOption = triple_brain.template.vertices_list['sort_by_label_option'].merge();
                $(optionsList).append(sortByLabelOption);
                var sortByDistanceFromCentralVertex = triple_brain.template.vertices_list['sort_by_distance_from_central_vertex'].merge();
                $(optionsList).append(sortByDistanceFromCentralVertex);
            }
            function addVerticesList(){
                $(html).append(
                    triple_brain.template.vertices_list['vertices_list'].merge()
                );
            }

        }

    })(jQuery);
}