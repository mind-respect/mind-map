
if (triple_brain.point == undefined) {

    triple_brain.point = {
        fromCoordinates : function(x, y){
            return new Point(x, y);
        },
        centeredAtOrigin : function(){
            return new Point(0, 0);
        },
        sumOfPoints : function(pointA, pointB){
            return addTwoPoints(pointA, pointB);
        },
        differenceOfPoints: function(pointA, pointB){
            return subtractTwoPoints(this, pointToSubtract);
        }
    }

    function Point(x, y){
        this.x = x;
        this.y = y;
        this.distanceWithPoint = function(pointToCompare){
            return Math.sqrt(
                Math.pow(pointToCompare.x - this.x, 2) +
                Math.pow(pointToCompare.y - this.y, 2)
            );
        }

        this.cross = function(pointToCompare){
            return this.x * pointToCompare.y - pointToCompare.x * this.y;
        },

        this.clone = function(){
            return triple_brain.point.fromCoordinates(this.x, this.y);
        }
    }

    function addTwoPoints(pointA, pointB){
        var summedPoint = new Point(pointA.x, pointA.y);
        summedPoint.x += pointB.x;
        summedPoint.y += pointB.y;
        return summedPoint;
    }

    function subtractTwoPoints(leftTerm, rightTerm){
        var subtractedPoint = new Point(leftTerm.x, leftTerm.y);
        subtractedPoint.x -= rightTerm.x;
        subtractedPoint.y -= rightTerm.y;
        return subtractedPoint;
    }




}