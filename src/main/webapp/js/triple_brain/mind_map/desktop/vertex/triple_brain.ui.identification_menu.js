/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.ui.identification_menu == undefined) {
    var externalResourceStatic = triple_brain.external_resource;
    var vertexService = triple_brain.vertex;
    triple_brain.ui.identification_menu = {
        ofVertex : function(vertex){
            return new IdentificationMenu(vertex);
        }
    }

    function IdentificationMenu(vertex){
        var identificationMenu = this;
        var menuHTMLVariables = {
            vertex_id : vertex.getId()
        };
        var html;
        this.create = function(){
            html = triple_brain.template['identification_menu'].merge(menuHTMLVariables);
            triple_brain.ui.graph.addHTML(html);
            addTitle();
            addSubTitle();
            position();
            var identificationTextField = addIdentificationTextField();
            $(identificationTextField).focus();
            $(html).click(function(e){
                e.stopPropagation();
            });
            return identificationMenu;
        }

        this.reEvaluatePosition = function(){
            position();
        }

        function addTitle(){
            $(html).append(
                triple_brain.template['identification_menu_title'].merge()
            );
        }

        function addSubTitle(){
            $(html).append(
                triple_brain.template['identification_menu_sub_title'].merge()
            );
        }
        function position(){
            var menuOffset = triple_brain.point.fromCoordinates(
                vertex.width(),
                vertex.height() / 2 - $(html).height() / 2
            )

            var menuPosition = triple_brain.point.sumOfPoints(
                vertex.position(),
                menuOffset
            );
            if(isMenuPositionOffScreen(menuPosition)){
                menuPosition.y = 10;
            }

            $(html).css('left', menuPosition.x);
            $(html).css('top', menuPosition.y);
        }

        function isMenuPositionOffScreen(menuPosition){
            return menuPosition.y < 10;
        }

        function addIdentificationTextField(){
            var identificationTextField = triple_brain.template[
                'identification_textfield'
                ].merge();
            $(html).append(identificationTextField);
            $(identificationTextField).suggest({
                "zIndex": 20
            })
            .bind("fb-select", function(e, data)
            {
                var semanticMenu = $(this).closest('.peripheral-menu');
                var vertex = triple_brain.ui.vertex.withId($(semanticMenu).attr('vertex-id'));
                var typeId = data['n:type'].id;
                if(triple_brain.freebase.isOfTypeTypeFromTypeId(typeId)){
                    vertexService.updateType(
                        vertex,
                        externalResourceStatic.fromFreebaseSuggestion(
                            data
                        )
                    );
                }else{
                    var resourceUri = triple_brain.freebase.freebaseIdToURI(data.id);
                    vertexService.updateSameAs(vertex, resourceUri);
                }
            });
            return identificationTextField;
        }
    }
    var eventBus = triple_brain.event_bus;

    eventBus.subscribe(
        '/event/ui/graph/vertex/type/properties/updated',
        function(event, vertexUi, suggestions) {
            if(suggestions.length > 0){
                vertexUi.setSuggestions(suggestions);
                vertexUi.showSuggestionButton();
            }
        }
    );
}