/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_displayer_as_relative_tree"
], function(GraphDisplayerAsRelativeTree){
    "use strict";
    var api = {};
    api.getByName = function(name){
        switch(name){
            case "relative_tree":
                return GraphDisplayerAsRelativeTree;
                break;
        }
    };
    return api;
});