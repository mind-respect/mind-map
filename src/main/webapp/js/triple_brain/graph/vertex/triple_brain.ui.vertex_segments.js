/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "triple_brain.error",
        "triple_brain.point",
        "triple_brain.segment",
        "polyk"
    ],
    function (Error, Point, Segment, Polyk) {
        "use strict";
        return {
            LEFT_SIDE: 0,
            RIGHT_SIDE: 0,
            TOP_SIDE: 0,
            BOTTOM_SIDE: 0,
            withHtmlVertex: function (htmlVertex) {
                return new VertexSegments(htmlVertex);
            }
        };

        function VertexSegments(htmlVertex) {
            var _rectangleArray;
            var _width;
            var _height;
            var _topLeftPoint;
            this.intersectsWithSegment = function (segment) {
                var rectangleArray = getRectangleArray();
                return containsStartPoint() || containsEndPoint();
                function containsStartPoint() {
                    var startPoint = segment.startPoint;
                    return PolyK.ContainsPoint(
                        rectangleArray,
                        startPoint.x,
                        startPoint.y
                    );
                }

                function containsEndPoint() {
                    var endPoint = segment.endPoint;
                    return PolyK.ContainsPoint(
                        rectangleArray,
                        endPoint.x,
                        endPoint.y
                    );
                }
            };

            this.closestPointToSegment = function (segment) {
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

            this.intersectionPointWithSegment = function (segmentToCompare) {
                var vertexSegment = leftSegment();
                if (vertexSegment.intersectsWithSegment(segmentToCompare)) {
                    return vertexSegment.intersectionPointWithSegment(segmentToCompare);
                }
                vertexSegment = rightSegment();
                if (vertexSegment.intersectsWithSegment(segmentToCompare)) {
                    return vertexSegment.intersectionPointWithSegment(segmentToCompare);
                }
                vertexSegment = topSegment();
                if (vertexSegment.intersectsWithSegment(segmentToCompare)) {
                    return vertexSegment.intersectionPointWithSegment(segmentToCompare);
                }
                vertexSegment = bottomSegment();
                if (vertexSegment.intersectsWithSegment(segmentToCompare)) {
                    return vertexSegment.intersectionPointWithSegment(segmentToCompare);
                }
                throw(
                    Error.withName(
                        "no_intersection"
                    )
                    );
            };


            function getRectangleArray() {
                if (_rectangleArray !== undefined) {
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

            var widthIncrease = 40,
                heightIncrease = 40;

            function getWidth() {
                if (_width === undefined) {
                    _width = $(htmlVertex).width() + widthIncrease;
                }
                return _width
            }

            function getHeight() {
                if (_height === undefined) {
                    _height = $(htmlVertex).height() + heightIncrease;
                }
                return _height
            }

            function getTopLeftPoint() {
                if (_topLeftPoint === undefined) {
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

            function leftSegment() {
                var topLeftPoint = getTopLeftPoint(),
                    endPoint = Point.centeredAtOrigin();
                endPoint.x = topLeftPoint.x;
                endPoint.y = topLeftPoint.y + getHeight();
                return Segment.withStartAndEndPoint(
                    Point.fromPoint(topLeftPoint),
                    endPoint
                );
            }

            function rightSegment() {
                var startPoint = Point.fromCoordinates(
                            getTopLeftPoint().x + getWidth(),
                        getTopLeftPoint().y
                    ),
                    endPoint = Point.fromCoordinates(
                            getTopLeftPoint().x + getWidth(),
                            getTopLeftPoint().y + getHeight()
                    );
                return Segment.withStartAndEndPoint(startPoint, endPoint);
            }

            function topSegment() {
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

            function bottomSegment() {
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
    }
);