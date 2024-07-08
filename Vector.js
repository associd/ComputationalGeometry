class Vector2 {
    constructor(x, y) {
        this.id = -1;
        this.x = x
        this.y = y
        this.size = 4;
        this.color = "black";
    }

    Substract = (vector) => {
        return new Vector2(this.x - vector.x, this.y - vector.y)
    }


    static Cross = (l, r) => {
        return l.x *　r.y - r.x * l.y;
    }

    static ToLeft = (vectorA, vectorB, vectorS) => {
        return Vector2.Cross(
            vectorA.Substract(vectorS),
            vectorB.Substract(vectorS)
        )
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

    AddPoint = (v) => {
        this.verteis.push(v);
        this.GetFirstExtreme();
        this.SortByAngle();
    }

    GetFirstExtreme = () => {
        if (this.verteis.length === 0) return  undefined;
        this.firstExtreme = this.verteis[0];
        for (let i = 0; i < this.verteis.length; i++) {
            this.verteis[i].color = Convex.DefaultColor;
            // canvas y 轴正方向 是从上至下的 所以这里 判断最低点 使用大于
            if (this.verteis[i].y > this.firstExtreme.y || (this.verteis[i].y === this.firstExtreme.y && this.verteis[i].x < this.firstExtreme.x)) {
                this.firstExtreme = this.verteis[i];
            }
        }
        this.firstExtreme.color = "#00b2ff";

        if (!this.extremies.includes(this.firstExtreme)){
            this.extremies.push(this.firstExtreme);
        }
    }

    SortByAngle = () => {
        this.verteis.sort((a, b) => {
            if (a !== this.firstExtreme && a !== b && Vector2.ToLeft(this.firstExtreme, a, b)){
                return 1
            }
            else{
                return -1;
            }
        })
        this.verteis.forEach((v, i) => {
            v.id = i;
        })
    }

    static DefaultColor = "#12ff00";
}