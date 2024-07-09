class Vector2 {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.size = 4;
        this.color = "white";
    }

    Substract = (vector) => {
        return new Vector2(this.x - vector.x, this.y - vector.y)
    }

    Divide = (number) => {
        return new Vector2(this.x / number, this.y / number)
    }

    Multiple = (number) => {
        return new Vector2(this.x * number, this.y * number)
    }

    Normalize = () => {
        let magnitude = Math.sqrt(this.x * this.x + this.y * this.y)
        return magnitude > 0 ? this.Divide(magnitude) : Vector2.Zero;
    }

    Draw = (ctx) => {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    static Cross = (l, r) => {
        return l.x *　r.y - r.x * l.y;
    }

    static ToLeft = (vectorA, vectorB, vectorS) => {
        // 因canvas y 轴朝下 则toleft测试为真时 实际点在线段的右边
        return Vector2.Cross(
            vectorA.Substract(vectorS),
            vectorB.Substract(vectorS)
        ) < 0
    }

    static Zero = new Vector2(0 , 0)
}

class Segment {
    constructor(vector2Start, vector2End) {
        this.start = vector2Start;
        this.end = vector2End;
        this.lineWidth = 2
        this.color = "white"

        this.path = new Path2D();
        this.path.moveTo(this.start.x, this.start.y)
        this.path.lineTo(this.end.x, this.end.y)
    }

    Draw = (ctx) => {
        ctx.save()
        ctx.strokeStyle = this.color
        ctx.lineWidth = this.lineWidth
        ctx.stroke(this.path)

        let arrow = this.start.Substract(this.end).Normalize().Multiple(8)

        ctx.translate(this.end.x, this.end.y)
        ctx.rotate(Math.PI / 4)
        ctx.moveTo(0, 0)
        ctx.lineTo(arrow.x, arrow.y)
        ctx.stroke();

        ctx.rotate(-Math.PI / 2)
        ctx.moveTo(0, 0)
        ctx.lineTo(arrow.x, arrow.y)
        ctx.stroke();

        ctx.rotate(Math.PI / 4)
        ctx.translate(-this.end.x, -this.end.y)

        this.start.Draw(ctx)
        ctx.restore();
    }

    PointInPath = (ctx, x, y) => {
        return ctx.isPointInStroke(this.path, x, y)
    }
}

class Convex {
    constructor(vector2Points) {
        this.verteis = vector2Points;
        this.extremies = [];
        this.firstExtreme = null;
        this.GetFirstExtreme();
        this.SortByAngle();
    }

    Draw = (ctx) => {
        this.verteis.forEach((point, index) => {
            point.Draw(ctx)
            if (point.id !== -1)
            {
                ctx.beginPath()
                ctx.font = "16px serif"
                ctx.strokeStyle = "#ffffff"
                ctx.strokeText(index, point.x + point.size / 2, point.y - point.size / 2, 28)
                ctx.stroke()
            }
        })
        this.extremies.forEach(point => {
            point.Draw(ctx)
        })
    }

    AddPoint = (v) => {
        this.verteis.push(v);
        this.GetFirstExtreme();
        this.SortByAngle();
    }

    GetFirstExtreme = () => {
        if (this.verteis.length === 0) return  undefined;

        this.extremies.splice(0, this.extremies.length);

        this.firstExtreme = this.verteis[0];
        for (let i = 0; i < this.verteis.length; i++) {
            this.verteis[i].color = Convex.DefaultColor;
            // canvas y 轴正方向 是从上至下的 所以这里 判断最低点 使用大于
            if (this.verteis[i].y > this.firstExtreme.y || (this.verteis[i].y === this.firstExtreme.y && this.verteis[i].x < this.firstExtreme.x)) {
                this.firstExtreme = this.verteis[i];
            }
        }
        this.firstExtreme.color = "#00b2ff";

        this.verteis.splice(this.verteis.indexOf(this.firstExtreme), 1)
        this.verteis.unshift(this.firstExtreme)
        this.extremies.push(this.firstExtreme);
    }

    SortByAngle = () => {
        this.verteis.sort((a, b) => {
            if (Vector2.ToLeft(this.firstExtreme, a, b)){
                return -1
            }
            else{
                return 1;
            }
        })
        if (this.verteis.length > 1) {
            this.verteis[1].color = "#00b2ff";
            this.extremies[1] = this.verteis[1]
        }
    }

    static DefaultColor = "#12ff00";
}