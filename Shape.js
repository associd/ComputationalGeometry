class Segment {
    constructor(vector2Start, vector2End, lineWidth = 2, color = "#fff") {
        this.start = new Vector2(vector2Start.x, vector2Start.y) ;
        this.end = new Vector2(vector2End.x, vector2End.y) ;
        this.lineWidth = lineWidth
        this.color = color

        this.path = new Path2D();
        this.path.moveTo(this.start.x, this.start.y)
        this.path.lineTo(this.end.x, this.end.y)
    }

    Draw = (ctx) => {
        ctx.save()
        ctx.strokeStyle = this.color
        ctx.lineWidth = this.lineWidth
        ctx.stroke(this.path)

        let arrow = this.start.Substract(this.end).Normalize().Multiply(8)

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
    }

    PointInPath = (ctx, x, y) => {
        return ctx.isPointInStroke(this.path, x, y)
    }

    Translate = (vec2) => {
        this.start.AddPoint(vec2)
        this.end.AddPoint(vec2)

        this.path = new Path2D();
        this.path.moveTo(this.start.x, this.start.y)
        this.path.lineTo(this.end.x, this.end.y)
        return this
    }
}

class Shape{
    constructor(vertices) {
        this.vertices = vertices
        let sum = Vector2.Zero
        this.vertices.forEach(v => sum = sum.Add(v))
        this.center = sum.Multiply(1 / this.vertices.length)
    }

    Translate = (vector2Offset) => {
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].AddPoint(vector2Offset)
        }
        this.center.AddPoint(vector2Offset)
    }

    Support(direction) {
        let closestPoint = this.vertices[0]
        let maxDot = Vector2.Dot(direction, closestPoint.Substract(this.center))
        this.vertices.forEach(e => {
            let dotValue = Vector2.Dot(direction, e.Substract(this.center));
            if (dotValue > maxDot) {
                closestPoint = e;
                maxDot = dotValue
            }
        })

        return closestPoint;
    }
    Draw(ctx) {}
    IsPointInside(ctx, vector2Point){}
    EventOnNormal() {}
    EventOnHovered() {}
}

class Triangle {
    constructor(pa, pb, pc) {
        this.vertices = [
            pa,
            pb,
            pc,
        ]
        this.center = pa.Add(pb.Add(pc)).Divide(3);
    }

    Draw = (ctx) => {

        ctx.beginPath()
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y)
        ctx.lineTo(this.vertices[1].x, this.vertices[1].y)
        ctx.lineTo(this.vertices[2].x, this.vertices[2].y)
        ctx.fillStyle = "rgba(0,255,91,0.27)"
        ctx.fill()

        ctx.moveTo(this.vertices[0].x, this.vertices[0].y)
        ctx.lineTo(this.vertices[1].x, this.vertices[1].y)
        ctx.lineTo(this.vertices[2].x, this.vertices[2].y)
        ctx.strokeStyle = "rgba(0,255,91,0.27)"
        ctx.stroke()

        this.vertices.forEach(p => {
            p.Draw(ctx)
        })
    }

}

class Convex extends Shape {
    constructor(vector2Points) {
        super(vector2Points)
        this.extremies = [];
        this.firstExtreme = null;
        this.path = null;
        this.lineWidth = 2;
        this.color = "rgba(255,115,0,0.32)";

        if (vector2Points.length > 2) {
            this.GetFirstExtreme();
            this.SortByAngle();
            this.GrahamScan();
        }
    }

    Draw = (ctx) => {
        if (this.extremies.length > 2) {
            ctx.beginPath()
            ctx.fillStyle = this.color
            ctx.fill(this.path)

            ctx.lineWidth = this.lineWidth
            ctx.strokeStyle = this.color
            ctx.stroke(this.path)
        }

        this.vertices.forEach((point, index) => {
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
        this.vertices.push(v);
        if (this.vertices.length > 2){
            this.GetFirstExtreme();
            this.SortByAngle();
            this.GrahamScan();
        }
    }

    GetFirstExtreme = () => {
        if (this.vertices.length === 0) return  undefined;

        this.extremies.splice(0, this.extremies.length);

        this.firstExtreme = this.vertices[0];
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].color = Convex.DefaultColor;
            // canvas y 轴正方向 是从上至下的 所以这里 判断最低点 使用大于
            if (this.vertices[i].y > this.firstExtreme.y || (this.vertices[i].y === this.firstExtreme.y && this.vertices[i].x < this.firstExtreme.x)) {
                this.firstExtreme = this.vertices[i];
            }
        }

        this.vertices.splice(this.vertices.indexOf(this.firstExtreme), 1)
        this.vertices.unshift(this.firstExtreme)
        this.extremies.push(this.firstExtreme);
    }

    SortByAngle = () => {
        this.vertices.sort((a, b) => {
            if (Vector2.ToLeft(this.firstExtreme, a, b)){
                return -1
            }
            else{
                return 1;
            }
        })
        if (this.vertices.length > 1) {
            this.extremies[1] = this.vertices[1]
        }
    }

    GrahamScan = () => {
        let s = this.extremies;
        let t = this.vertices.slice(2);
        if (s.length !== 2) {
            return undefined;
        }

        while (t.length > 0 && s.length >= 2) {
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
        if (this.extremies.length === 0) return
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

    Translate = (vector2Offset) => {
        this.vertices.forEach(v => {
            v.AddPoint(vector2Offset)
        })
        this.CratePath()
        this.FindCenter();
    }

    Support = (vector2Dir) => {
        if (this.extremies.length === 0) return
        let closestPoint = this.extremies[0]
        let maxDot = Vector2.Dot(vector2Dir, closestPoint.Substract(this.center))
        this.extremies.forEach(e => {
            let dotValue = Vector2.Dot(vector2Dir, e.Substract(this.center));
            if (dotValue > maxDot) {
                closestPoint = e;
                maxDot = dotValue
            }
        })

        return closestPoint;
    }

    EventOnHovered = () => {
        this.color = "rgba(255,115,0,0.62)"
    }

    EventOnNormal = () => {
        this.color = "rgba(255,115,0,0.32)"
    }

    static DefaultColor = "#12ff00";
}

class Box extends Shape {
    constructor(lt, size) {
        let v = [
            new Vector2(lt.x, lt.y + size.y),
            new Vector2(lt.x + size.x, lt.y + size.y),
            new Vector2(lt.x + size.x, lt.y),
            new Vector2(lt.x, lt.y),
        ]
        super(v);
    }

    Draw(ctx) {
        ctx.beginPath()
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y)
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y)
        }
        // ctx.fillStyle = "rgba(255,115,0,0.62)"
        ctx.stroke()
    }
}

class Circle extends Shape{
    constructor(center, radius = 8) {
        super([center]);
        this.radius = radius
    }

    Support(direction) {
        return this.center.Add(direction.Normalize().Multiply(this.radius))
    }

    Draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI)
        ctx.fillStyle = "#fff"
        ctx.fill()
    }

    IsPointInside(ctx, vector2Point) {
        return false
    }
}
