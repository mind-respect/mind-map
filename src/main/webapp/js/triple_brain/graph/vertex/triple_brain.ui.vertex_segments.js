/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.error",
    "triple_brain.point",
    "triple_brain.segment"
],
    function(Error, Point, Segment){
        var api = {
            LEFT_SIDE : 0,
            RIGHT_SIDE : 0,
            TOP_SIDE : 0,
            BOTTOM_SIDE : 0,
            withHtmlVertex : function(htmlVertex){
                return new VertexSegments(htmlVertex);
            }
        }

        function VertexSegments(htmlVertex){
            var _rectangleArray;
            var _width;
            var _height;
            var _topLeftPoint;
            this.intersectsWithSegment = function(segment){
                var rectangleArray = getRectangleArray();
                return containsStartPoint() || containsEndPoint();
                function containsStartPoint(){
                    var startPoint = segment.startPoint;
                    return PolyK.ContainsPoint(
                        rectangleArray,
                        startPoint.x,
                        startPoint.y
                    );
                }
                function containsEndPoint(){
                    var endPoint = segment.endPoint;
                    return PolyK.ContainsPoint(
                        rectangleArray,
                        endPoint.x,
                        endPoint.y
                    );
                }
//                return leftSegment().intersectsWithSegment(segment) ||
//                    rightSegment().intersectsWithSegment(segment) ||
//                    topSegment().intersectsWithSegment(segment) ||
//                    bottomSegment().intersectsWithSegment(segment);
            };

            this.closestPointToSegment = function(segment){
                 var toStartPoint = PolyK.ClosestEdge(
                     getRectangleArray(),
                     segment.startPoint.x,
                     segment.startPoint.y
                 );

                var toEndPoint = PolyK.ClosestEdge(
                    getRectangleArray(),
                    segment.endPoint.x,
                    segment.endPoint.y
                );
                var closest = toStartPoint.dist < toEndPoint.dist ?
                    toStartPoint : toEndPoint;
                return Point.fromCoordinates(
                    closest.point.x,
                    closest.point.y
                );
            };

            this.intersectionPointWithSegment = function(segmentToCompare){
//                var startPoint = segmentToCompare.startPoint;
//                var endPoint = segmentToCompare.endPoint;
//                var answer = {};
//                if(calculate(leftSegment())){
//                    return calculate(leftSegment())
//                }else if(calculate(rightSegment())){
//                    return calculate(rightSegment());
//                }else if(calculate(bottomSegment())){
//                    return calculate(bottomSegment())
//                }else if(calculate(topSegment())){
//                    return calculate(topSegment())
//                }
//                var closestPoint = PolyK.Raycast(
//                    getRectangleArray(),
//                    segmentToCompare.startPoint.x,
//                    segmentToCompare.startPoint.y,
//                    segmentToCompare.endPoint.x,
//                    segmentToCompare.endPoint.y
//                ).point;
//                return Point.fromCoordinates(
//                    closestPoint.x,
//                    closestPoint.y
//                );

                var vertexSegment = leftSegment();
                if(vertexSegment.intersectsWithSegment(segmentToCompare)){
                    return vertexSegment.intersectionPointWithSegment(segmentToCompare);
                }
                var vertexSegment = rightSegment();
                if(vertexSegment.intersectsWithSegment(segmentToCompare)){
                    return vertexSegment.intersectionPointWithSegment(segmentToCompare);
                }
                var vertexSegment = topSegment();
                if(vertexSegment.intersectsWithSegment(segmentToCompare)){
                    return vertexSegment.intersectionPointWithSegment(segmentToCompare);
                }
                var vertexSegment = bottomSegment();
                if(vertexSegment.intersectsWithSegment(segmentToCompare)){
                    return vertexSegment.intersectionPointWithSegment(segmentToCompare);
                }
                throw(
                    Error.withName(
                        "no_intersection"
                    )
                    );
                function calculate(segment){
                    var result = PolyK._GetLineIntersection(
                        segment.startPoint,
                        segment.endPoint,
                        startPoint,
                        endPoint,
                        answer
                    );
                    if(result){
                        return Point.fromCoordinates(
                            result.x,
                            result.y
                        )
                    }
                    return result;
                }
            };



            function getRectangleArray(){
                if(_rectangleArray !== undefined){
                    return _rectangleArray;
                }
                var width = $(htmlVertex).width();
                var height = $(htmlVertex).height();
                var offset = $(htmlVertex).offset();
                var position = Point.fromCoordinates(
                    offset.left,
                    offset.top
                );
                var topLeft = Point.fromPoint(position);
                var topRight = Point.fromCoordinates(
                    position.x + width,
                    position.y
                );
                var bottomLeft = Point.fromCoordinates(
                    position.x,
                    position.y + height
                );
                var bottomRight = Point.fromCoordinates(
                    position.x + width,
                    position.y + height
                );
                _rectangleArray = [
                    bottomLeft.x,
                    bottomLeft.y,
                    topLeft.x,
                    topLeft.y,
                    topRight.x,
                    topRight.y,
                    bottomRight.x,
                    bottomRight.y
                ];
                return _rectangleArray;
            }

            this.sideThatIntersectsWithAnotherSegmentUsingMarginOfError = function(segmentToCompare, marginOfError){

                if(leftSegmentWithmarginOfError(marginOfError).intersectsWithSegment(segmentToCompare)){
                    return new Side(leftSegment(), api.LEFT_SIDE);
                } else if(rightSegmentWithmarginOfError(marginOfError).intersectsWithSegment(segmentToCompare)){
                    return new Side(rightSegment(), api.RIGHT_SIDE);
                } else if(topSegmentWithmarginOfError(marginOfError).intersectsWithSegment(segmentToCompare)){
                    return new Side(topSegment(), api.TOP_SIDE);
                } else if(bottomSegmentWithmarginOfError(marginOfError).intersectsWithSegment(segmentToCompare)){
                    return new Side(bottomSegment(), api.BOTTOM_SIDE);
                }
                return undefined;
            }

            var widthIncrease = 40;
            var heightIncrease = 40;

            function getWidth(){
                if(_width === undefined){
                    _width = $(htmlVertex).width() + widthIncrease;
                }
                return _width
            }

            function getHeight(){
                if(_height === undefined){
                    _height = $(htmlVertex).height() + heightIncrease;
                }
                return _height
            }

            function getTopLeftPoint(){
                if(_topLeftPoint === undefined){
                    var offset = $(htmlVertex).offset();
                    var x = offset.left - widthIncrease / 2;
                    var y = offset.top - heightIncrease / 2;
                    _topLeftPoint = Point.fromCoordinates(
                        x,
                        y
                    );
                }
                return _topLeftPoint;
            }

            function leftSegmentWithmarginOfError(marginOfError){
                var leftSegmentWithmarginOfError = leftSegment();
                var translationVectorForLeftSegment = Point.fromCoordinates(marginOfError, 0);
                leftSegmentWithmarginOfError.startPoint = Point.sumOfPoints(leftSegmentWithmarginOfError.startPoint, translationVectorForLeftSegment);
                leftSegmentWithmarginOfError.endPoint = Point.sumOfPoints(leftSegmentWithmarginOfError.endPoint, translationVectorForLeftSegment);
                return leftSegmentWithmarginOfError;
            }

            function rightSegmentWithmarginOfError(marginOfError){
                var rightSegmentWithmarginOfError = rightSegment();
                var translationVectorForLeftSegment = Point.fromCoordinates(marginOfError * -1, 0);
                rightSegmentWithmarginOfError.startPoint = Point.sumOfPoints(rightSegmentWithmarginOfError.startPoint, translationVectorForLeftSegment);
                rightSegmentWithmarginOfError.endPoint = Point.sumOfPoints(rightSegmentWithmarginOfError.endPoint, translationVectorForLeftSegment);
                return rightSegmentWithmarginOfError;
            }

            function topSegmentWithmarginOfError(marginOfError){
                var topSegmentWithmarginOfError = topSegment();
                var translationVectorForLeftSegment = Point.fromCoordinates(0, marginOfError * -1);
                topSegmentWithmarginOfError.startPoint = Point.sumOfPoints(topSegmentWithmarginOfError.startPoint, translationVectorForLeftSegment);
                topSegmentWithmarginOfError.endPoint = Point.sumOfPoints(topSegmentWithmarginOfError.endPoint, translationVectorForLeftSegment);
                return topSegmentWithmarginOfError;
            }

            function bottomSegmentWithmarginOfError(marginOfError){
                var bottomSegmentWithmarginOfError = bottomSegment();
                var translationVectorForLeftSegment = Point.fromCoordinates(0, marginOfError);
                bottomSegmentWithmarginOfError.startPoint = Point.sumOfPoints(bottomSegmentWithmarginOfError.startPoint, translationVectorForLeftSegment);
                bottomSegmentWithmarginOfError.endPoint = Point.sumOfPoints(bottomSegmentWithmarginOfError.endPoint, translationVectorForLeftSegment);
                return bottomSegmentWithmarginOfError;
            }

            function leftSegment(){
                var topLeftPoint = getTopLeftPoint();
                var endPoint = Point.centeredAtOrigin();
                endPoint.x = topLeftPoint.x
                endPoint.y = topLeftPoint.y + getHeight();
                return Segment.withStartAndEndPoint(
                    Point.fromPoint(topLeftPoint),
                    endPoint
                );
            }

            function rightSegment(){
                var startPoint = Point.fromCoordinates(
                    getTopLeftPoint().x + getWidth(),
                    getTopLeftPoint().y
                )
                var endPoint = Point.fromCoordinates(
                    getTopLeftPoint().x + getWidth(),
                    getTopLeftPoint().y + getHeight()
                )
                return Segment.withStartAndEndPoint(startPoint, endPoint);
            }

            function topSegment(){
                var endPoint = Point.fromCoordinates(
                    getTopLeftPoint().x + getWidth(),
                    getTopLeftPoint().y
                );
                return Segment.withStartAndEndPoint(
                    Point.fromPoint(
                        getTopLeftPoint()
                    ), endPoint
                );
            }

            function bottomSegment(){
                var startPoint = Point.fromCoordinates(
                    getTopLeftPoint().x,
                    getTopLeftPoint().y + getHeight()
                );
                var endPoint = Point.fromCoordinates(
                    getTopLeftPoint().x + getWidth(),
                    getTopLeftPoint().y + getHeight()
                );
                return Segment.withStartAndEndPoint(startPoint, endPoint);
            }
        }
        function Side(segment, name){
            this.segment = segment;
            this.name = name;
        }
        return api;
    }
);