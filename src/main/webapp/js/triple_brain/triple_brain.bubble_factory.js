/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.relative_tree_vertex",
    "triple_brain.tree_edge",
    "triple_brain.ui.group_relation",
    "triple_brain.suggestion_bubble_ui",
    "triple_brain.suggestion_relation_ui"
], function (RelativeTreeVertex, TreeEdge, GroupRelationUi, SuggestionBubbleUi, SuggestionRelationUi) {
    "use strict";
    var api = {};
    api.fromHtml = function(html){
        if(html.hasClass("vertex")){
            if(html.hasClass("suggestion")){
                return SuggestionBubbleUi.withHtml(html);
            }else{
                return RelativeTreeVertex.withHtml(html);
            }
        }else if(html.hasClass("relation")){
            if(html.hasClass("suggestion")){
                return SuggestionRelationUi.withHtml(html);
            }else{
                return TreeEdge.withHtml(html);
            }
        }else if(html.hasClass("group-relation")){
            return GroupRelationUi.withHtml(html);
        }
    };
    api.fromSubHtmlComponent = function(html){

    };
    return api;
});