/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.relative_tree_vertex",
    "triple_brain.tree_edge",
    "triple_brain.ui.group_relation",
    "triple_brain.suggestion_bubble_ui",
    "triple_brain.suggestion_relation_ui",
    "triple_brain.schema_ui",
    "triple_brain.property_ui"
], function (RelativeTreeVertex, TreeEdge, GroupRelationUi, SuggestionBubbleUi, SuggestionRelationUi, SchemaUi, PropertyUi) {
    "use strict";
    var api = {};
    api.fromHtml = function(html){
        var uiFacade;
        if(html.hasClass("vertex")){
            if(html.hasClass("suggestion")){
                uiFacade = SuggestionBubbleUi;
            }else if(html.hasClass("schema")){
                uiFacade = SchemaUi;
            }else{
                uiFacade = RelativeTreeVertex;
            }
        }else if(html.hasClass("relation")){
            if(html.hasClass("suggestion")){
                uiFacade = SuggestionRelationUi;
            }else if(html.hasClass("property")){
                uiFacade = PropertyUi;
            }else{
                uiFacade = TreeEdge;
            }
        }else if(html.hasClass("group-relation")){
            uiFacade = GroupRelationUi;
        }
        return uiFacade.withHtml(html);
    };
    api.fromSubHtml = function(html){
        return api.fromHtml(
            html.closest(".bubble")
        );
    };
    return api;
});