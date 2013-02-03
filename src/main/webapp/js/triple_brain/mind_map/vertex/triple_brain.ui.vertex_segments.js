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
            withHTMLVertex : function(htmlVertex){
                return new VertexSegments(htmlVertex);
            }
        }

        function VertexSegments(htmlVertex){

            this.intersectsWithSegment = function(segment){
                return leftSegment().intersectsWithSegment(segment) ||
                    rightSegment().intersectsWithSegment(segment) ||
                    topSegment().intersectsWithSegment(segment) ||
                    bottomSegment().intersectsWithSegment(segment);
            }

            this.intersectionPointWithSegment = function(segmentToCompare){
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
            };

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
                var startPoint = Point.centeredAtOrigin();
                startPoint.x = $(htmlVertex).offset().left;
                startPoint.y = $(htmlVertex).offset().top;
                var endPoint = Point.centeredAtOrigin();
                endPoint.x = $(htmlVertex).offset().left;
                endPoint.y = $(htmlVertex).offset().top + $(htmlVertex).height();
                return Segment.withStartAndEndPoint(startPoint, endPoint);
            }

            function rightSegment(){
                var startPoint = Point.centeredAtOrigin();
                startPoint.x = $(htmlVertex).offset().left + $(htmlVertex).width();
                startPoint.y = $(htmlVertex).offset().top;
                var endPoint = Point.centeredAtOrigin();
                endPoint.x = $(htmlVertex).offset().left + $(htmlVertex).width() ;
                endPoint.y = $(htmlVertex).offset().top + $(htmlVertex).height();
                return Segment.withStartAndEndPoint(startPoint, endPoint);
            }

            function topSegment(){
                var startPoint = Point.centeredAtOrigin();
                startPoint.x = $(htmlVertex).offset().left;
                startPoint.y = $(htmlVertex).offset().top;
                var endPoint = Point.centeredAtOrigin();
                endPoint.x = $(htmlVertex).offset().left + $(htmlVertex).width() ;
                endPoint.y = $(htmlVertex).offset().top;
                return Segment.withStartAndEndPoint(startPoint, endPoint);
            }

            function bottomSegment(){
                var startPoint = Point.centeredAtOrigin();
                startPoint.x = $(htmlVertex).offset().left;
                startPoint.y = $(htmlVertex).offset().top + $(htmlVertex).height();
                var endPoint = Point.centeredAtOrigin();
                endPoint.x = $(htmlVertex).offset().left + $(htmlVertex).width() ;
                endPoint.y = $(htmlVertex).offset().top + $(htmlVertex).height();
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