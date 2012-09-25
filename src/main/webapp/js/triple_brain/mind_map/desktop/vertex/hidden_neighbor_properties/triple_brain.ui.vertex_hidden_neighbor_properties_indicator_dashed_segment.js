define([
    "triple_brain.ui.graph"
],
    function(Graph){
        var api = {
            withSegment : function(segment){
                return new DashedSegment(segment);
            }
        }
        function DashedSegment(segment){
            var numberOfDashes = 3;
            var distanceBetweenEachDash = 5;
            var radianDirection = segment.radianDirection();
            var dash = segment;
            var canvas = Graph.canvas();
            var red = "#FF0000";
            var lineWidth = "1";
            var drawnComponents = [];
            this.draw = function(){
                for(var j = 1 ; j <= numberOfDashes; j++){
                    updateDashEndPoint();
                    drawDash();
                    updateDashStartPoint();
                }
            }
            this.remove = function(){
                while(drawnComponents.length != 0){
                    var drawnComponent =  drawnComponents.pop();
                    drawnComponent.remove();
                }
            }
            function updateDashEndPoint(){
                dash.endPoint.x = dash.startPoint.x + distanceBetweenEachDash * Math.cos(radianDirection);
                dash.endPoint.y = dash.startPoint.y + distanceBetweenEachDash * Math.sin(radianDirection);
            }
            function drawDash(){
                var dashPath = "M" + dash.startPoint.x + " " +
                    dash.startPoint.y + " L" + dash.endPoint.x  + " " +
                    dash.endPoint.y;
                drawnComponents.push(
                    canvas.path(dashPath).
                    attr("stroke-width", lineWidth)
                    .attr("stroke", red)
                );
            }
            function updateDashStartPoint(){
                dash.startPoint.x = dash.endPoint.x + distanceBetweenEachDash * Math.cos(radianDirection);
                dash.startPoint.y = dash.endPoint.y + distanceBetweenEachDash * Math.sin(radianDirection);
            }
        }
        return api;
    }
);
