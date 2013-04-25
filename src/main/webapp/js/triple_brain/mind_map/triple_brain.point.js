define(
    [],
    function(){
        var api = {
            fromCoordinates : function(x, y){
                return new Point(x, y);
            },
            centeredAtOrigin : function(){
                return new Point(0, 0);
            },
            sumOfPoints : function(pointA, pointB){
                return addTwoPoints(pointA, pointB);
            },
            fromPoint : function(point){
                return new Point(point.x, point.y);
            }
        }

        function Point(x, y){
            var point = this;
            this.x = x;
            this.y = y;
            this.distanceWithPoint = function(pointToCompare){
                return Math.sqrt(
                    Math.pow(pointToCompare.x - this.x, 2) +
                        Math.pow(pointToCompare.y - this.y, 2)
                );
            };
            this.cross = function(pointToCompare){
                return this.x * pointToCompare.y - pointToCompare.x * this.y;
            };
            this.clone = function(){
                return api.fromCoordinates(this.x, this.y);
            };
            this.multiply = function(factor){
                this.x *= factor;
                this.y *= factor;
                return point;
            };
            this.invert = function(){
                return point.multiply(-1);
            };
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

        Point.prototype.toString = function()
        {
            return "(" + this.x + "," + this.y + ")";
        }
        return api;
    }
);
