define(
    [],
    function () {
        return {
            withPositions:function (a, b, c, d, tx, ty) {
                return new TransformMatrix2d(a, b, c, d, 1, 1);
            },
            fromSegment:function (segment) {
                var startPoint = segment.startPoint;
                var endPoint = segment.endPoint;
                return new TransformMatrix2d(startPoint.x, endPoint.x, startPoint.y, endPoint.y, 1, 1);
            }
        }

        /**
         *  _        _
         * | a  c tx  |
         * | b  d ty  |
         * |_0  0  1 _|
         */
        function TransformMatrix2d(a, b, c, d, tx, ty) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;

            this.multiplyWithMatrix = function (matrix) {
                return new TransformMatrix2d(
                    a * matrix.a + c * matrix.b,
                    b * matrix.a + d * matrix.b,
                    a * matrix.c + c * matrix.d,
                    b * matrix.c + d * matrix.d,
                    a * matrix.tx + c * matrix.ty + tx,
                    b * matrix.tx + d * matrix.ty + ty
                );
            };

            this.divideWithMatrix = function (matrix) {
                return this.multiplyWithMatrix(matrix.inverse());
            }

            this.inverse = function () {
                var determinant = this.determinant();
                return new TransformMatrix2d(
                    d / determinant,
                    -b / determinant,
                    -c / determinant,
                    a / determinant,
                    (c * ty - d * tx) / determinant,
                    (b * tx - a * ty) / determinant
                );
            },

                this.determinant = function () {
                    return a * d - b * c;
                }
        }
    }
);
