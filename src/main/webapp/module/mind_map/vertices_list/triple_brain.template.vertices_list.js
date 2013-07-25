/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.template"
],
    function(Template) {
        var api = {};
        var t = Template.withTemplateGroup(api);
        t.add('panel', "<div id='vertices-list-panel'></div>");
        t.add('title', "<h2 data-i18n='vertices_list:title'></h2>");

        t.add('sort_menu', "<div id='vertices_list_sort_menu'></div>");
        t.add('sort_menu_title', "<label for='vertices_list_sort-options'>Sort by:</label>");
        t.add('options_list', "<ul id='vertices-list-sort-options'></ul>");
        t.add('sort_by_label_option', "<li><input value='label' type='button' id='sort-by-label' class='sort-vertices-btn link-like-button'/></li>");
        t.add('sort_by_distance_from_central_vertex', "<li><input value='distance from center concept' type='button' id='sort-by-min-number-of-edges-from-center-vertex' class='sort-vertices-btn link-like-button' /></li>");

        t.add('vertices_list', "<ul id='vertices-list'></ul>");

        t.add('list_element', '<li class="vertices-list-element"><span class="min-number-of-edges-from-center-vertex"></span><input class="label link-like-button" type="button"></li>');
        return api;
    }
);



