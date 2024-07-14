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

    Add = (vector2) => {
        return new Vector2(this.x + vector2.x, this.y + vector2.y);
    }

    Inverse = () => {
        return new Vector2(-this.x, -this.y);
    }

    Substract = (vector) => {
        return new Vector2(this.x - vector.x, this.y - vector.y)
    }

    Divide = (number) => {
        return new Vector2(this.x / number, this.y / number)
    }

    Multiply = (number) => {
        return new Vector2(this.x * number, this.y * number)
    }

    Normalize = () => {
        let magnitude = this.Magnitude()
        return magnitude > 0 ? this.Divide(magnitude) : Vector2.Zero;
    }

    Magnitude = () => {
       return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    SqrMagnitude = () => {
        return this.x * this.x + this.y * this.y
    }

    Approximate = (vector2p) => {
        return (Math.abs(this.x - vector2p.x) <= 0.001) && (Math.abs(this.y - vector2p.y) <= 0.001);
    }

    Translate = (vector2) => {
        this.x += vector2.x;
        this.y += vector2.y;
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
    static Infinite = new Vector2(Number.MAX_VALUE, Number.MAX_VALUE)
}

class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    ToVector2 = () => {
        return new Vector2(this.x, this.y);
    }

    static Cross(lhs, rhs) {
        return new Vector3(lhs.y * rhs.z - lhs.z * rhs.y, lhs.z * rhs.x - lhs.x * rhs.z, lhs.x * rhs.y - lhs.y * rhs.x)
    }
}

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

