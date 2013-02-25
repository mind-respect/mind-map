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
            'root_vertex_container',
            "<div class='vertices-children-container' style='"+
                "position:absolute;" +
                "top:{offset.y}px;" +
                "left:{offset.x}px;" +
                "height:100%;" +
                "min-height:100%" +
                "'></div>"
        );
        t.add(
            'vertices_children_container',
            "<div class='vertices-children-container' style='" +
                "margin:0 0 0 15em;position:relative;top:-100%;'></div>"
        );

        t.add(
            'vertex_tree_container',
            "<div class='vertices-children-container' style='" +
                "position:relative;top:-100%;'></div>"
        );

        t.add(
            'vertex_container',
            "<div class='vertex-container' style='" +
                "float:left;position:relative;top:50%'></div>"
        );

        return api;
    }
);
