define([
    "triple_brain.point",
    "triple_brain.transform_matrix_2d",
    "triple_brain.error"
],
    function(Point, TransformMatrix2d, Error) {
        var api = {
            withStartAndEndPoint:function (startPoint, endPoint) {
                return new Segment(startPoint, endPoint);
            },
            withStartAndEndPointAtOrigin:function () {
                return new Segment(
                    Point.centeredAtOrigin(),
                    Point.centeredAtOrigin()
                );
            }
        };

        function Segment(startPoint, endPoint) {
            this.startPoint = startPoint;
            this.endPoint = endPoint;
            this.middlePoint = function () {
                return Point.fromCoordinates(
                    (this.startPoint.x + this.endPoint.x) / 2,
                    (this.startPoint.y + this.endPoint.y) / 2
                )
            };
            this.intersectsWithSegment = function (segmentToCompare) {
                var lengthCross = this.length().cross(segmentToCompare.length());
                var distanceFromSegment = segmentToCompare.distanceFromSegment(this);
                var t = distanceFromSegment.cross(segmentToCompare.length()) / lengthCross;
                var u = distanceFromSegment.cross(this.length()) / lengthCross;
                if (0 <= u && u <= 1 && 0 <= t && t <= 1) {
                    return true;
                }
                return false;
            };
            this.intersectionPointWithSegment = function (segmentToCompare) {
                if (!this.intersectsWithSegment(segmentToCompare)) {
                    throw(
                        Error.withName(
                            "no_intersection"
                        )
                        );
                }
                var intersectionPoint = Point.centeredAtOrigin();

                var thisDeterminant = this.toMatrix().determinant();
                var segmentToCompareDeterminant = segmentToCompare.toMatrix().determinant();

                var dividendMatrix = TransformMatrix2d.withPositions(
                    thisDeterminant,
                    segmentToCompareDeterminant,
                    this.startPoint.x - this.endPoint.x,
                    segmentToCompare.startPoint.x - segmentToCompare.endPoint.x
                );

                var divisorMatrix = TransformMatrix2d.withPositions(
                    this.startPoint.x - this.endPoint.x,
                    segmentToCompare.startPoint.x - segmentToCompare.endPoint.x,
                    this.startPoint.y - this.endPoint.y,
                    segmentToCompare.startPoint.y - segmentToCompare.endPoint.y
                );

                var divisorDeterminant = divisorMatrix.determinant();

                intersectionPoint.x = dividendMatrix.determinant() / divisorDeterminant;

                dividendMatrix = TransformMatrix2d.withPositions(
                    thisDeterminant,
                    segmentToCompareDeterminant,
                    this.startPoint.y - this.endPoint.y,
                    segmentToCompare.startPoint.y - segmentToCompare.endPoint.y
                );

                intersectionPoint.y = dividendMatrix.determinant() / divisorDeterminant;

                return intersectionPoint;

            };

            this.toMatrix = function () {
                return TransformMatrix2d.fromSegment(this);
            };
            this.length = function () {
                var lengthAsPoint = Point.centeredAtOrigin();
                lengthAsPoint.x = this.endPoint.x - this.startPoint.x;
                lengthAsPoint.y = this.endPoint.y - this.startPoint.y;
                return lengthAsPoint;
            };
            this.distance = function(){
                var x = startPoint.x;
                var y = startPoint.y;
                var x0 = endPoint.x;
                var y0 = endPoint.y;
                return Math.sqrt((x -= x0) * x + (y -= y0) * y);
            };
            this.distanceFromSegment = function (segmentToCompare) {
                var distancePoint = Point.centeredAtOrigin();
                distancePoint.x = this.startPoint.x - segmentToCompare.startPoint.x;
                distancePoint.y = this.startPoint.y - segmentToCompare.startPoint.y;
                return distancePoint;
            };

            this.radianDirection = function () {
                return Math.atan2(
                    this.endPoint.y - this.startPoint.y,
                    this.endPoint.x - this.startPoint.x
                );
            };
            this.isValid = function () {
                return this.startPoint != undefined && this.endPoint != undefined;
            };
            this.clone = function () {
                return api.withStartAndEndPoint(
                    this.startPoint.clone(),
                    this.endPoint.clone());
            };
        }
//        Segment.prototype.toString = function()
//        {
//            return "startPoint: " + this.startPoint + " " +
//                "endPoint: " this.endPoint;
//        };
        return api;
    }
);




