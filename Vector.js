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

    static Add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y)
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