class Convex {
    constructor(vector2Points) {
        this.vertices = vector2Points;
        this.extremies = [];
        this.firstExtreme = null;
        this.center = null;
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

    ClosestExtremePoint = (vector2Dir) => {
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

    static DefaultColor = "#12ff00";
}

function GJK(convexA, convexB, simplex, ctx, canvas){
    let dir = convexB.center.Substract(convexA.center)

    simplex.push(ConvexSupport(convexA, convexB, dir))
    DrawPoint("起点", simplex[0])

    dir = Vector2.Zero.Substract(simplex[0])

    while(true) {
        let A = ConvexSupport(convexA, convexB, dir)
        simplex.push(A)
        if (Vector2.Dot(A, dir) < 0) {
            return false;
        }
        if (HandleSimplex()) {
            // let p = TriangleClosestPoint(simplex[0], simplex[1], simplex[2], Vector2.Zero)
            // Gizmos(p)
            return true;
        }

        function HandleSimplex(){
            if (simplex.length === 2) {
                // 从连线中判定是否过原点
                let A = simplex[1]
                let B = simplex[0]
                let AB = B.Substract(A)
                let AO = Vector2.Zero.Substract(A)
                dir = TripleProduct(new Vector3(AB.x, AB.y), new Vector3(AO.x, AO.y), new Vector3(AB.x, AB.y)).ToVector2();
                return false
            }else{
                // 从单纯形中判定是否过原点
                let C = simplex[0]
                let B = simplex[1]
                let A = simplex[2]
                let AB = B.Substract(A)
                let AC = C.Substract(A)
                let AO = Vector2.Zero.Substract(A)

                let ABperp = TripleProduct(new Vector3(AC.x, AC.y), new Vector3(AB.x, AB.y), new Vector3(AB.x, AB.y)).ToVector2()
                let ACperp = TripleProduct(new Vector3(AB.x, AB.y), new Vector3(AC.x, AC.y), new Vector3(AC.x, AC.y)).ToVector2()

                if (Vector2.Dot(ABperp, AO) > 0) {
                    simplex.splice(simplex.indexOf(C), 1)
                    dir = ABperp
                    return false
                }

                if (Vector2.Dot(ACperp, AO) > 0) {
                    simplex.splice(simplex.indexOf(B), 1)
                    dir = ACperp
                    return false
                }

                return true
            }
        }
    }

    function Gizmos(cp, info = "碰撞", offset = new Vector2(0 ,0)) {
        let t = new Triangle(simplex[0].Add(new Vector2(canvas.width / 2, canvas.height / 2)), simplex[1].Add(new Vector2(canvas.width / 2, canvas.height / 2)), simplex[2].Add(new Vector2(canvas.width / 2, canvas.height / 2)))
        t.Draw(ctx)

        ctx.strokeStyle = "rgba(255,255,255,0.37)"
        ctx.font = "16px sans-serif"
        ctx.strokeText(info, t.center.x + offset.x, t.center.y + offset.y)

        let d = new Segment(cp, cp.Add(dir))
        d.Translate(new Vector2(canvas.width / 2, canvas.height / 2))
        d.Draw(ctx)

        ctx.strokeText(`${(cp.x - canvas.width / 2).toFixed()}, ${(cp.y - canvas.height / 2).toFixed()}`, d.start.x + offset.x, d.start.y + offset.y)
    }

    function DrawPoint (info, vector2){
        ctx.strokeStyle = "rgba(255,255,255,0.3)"
        ctx.font = "16px sans-serif"
        ctx.strokeText(info, vector2.x + canvas.width / 2, vector2.y + canvas.height / 2)
    }
}

function EPA(simplex, convexA, convexB, ctx, canvas) {
    while (true) {
        let closestEdge = ClosestEdge(simplex, Vector2.Zero)
        let newPoint = ConvexSupport(convexA, convexB, closestEdge.n)

        if (Vector2.Dot(newPoint, closestEdge.n) - closestEdge.d < 0.001) {
            return closestEdge.n.Multiply(closestEdge.d)
        }else{
            simplex.splice(closestEdge.i + 1, 0, newPoint)
        }
    }
}

function ClosestEdge(polytope, point) {
    let npts = polytope.length
    let minD = Number.MAX_VALUE
    let closest = null
    for (let i = 0; i < npts; i++) {
        let end = polytope[(i + 1) % npts]
        let edge = end.Substract(polytope[i])
        let toZero = point.Substract(polytope[i])
        let n = TripleProduct(
            new Vector3(edge.x, edge.y),
            new Vector3(toZero.x, toZero.y),
            new Vector3(edge.x, edge.y)).ToVector2().Normalize().Inverse()
        let d = Vector2.Dot(n, polytope[i].Substract(point))

        // new Segment(Vector2.Zero, Vector2.Zero.Add(n.Multiply(d)))
        //     .Translate(new Vector2(canvas.width / 2, canvas.height / 2))
        //     .Draw(ctx)

        if (d < minD) {
            minD = d
            closest = {n, i, d, edge, start : polytope[i]}
        }
    }

    return closest
}

function ConvexSupport (convexA, convexB, dir) {
    return convexA.ClosestExtremePoint(dir).Substract(convexB.ClosestExtremePoint(dir.Inverse()))
}


function SegmentClosestPoint(vertexA, vertexB, point){
    let AB = vertexB.Substract(vertexA)
    let AP = point.Substract(vertexA)
    let t = Vector2.Dot(AP, AB) / Vector2.Dot(AB, AB)

    if (t <= 0) {
        return new Vector2(vertexA.x, vertexA.y)
    }
    if (t >= 1) {
        return new Vector2(vertexB.x, vertexB.y)
    }

    return vertexA.Add(AB.Multiply(t))
}

function TripleProduct(a, b, c) {
    return Vector3.Cross(Vector3.Cross(a, b), c)
}

function TriangleClosestPoint (vector2A, vector2B, vector2C, vector2P) {
    let ab = vector2B.Substract(vector2A)
    let ac = vector2C.Substract(vector2A)
    let ap = vector2P.Substract(vector2A)

    // a back area #1
    let d1 = Vector2.Dot(ab, ap) // -p.x * b.x
    let d2 = Vector2.Dot(ac, ap) // p.y
    if (d1 <= 0 && d2 <= 0) return new Vector2(vector2A.x, vector2A.y)

    // b back area #2
    let bp = vector2P.Substract(vector2B)
    let d3 = Vector2.Dot(ab, bp) // -p.x * b.x
    let d4 = Vector2.Dot(ac, bp) // p.y
    if (d3 >= 0 && d4 <= d3) return new Vector2(vector2B.x, vector2B.y)

    // c back area #3
    let cp = vector2P.Substract(vector2C)
    let d5 = Vector2.Dot(ab, cp)
    let d6 = Vector2.Dot(ac, cp)
    if (d6 >= 0 && d5 <= d6) return new Vector2(vector2C.x, vector2C.y)

    let vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0)
    {
        let v = d1 / (d1 - d3);
        return vector2A.Add(ab.Multiply(v))
    }

    let vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0)
    {
        let v = d2 / (d2 - d6);
        return vector2A.Add(ac.Multiply(v))
    }

    let va = d3 * d6 - d5 * d4;
    if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0)
    {
        let v = (d4 - d3) / ((d4 - d3) + (d5 - d6));
        return vector2B.Add(vector2C.Substract(vector2B).Multiply(v))
    }

    let denom = 1 / (va + vb + vc)
    let v = vb * denom
    let w = vc * denom
    return vector2A.Add(ab.Multiply(v)).Add(ac.Multiply(w))
}
