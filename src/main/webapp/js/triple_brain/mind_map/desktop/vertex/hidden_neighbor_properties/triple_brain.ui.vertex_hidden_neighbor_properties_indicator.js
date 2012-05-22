
if (triple_brain.ui.vertex_hidden_neighbor_properties_indicator == undefined) {

    triple_brain.ui.vertex_hidden_neighbor_properties_indicator = {
        withVertex : function(vertex){
            return new HiddenNeighborPropertiesIndicator(vertex);
        }
    }

    function HiddenNeighborPropertiesIndicator(vertex){
       this.build = function(){
           var numberOfHiddenConnectedVertices = vertex.numberOfHiddenConnectedVertices();
           var lengthInPixels = numberOfHiddenConnectedVertices == 1 ? 1 : 40;
           var startPoint = triple_brain.point.fromCoordinates(
                vertex.position().x + vertex.width(),
                vertex.position().y + (vertex.height() / 2)
           );
           var distanceBetweenEachDashedSegment = numberOfHiddenConnectedVertices == 1 ? 0: lengthInPixels / (vertex.numberOfHiddenConnectedVertices() - 1);
           var plainSegment = triple_brain.segment.withStartAndEndPointAtOrigin();
           plainSegment.startPoint = startPoint;
           var horizontalDistanceOfDashedSegment = 20;
           plainSegment.endPoint.x = vertex.position().x + vertex.width() + horizontalDistanceOfDashedSegment;
           for(i = 0; i < numberOfHiddenConnectedVertices; i++){
                plainSegment.endPoint.y = startPoint.y - (lengthInPixels / 2) + (i * distanceBetweenEachDashedSegment);
                var dashedSegment = triple_brain.ui.vertex.hidden_neighbor_properties_indicator_dashed_segment.withSegment(plainSegment.clone());
                dashedSegment.draw();
           }

           var hiddenNeighborPropertiesContainer = triple_brain.template['hidden_property_container'].merge();
           $("#drawn_graph").append(hiddenNeighborPropertiesContainer);

           $(hiddenNeighborPropertiesContainer).css('min-width', lengthInPixels);
           $(hiddenNeighborPropertiesContainer).css('min-height', lengthInPixels);
           $(hiddenNeighborPropertiesContainer).css('left', startPoint.x);
           $(hiddenNeighborPropertiesContainer).css('top', startPoint.y - (lengthInPixels / 2));
           var timer;
           $(hiddenNeighborPropertiesContainer).mouseenter(function(e){
               if(timer) {
                       clearTimeout(timer);
                       timer = null
               }
               timer = setTimeout(function() {
                   var hiddenPropertyMenu = triple_brain.template['hidden_property_menu'].merge();
                   $("#drawn_graph").append(hiddenPropertyMenu);
                   $(hiddenPropertyMenu).append(triple_brain.template['hidden_properties_title'].merge());
                   propertyList = triple_brain.template['hidden_property_list'].merge();
                   $(hiddenPropertyMenu).append(propertyList);
                   var nameOfHiddenProperties = vertex.nameOfHiddenProperties();
                   for(var i in nameOfHiddenProperties){
                       var hiddenProperty = {};
                       hiddenProperty.name = nameOfHiddenProperties[i];
                       var property = triple_brain.template['hidden_property'].merge(hiddenProperty);
                       $(propertyList).append(property);
                   }

                   $(hiddenNeighborPropertiesContainer).css('top', startPoint.y - (lengthInPixels / 2));

                   $(hiddenPropertyMenu).css('left', $(hiddenNeighborPropertiesContainer).position().left + 30);
                   $(hiddenPropertyMenu).css('top', ($(hiddenNeighborPropertiesContainer).position().top + $(hiddenNeighborPropertiesContainer).height() / 2) - (parseInt($(hiddenPropertyMenu).css('height')) / 2));

               }, 1000)

           });
           $(hiddenNeighborPropertiesContainer).mouseleave(function(e){
               clearTimeout(timer);
           });
       }
    }
}