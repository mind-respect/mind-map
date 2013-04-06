/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_displayer_as_graph",
    "triple_brain.graph_displayer_as_absolute_tree",
    "triple_brain.graph_displayer_as_relative_tree"
], function(GraphDisplayerAsGraph, GraphDisplayerAsAbsoluteTree, GraphDisplayerAsRelativeTree){
    var api = {};
    api.getByName = function(name){
        switch(name){
            case "graph":
                return GraphDisplayerAsGraph
                break;
            case "relative_tree":
                return GraphDisplayerAsRelativeTree
                break;
        };
    };
    return api;
});