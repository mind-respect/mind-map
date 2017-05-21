/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define(
    [],
    function () {
        "use strict";
        var api = {
            fromCoordinates: function (x, y) {
                return new Point(x, y);
            },
            centeredAtOrigin: function () {
                return new Point(0, 0);
            },
            sumOfPoints: function (pointA, pointB) {
                return addTwoPoints(pointA, pointB);
            },
            fromPoint: function (point) {
                return new Point(point.x, point.y);
            },
            fromHtmlPoint: function(offset){
                return new Point(offset.left, offset.top);
            }
        };
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }

        Point.prototype.distanceFromPoint = function (otherPoint) {
            return Math.sqrt(
                Math.pow(otherPoint.x - this.x, 2) +
                Math.pow(otherPoint.y - this.y, 2)
            );
        };

        Point.prototype.cross = function (pointToCompare) {
            return this.x * pointToCompare.y - pointToCompare.x * this.y;
        };
        Point.prototype.clone = function () {
            return api.fromCoordinates(this.x, this.y);
        };
        Point.prototype.multiply = function (factor) {
            this.x *= factor;
            this.y *= factor;
            return this;
        };
        Point.prototype.invert = function () {
            return this.multiply(-1);
        };

        function addTwoPoints(pointA, pointB) {
            var summedPoint = new Point(pointA.x, pointA.y);
            summedPoint.x += pointB.x;
            summedPoint.y += pointB.y;
            return summedPoint;
        }

        Point.prototype.toString = function () {
            return "(" + this.x + "," + this.y + ")";
        };
        return api;
    }
);
