class Vector {
    
    constructor(px, py) {
        this.x = px;
        this.y = py;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }

    substract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
    }

    multiply(factor) {
        this.x *= factor;
        this.y *= factor;
    }

    divide(factor) {
        this.x /= factor;
        this.y /= factor;
    }

    normalize(){
        let dist = this.magnitude();

        this.x /= dist;
        this.y /= dist;
    }

    magnitude(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    opposite()
    {
        this.x = -this.x;
        this.y = -this.y;
    }

    lerp(other, amt)
    {
        return new Vector(lerp(this.x, other.x, amt), lerp(this.y, other.y, amt));
    }

    copy()
    {
        return new Vector(this.x, this.y);
    }
}