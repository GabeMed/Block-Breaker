import { toDegrees, toRadians } from "../utils"

export default class Vector {
    constructor(x,y){
        this.x = x
        this.y = y
    }

    scaleBy(scalar){
        return new Vector(this.x * scalar, this.y * scalar)
    }

    length(){
        return Math.hypot(this.x, this.y)
    }

    add({x, y}){
        return new Vector(this.x + x, this.y + y)
    }

    normalize(){
        return this.scaleBy(1/this.length())
    }

    subtract({x,y}){
        return new Vector(this.x - x, this.y - y)
    }

    dotProduct({x,y}){  // ! IMPROVE
        return this.x * x + this.y + y
    }

    projectOn(other){
        const temp = this.dotProduct(other) / other.length()
        return new Vector(temp * other.x, temp * other.y)
    }

    reflect(direction){
        return this.subtract(this.projectOn(direction).scaleBy(2))
    }

    rotate(degrees){
        const radians = toRadians(degrees)
        const cos = Math.cos(radians)
        const sin = Math.sin(radians)

        return new Vector(
            this.x * cos - this.y * sin,  // Just apply the rotation matrix  
            this.x * sin + this.y * cos
        )
    }

    crossProduct({x,y}){  // ! IMPROVE
        return this.x * y - this.y * x
    }

    angleBetween(other) {
        return toDegrees(
          Math.atan2(this.crossProduct(other), this.dotProduct(other))
        )
      }
}