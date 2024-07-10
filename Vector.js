class Vector2 {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.size = 4;
        this.color = "white";
    }

    AddPoint = (vector2) => {
        this.x += vector2.x;
        this.y += vector2.y;
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

    static Dot = (l, r) => {
        return l.x * r.x + l.y * r.y;
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
        this.center = null;
        this.path = null;
        this.lineWidth = 2;
        this.GetFirstExtreme();
        this.SortByAngle();
        this.GrahamScan();
    }

    Draw = (ctx) => {
        if (this.extremies.length > 2) {
            ctx.beginPath()
            ctx.fillStyle = "rgba(255,115,0,0.32)"
            ctx.fill(this.path)

            ctx.lineWidth = this.lineWidth
            ctx.strokeStyle = "rgba(255,115,0,0.32)"
            ctx.stroke(this.path)
        }

        this.verteis.forEach((point, index) => {
            point.Draw(ctx)
        })

        this.extremies.forEach((point, index) => {
            point.color = "#00b2ff"
            point.Draw(ctx)
            if (point.id !== -1)
            {
                ctx.beginPath()
                ctx.font = "16px serif"
                ctx.strokeStyle = "#ffffff"
                ctx.lineWidth = 1
                ctx.strokeText(index, point.x + point.size / 2, point.y - point.size / 2, 28)
                ctx.stroke()
            }
        })

        if (this.center !== null) {
            this.center.Draw(ctx)
        }
    }

    AddPoint = (v) => {
        this.verteis.push(v);
        this.GetFirstExtreme();
        this.SortByAngle();
        this.GrahamScan();
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
            this.extremies[1] = this.verteis[1]
        }
    }

    GrahamScan = () => {
        let s = this.extremies;
        let t = this.verteis.slice(2);
        if (s.length !== 2) {
            return undefined;
        }

        while (t.length > 0) {
            let point = t[0]
            let startPoint = s[s.length - 2];
            let endPoint = s[s.length - 1];
            if (Vector2.ToLeft(startPoint, endPoint, point)) {
                s.push(t.shift())
            }else{
                s.pop()
            }
        }

        this.CratePath()
        this.FindCenter();
    }

    CratePath = () => {
        this.path = new Path2D();
        this.path.moveTo(this.extremies[0].x, this.extremies[0].y)
        for (let i = 1; i < this.extremies.length; i++) {
            this.path.lineTo(this.extremies[i].x, this.extremies[i].y)
        }
        this.path.lineTo(this.extremies[0].x, this.extremies[0].y)
    }

    FindCenter = () => {
        this.center = new Vector2(0 , 0)
        this.extremies.forEach(e => {
            this.center.AddPoint(e)
        })
        this.center = this.center.Divide(this.extremies.length)
        this.center.color = "#a100ff"
    }

    IsPointInside = (ctx, vector2Point) => {
        return this.extremies.length > 2 && ctx.isPointInPath(this.path, vector2Point.x, vector2Point.y);
    }

    Move = (vector2Offset) => {
        this.verteis.forEach(v => {
            v.AddPoint(vector2Offset)
        })
        this.CratePath()
        this.FindCenter();
    }

    ClosestExtremePoint = (vector2Dir) => {
        if (this.extremies.length === 0) return
        let closestPoint = this.extremies[0]
        let maxDot = Vector2.Dot(vector2Dir, closestPoint.Substract(this.center).Normalize())
        this.extremies.forEach(e => {
            let dotValue = Vector2.Dot(vector2Dir, e.Substract(this.center).Normalize());
            if (dotValue > maxDot) {
                closestPoint = e;
                maxDot = dotValue
            }
        })

        return closestPoint;
    }

    static DefaultColor = "#12ff00";
}

function CollisionWithGJK(convexA, convexB){
    let dir = new Vector2(1, 0)
}