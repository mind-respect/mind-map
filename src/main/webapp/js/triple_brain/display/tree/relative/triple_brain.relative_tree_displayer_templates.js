/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "triple_brain.template"
    ],
    function (Template) {
        var api = {};
        var t = Template.withTemplateGroup(api);
        t.add(
            'root_vertex_super_container',
                "<div class='root-vertex-super-container' style='" +
                "top:{offset.y}px;" +
                "left:{offset.x}px;" +
                "'></div>"
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
            'edge_input',
            '<input type="text" value="{label}">'
        );
        t.add(
            "group_relation",
            "<div class='group-relation'></div>"
        );
        t.add(
            'group_relation_label_container',
                '<div class="label label-info">{label}</span>'
        );
        return api;
    }
);
