/*
 * Copyright Vincent Blouin under the GPL License version 3
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
        }
    };
    return api;
});