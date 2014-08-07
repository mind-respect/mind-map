/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "triple_brain.relative_tree_displayer_templates",
        "triple_brain.ui.group_relation",
        "triple_brain.selection_handler",
        "jquery-ui"
    ],
    function(RelativeTreeTemplates, GroupRelationUi, SelectionHandler){
        var api = {
            withServerFacade : function (serverFacade) {
                return new Self(serverFacade);
            }
        };
        function Self(serverFacade){
            this.serverFacade = serverFacade;
        }
        Self.prototype.create = function(){
            this.html = $(
                RelativeTreeTemplates['group_relation'].merge()
            ).data("group_relation", this.serverFacade);
            this._addLabel();
            this._addArrow();
            this._handleClick();
            return GroupRelationUi.withHtml(
                this.html
            );
        };

        Self.prototype._handleClick = function(){
            this.html.click(function(event){
                event.stopPropagation();
                SelectionHandler.setToSingleGroupRelation(
                    GroupRelationUi.withHtml(
                        $(this)
                    )
                );
            });
        };

        Self.prototype._addLabel = function(){
            $(
                RelativeTreeTemplates['group_relation_label_container'].merge({
                    label: this.serverFacade.getIdentification().getLabel()
                })
            ).appendTo(this.html);
        };
        Self.prototype._addArrow = function(){
            this.html.append("<span class='arrow'>");
        };
        return api;
    }
);