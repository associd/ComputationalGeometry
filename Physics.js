class Physics {
    constructor() {
        this.gravity = new Vector2(0, 98.1)
        this.rigidBodies = []

        this.rb1 = new RigidBody(new Convex([
            new Vector2(100, 180),
            new Vector2(150, 200),
            new Vector2(120, 300),
        ]), 1)
        let rb2 = new RigidBody(new Convex([
            new Vector2(200, 180),
            new Vector2(250, 200),
            new Vector2(210, 320),
            new Vector2(260, 340),
        ]), 10)
        let rb3 = new RigidBody(new Circle(new Vector2(250, 250), 30), 2)

        this.rigidBodies.push(this.rb1)
        this.rigidBodies.push(rb2)
        this.rigidBodies.push(rb3)

        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(236, 250), 8), 3))
        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(237, 250), 8), 3))
        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(238, 250), 8), 3))
        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(239, 250), 8), 3))
        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(216, 250), 8), 3))
        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(226, 250), 8), 3))
        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(246, 250), 8), 3))
        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(256, 250), 8), 3))
        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(266, 250), 8), 3))
        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(276, 250), 8), 3))
        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(286, 250), 8), 3))
        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(296, 250), 8), 3))
        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(436, 250), 8), 3))
        this.rigidBodies.push(new RigidBody(new Circle(new Vector2(536, 250), 8), 3))
    }

    CreateBoundary(canvas) {
        this.rigidBodies.push(new RigidBody(
            new Box(new Vector2(0, -30), new Vector2(canvas.width, 30)),
            0
        ))
        this.rigidBodies.push(new RigidBody(
            new Box(new Vector2(canvas.width, 0), new Vector2(30, canvas.height)),
            0
        ))
        this.rigidBodies.push(new RigidBody(
            new Box(new Vector2(-30, 0), new Vector2(30, canvas.height)),
            0
        ))
        this.rigidBodies.push(new RigidBody(
            new Box(new Vector2(0, canvas.height), new Vector2(canvas.width, 30)),
            0
        ))
    }

    Update = (deltaTime) => {
        this.rigidBodies.forEach(rb => {
            rb.AddForce(this.gravity.Multiply(rb.mass))
        })

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

                    let collision = new Collision(mtv, this.rigidBodies[i], this.rigidBodies[j])
                    collision.ResolveCollision()
                    collision.PositionCorrection()
                }
            }
        }

    }
}

class RigidBody {
    constructor(shape, mass = 1) {
        this.shape = shape
        this.velocity = new Vector2(0, 0);
        this.isKinematic = false

        if (mass <= 0) {
            this.mass = 0;
            this.invMass = 0
            this.isKinematic = true
        }else{
            this.mass = mass
            this.invMass = 1 / mass;
        }

        this.forceAccumulator = new Vector2(0 ,0);

        this.material = {
            bounce: 0.5
        }
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