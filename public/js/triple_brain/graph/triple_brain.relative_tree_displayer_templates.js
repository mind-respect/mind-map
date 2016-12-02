/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "triple_brain.template"
    ],
    function (Template) {
        "use strict";
        var api = {};
        var t = Template.withTemplateGroup(api);
        t.add(
            'root_vertex_super_container',
                "<div class='root-vertex-super-container' data-zoom='1'></div>"
        );
        t.add(
            'vertices_children_container',
            "<div class='vertices-children-container'></div>"
        );

        t.add(
            'vertex_tree_container',
                "<div class='vertex-tree-container'>" +
                "</div>"
        );

        t.add(
            "vertical_border",
                "<div class='vertical-border vertical-border-first'>" +
                "<div class='vertical-border-filling'></div>" +
                "</div>" +
                "<div class='vertical-border vertical-border-second'>" +
                "<div class='vertical-border-filling'></div>" +
                "</div>" +
                "<div class='vertical-border vertical-border-third'>" +
                "<div class='vertical-border-filling'></div>" +
                "</div>"
        );

        t.add(
            'vertex_container',
            "<div class='vertex-container'></div>"
        );
        t.add(
            "group_relation",
            "<div class='group-relation relation bubble graph-element'></div>"
        );
        return api;
    }
);
