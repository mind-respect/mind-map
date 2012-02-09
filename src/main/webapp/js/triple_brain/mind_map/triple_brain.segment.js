require("Logger");

if (triple_brain.segment == undefined) {

    var logger = new Logger('triple_brain.segment');

    triple_brain.segment = {
        withStartAndEndPoint : function(startPoint, endPoint){
            return new Segment(startPoint, endPoint);
        },
        withStartAndEndPointAtOrigin : function(){
            return new Segment(
                triple_brain.point.centeredAtOrigin()
              , triple_brain.point.centeredAtOrigin());
        }
    }

    function Segment(startPoint, endPoint){
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.middlePoint = function(){
            return triple_brain.point.fromCoordinates(
                (this.startPoint.x + this.endPoint.x) / 2,
                (this.startPoint.y + this.endPoint.y) / 2
            )
        }
        this.intersectsWithSegment = function(segmentToCompare){
            var lengthCross = this.length().cross(segmentToCompare.length());
            var distanceFromSegment = segmentToCompare.distanceFromSegment(this);
            var t = distanceFromSegment.cross(segmentToCompare.length()) / lengthCross;
            var u = distanceFromSegment.cross(this.length()) / lengthCross;
            if (0 <= u && u <= 1 && 0 <= t && t <= 1) {
                return true;
            }
            return false;
        }
        this.intersectionPointWithSegment = function(segmentToCompare){
            if(!this.intersectsWithSegment(segmentToCompare)){
                throw(
                    triple_brain.error.withName(
                        "no_intersection"
                    )
                );
            }
            var intersectionPoint = triple_brain.point.centeredAtOrigin();

            var thisDeterminant = this.toMatrix().determinant();
            var segmentToCompareDeterminant = segmentToCompare.toMatrix().determinant();

            var dividendMatrix = triple_brain.transform_matrix_2d.withPositions(
                thisDeterminant,
                segmentToCompareDeterminant,
                this.startPoint.x - this.endPoint.x,
                segmentToCompare.startPoint.x - segmentToCompare.endPoint.x
            );

            var divisorMatrix = triple_brain.transform_matrix_2d.withPositions(
                this.startPoint.x - this.endPoint.x,
                segmentToCompare.startPoint.x - segmentToCompare.endPoint.x,
                this.startPoint.y - this.endPoint.y,
                segmentToCompare.startPoint.y - segmentToCompare.endPoint.y
            );

            var divisorDeterminant = divisorMatrix.determinant();

            intersectionPoint.x = dividendMatrix.determinant() / divisorDeterminant;

            dividendMatrix = triple_brain.transform_matrix_2d.withPositions(
                thisDeterminant,
                segmentToCompareDeterminant,
                this.startPoint.y - this.endPoint.y,
                segmentToCompare.startPoint.y - segmentToCompare.endPoint.y
            );

            intersectionPoint.y = dividendMatrix.determinant() / divisorDeterminant;

            return intersectionPoint;

        }

        this.toMatrix = function(){
            return triple_brain.transform_matrix_2d.fromSegment(this);
        }
        this.length = function(){
            var lengthAsPoint = triple_brain.point.centeredAtOrigin();
            lengthAsPoint.x = this.endPoint.x - this.startPoint.x;
            lengthAsPoint.y = this.endPoint.y - this.startPoint.y;
            return lengthAsPoint;
        }
        this.distanceFromSegment = function(segmentToCompare){
            var distancePoint = triple_brain.point.centeredAtOrigin();
            distancePoint.x = this.startPoint.x - segmentToCompare.startPoint.x;
            distancePoint.y = this.startPoint.y - segmentToCompare.startPoint.y;
            return distancePoint;
        }

        this.radianDirection = function(){
            return Math.atan2(
                this.endPoint.y - this.startPoint.y,
                this.endPoint.x - this.startPoint.x
            );
        }
        this.isValid = function(){
            return this.startPoint != undefined && this.endPoint != undefined;
        }
        this.clone = function(){
            return triple_brain.segment.withStartAndEndPoint(
                this.startPoint.clone(),
                this.endPoint.clone());
        }
    }


}