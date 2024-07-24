class Physics {
    constructor() {
        this.gravity = new Vector2(0, 0)
        this.rigidBodies = []

        this.rb1 = new RigidBody(new Convex([
            new Vector2(100, 180),
            new Vector2(150, 200),
            new Vector2(120, 300),
        ]))
        let rb2 = new RigidBody(new Convex([
            new Vector2(200, 180),
            new Vector2(250, 200),
            new Vector2(210, 320),
            new Vector2(260, 340),
        ]))
        this.rigidBodies.push(this.rb1)
        this.rigidBodies.push(rb2)

        // rb1.velocity = new Vector2(20, 50)
        // rb2.velocity = new Vector2(212, 45)
    }

    Update = (deltaTime) => {
        // this.rigidBodies.forEach(rb => {
        //     rb.AddForce(this.gravity)
        // })

        // if (window.downRigidBody !== null && window.downRigidBody !== undefined) {
            Object.keys(window.KeyDownAction).forEach(key => {
                if (window.KeysDown[key]) {
                    window.KeyDownAction[key](this.rb1)
                }
            })
        // }

        for (let i = 0; i < this.rigidBodies.length; i++) {
            this.rigidBodies[i].Update(deltaTime)
        }

        for (let i = 0; i < this.rigidBodies.length - 1; i++) {
            for (let j = i + 1; j < this.rigidBodies.length; j++) {
                let simplex = []
                if (i !== j && GJK(this.rigidBodies[i].shape, this.rigidBodies[j].shape, simplex)){
                    let mtv = EPA(simplex, this.rigidBodies[i].shape, this.rigidBodies[j].shape)
                    let relativeVelocity = this.rigidBodies[j].velocity.Substract(this.rigidBodies[i].velocity)
                    let mtvN = mtv.Normalize()
                    let relativeVelocityAlongMTV = Vector2.Dot(mtvN, relativeVelocity)

                    if (relativeVelocityAlongMTV > 0) {
                        return;
                    }

                    let e = 1
                    let jv = -(1 + e) * relativeVelocityAlongMTV
                    let impulseVector = mtvN.Multiply(jv)

                    this.rigidBodies[i].velocity = this.rigidBodies[i].velocity.Add(impulseVector.Multiply(-0.5))
                    this.rigidBodies[j].velocity = this.rigidBodies[j].velocity.Add(impulseVector.Multiply(0.5))
                }
            }
        }

    }
}

class RigidBody {
    constructor(shape) {
        this.shape = shape
        this.velocity = new Vector2(0, 0);
        this.mass = 1
        this.invMass = 1 / this.mass;
        this.forceAccumulator = new Vector2(0 ,0);
    }

    Update = (deltaTime) => {
        this.Integrate(deltaTime)
        this.forceAccumulator = Vector2.Zero
    }

    Integrate = (deltaTime)=> {
        // f = ma
        let acceleration = this.forceAccumulator.Multiply(this.invMass)
        this.velocity = Vector2.Add(this.velocity, acceleration.Multiply(deltaTime))
        this.velocity = this.velocity.Multiply(1)
        let deltaPosition = this.velocity.Multiply(deltaTime)
        this.shape.Translate(deltaPosition)
    }

    AddForce = (force) => {
        this.forceAccumulator = this.forceAccumulator.Add(force)
    }
}