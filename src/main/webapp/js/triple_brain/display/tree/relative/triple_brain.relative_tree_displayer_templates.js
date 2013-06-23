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
            "<div class='root-vertex-super-container' style='"+
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
            "<div class='vertex-tree-container'></div>"
        );

        t.add(
            'vertex_container',
            "<div class='vertex-container'></div>"
        );
        t.add(
            'edge',
            '<span class="relation" style="display:inline;"><span class="label label-info">{label}</span></span>'
        );
        t.add(
            'edge_input',
            '<input class="relation" type="text" value="{label}"></span>'
        );
        return api;
    }
);
