/**
 * @author Vincent Blouin
 */
if (triple_brain.template.vertices_list == undefined) {
    (function($) {
        triple_brain.template.vertices_list = {
            add: function(name, html) {
                triple_brain.template.vertices_list[name] = {
                    merge: function(obj) {
                        logger.debug('Merging template: ' + name);
                        return $($.nano(html, obj || null));
                    }
                }
            }
        };
        function add(name, html){
            triple_brain.template.vertices_list.add(name, html);
        }
        add('panel', "<div id='vertices-list-panel'></div>");
        add('title', "<h2>Concepts on page</h2>");

        add('sort_menu', "<div id='vertices_list_sort_menu'></div>");
        add('sort_menu_title', "<label for='vertices_list_sort-options'>Sort by:</label>");
        add('options_list', "<ul id='vertices-list-sort-options'></ul>");
        add('sort_by_label_option', "<li><input value='label' type='button' id='sort-by-label' class='sort-vertices-btn'/></li>");
        add('sort_by_distance_from_central_vertex', "<li><input value='distance from center concept' type='button' id='sort-by-min-number-of-edges-from-center-vertex' class='sort-vertices-btn' /></li>");

        add('vertices_list', "<ul id='vertices-list'></ul>");

        add('list_element', '<li class="vertices-list-element"><span class="min-number-of-edges-from-center-vertex"></span><span class="label"></span></li>');
    })(jQuery);
}



