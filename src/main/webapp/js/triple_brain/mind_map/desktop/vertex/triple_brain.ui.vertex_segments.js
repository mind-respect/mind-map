/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.ui.vertex_segments == undefined) {

    triple_brain.ui.vertex_segments = {
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
                triple_brain.error.withName(
                    "no_intersection"
                )
            );
        };

        this.sideThatIntersectsWithAnotherSegmentUsingMarginOfError = function(segmentToCompare, marginOfError){

            if(leftSegmentWithmarginOfError(marginOfError).intersectsWithSegment(segmentToCompare)){
                return new Side(leftSegment(), triple_brain.ui.vertex_segments.LEFT_SIDE);
            } else if(rightSegmentWithmarginOfError(marginOfError).intersectsWithSegment(segmentToCompare)){
                return new Side(rightSegment(), triple_brain.ui.vertex_segments.RIGHT_SIDE);
            } else if(topSegmentWithmarginOfError(marginOfError).intersectsWithSegment(segmentToCompare)){
                return new Side(topSegment(), triple_brain.ui.vertex_segments.TOP_SIDE);
            } else if(bottomSegmentWithmarginOfError(marginOfError).intersectsWithSegment(segmentToCompare)){
                return new Side(bottomSegment(), triple_brain.ui.vertex_segments.BOTTOM_SIDE);
            }
            return undefined;
        }

        function leftSegmentWithmarginOfError(marginOfError){
            var leftSegmentWithmarginOfError = leftSegment();
            var translationVectorForLeftSegment = triple_brain.point.fromCoordinates(marginOfError, 0);
            leftSegmentWithmarginOfError.startPoint = triple_brain.point.sumOfPoints(leftSegmentWithmarginOfError.startPoint, translationVectorForLeftSegment);
            leftSegmentWithmarginOfError.endPoint = triple_brain.point.sumOfPoints(leftSegmentWithmarginOfError.endPoint, translationVectorForLeftSegment);
            return leftSegmentWithmarginOfError;
        }

        function rightSegmentWithmarginOfError(marginOfError){
            var rightSegmentWithmarginOfError = rightSegment();
            var translationVectorForLeftSegment = triple_brain.point.fromCoordinates(marginOfError * -1, 0);
            rightSegmentWithmarginOfError.startPoint = triple_brain.point.sumOfPoints(rightSegmentWithmarginOfError.startPoint, translationVectorForLeftSegment);
            rightSegmentWithmarginOfError.endPoint = triple_brain.point.sumOfPoints(rightSegmentWithmarginOfError.endPoint, translationVectorForLeftSegment);
            return rightSegmentWithmarginOfError;
        }

        function topSegmentWithmarginOfError(marginOfError){
            var topSegmentWithmarginOfError = topSegment();
            var translationVectorForLeftSegment = triple_brain.point.fromCoordinates(0, marginOfError * -1);
            topSegmentWithmarginOfError.startPoint = triple_brain.point.sumOfPoints(topSegmentWithmarginOfError.startPoint, translationVectorForLeftSegment);
            topSegmentWithmarginOfError.endPoint = triple_brain.point.sumOfPoints(topSegmentWithmarginOfError.endPoint, translationVectorForLeftSegment);
            return topSegmentWithmarginOfError;
        }

        function bottomSegmentWithmarginOfError(marginOfError){
            var bottomSegmentWithmarginOfError = bottomSegment();
            var translationVectorForLeftSegment = triple_brain.point.fromCoordinates(0, marginOfError);
            bottomSegmentWithmarginOfError.startPoint = triple_brain.point.sumOfPoints(bottomSegmentWithmarginOfError.startPoint, translationVectorForLeftSegment);
            bottomSegmentWithmarginOfError.endPoint = triple_brain.point.sumOfPoints(bottomSegmentWithmarginOfError.endPoint, translationVectorForLeftSegment);
            return bottomSegmentWithmarginOfError;
        }

        function leftSegment(){
            var startPoint = triple_brain.point.centeredAtOrigin();
            startPoint.x = $(htmlVertex).offset().left;
            startPoint.y = $(htmlVertex).offset().top;
            var endPoint = triple_brain.point.centeredAtOrigin();
            endPoint.x = $(htmlVertex).offset().left;
            endPoint.y = $(htmlVertex).offset().top + $(htmlVertex).height();
            return triple_brain.segment.withStartAndEndPoint(startPoint, endPoint);
        }

        function rightSegment(){
            var startPoint = triple_brain.point.centeredAtOrigin();
            startPoint.x = $(htmlVertex).offset().left + $(htmlVertex).width();
            startPoint.y = $(htmlVertex).offset().top;
            var endPoint = triple_brain.point.centeredAtOrigin();
            endPoint.x = $(htmlVertex).offset().left + $(htmlVertex).width() ;
            endPoint.y = $(htmlVertex).offset().top + $(htmlVertex).height();
            return triple_brain.segment.withStartAndEndPoint(startPoint, endPoint);
        }

        function topSegment(){
            var startPoint = triple_brain.point.centeredAtOrigin();
            startPoint.x = $(htmlVertex).offset().left;
            startPoint.y = $(htmlVertex).offset().top;
            var endPoint = triple_brain.point.centeredAtOrigin();
            endPoint.x = $(htmlVertex).offset().left + $(htmlVertex).width() ;
            endPoint.y = $(htmlVertex).offset().top;
            return triple_brain.segment.withStartAndEndPoint(startPoint, endPoint);
        }

        function bottomSegment(){
            var startPoint = triple_brain.point.centeredAtOrigin();
            startPoint.x = $(htmlVertex).offset().left;
            startPoint.y = $(htmlVertex).offset().top + $(htmlVertex).height();
            var endPoint = triple_brain.point.centeredAtOrigin();
            endPoint.x = $(htmlVertex).offset().left + $(htmlVertex).width() ;
            endPoint.y = $(htmlVertex).offset().top + $(htmlVertex).height();
            return triple_brain.segment.withStartAndEndPoint(startPoint, endPoint);
        }

    }

    function Side(segment, name){
        this.segment = segment;
        this.name = name;
    }
}