class DrawData{
    constructor(color, rotation, radius, startAngle)
    {
        this.startAngle = StringHelper.checkFunc(startAngle, particleSystem,0, 360) || 0;
        this.startRotation = StringHelper.checkFunc(rotation, particleSystem,0, 360) || 0;
        this.startColor = StringHelper.checkFunc(color, particleSystem) || null;

        this.angle = Math.rad(resolve(this.startAngle) || 0);
        this.rotation = Math.rad(resolve(this.startRotation) || 0);
        this.color = resolve(this.startColor) || particleSystem.randomColor(false);
        if (typeof this.color === "string") 
        {
            this.color = DrawData.#standardize_Color(this.color);
            this.color = StringHelper.ColorToInt(this.color);
        }
        this.radius = radius;
    }

    static fromJSON(json)
    {
        return new DrawData(json.color, json.rotation, json.radius, json.angle);
    }

    update()
    {
    }

    static #standardize_Color(str)
    {
        if (str.startsWith("runtime_randomColor") || str.startsWith("randomColor")) return str;
        
        var ctx = particleSystem.ctx;
        ctx.strokeStyle = str;
        return ctx.strokeStyle;
    }

    copy()
    {
        return new DrawData(this.startColor, this.startRotation, this.radius, this.startAngle);
    }
}