class Collision {
    constructor() {

    }
}

function TripleProduct(a, b, c) {
    return Vector3.Cross(Vector3.Cross(a, b), c)
}


function GJK(shapeA, shapeB, simplex){
    let dir = shapeB.center.Substract(shapeA.center)

    simplex.push(Support(shapeA, shapeB, dir))
    // DrawPoint("起点", simplex[0])

    dir = Vector2.Zero.Substract(simplex[0])

    while(true) {
        let A = Support(shapeA, shapeB, dir)
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

    function Support (convexA, convexB, dir) {
        return convexA.Support(dir).Substract(convexB.Support(dir.Inverse()))
    }

    // function Gizmos(cp, info = "碰撞", offset = new Vector2(0 ,0)) {
    //     let t = new Triangle(simplex[0].Add(new Vector2(canvas.width / 2, canvas.height / 2)), simplex[1].Add(new Vector2(canvas.width / 2, canvas.height / 2)), simplex[2].Add(new Vector2(canvas.width / 2, canvas.height / 2)))
    //     t.Draw(ctx)
    //
    //     ctx.strokeStyle = "rgba(255,255,255,0.37)"
    //     ctx.font = "16px sans-serif"
    //     ctx.strokeText(info, t.center.x + offset.x, t.center.y + offset.y)
    //
    //     let d = new Segment(cp, cp.Add(dir))
    //     d.Translate(new Vector2(canvas.width / 2, canvas.height / 2))
    //     d.Draw(ctx)
    //
    //     ctx.strokeText(`${(cp.x - canvas.width / 2).toFixed()}, ${(cp.y - canvas.height / 2).toFixed()}`, d.start.x + offset.x, d.start.y + offset.y)
    // }
    //
    // function DrawPoint (info, vector2){
    //     ctx.strokeStyle = "rgba(255,255,255,0.3)"
    //     ctx.font = "16px sans-serif"
    //     ctx.strokeText(info, vector2.x + canvas.width / 2, vector2.y + canvas.height / 2)
    // }
}

function EPA(simplex, shapeA, shapB) {
    while (true) {
        let closestEdge = ClosestEdge(simplex, Vector2.Zero)
        let newPoint = shapeA.Support(closestEdge.n).Substract(shapB.Support(closestEdge.n.Inverse()))

        if (Vector2.Dot(newPoint, closestEdge.n) - closestEdge.d < 0.001) {
            return closestEdge.n.Multiply(closestEdge.d)
        }else{
            simplex.splice(closestEdge.i + 1, 0, newPoint)
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

            if (d < minD) {
                minD = d
                closest = {n, i, d, edge, start : polytope[i]}
            }
        }

        return closest
    }
}

