class SpawnerData {
    constructor(cooldown, angle, speed, rotation, lifetime, alphaFadeOut, drawData)
    {
        this.cooldown = StringHelper.checkFunc(cooldown, particleSystem);
        this.angle = StringHelper.checkFunc(angle, particleSystem, -360, 360);
        this.speed = StringHelper.checkFunc(speed, particleSystem, 0, 6000);
        this.rotation = StringHelper.checkFunc(rotation, particleSystem, -360, 360);
        this.lifetime = StringHelper.checkFunc(lifetime, particleSystem);
        this.alphaFadeOut = StringHelper.checkFunc(alphaFadeOut, particleSystem, 0, 1);
        this.drawData = drawData;
    }

    static fromJSON(json)
    {
        if (Array.isArray(json))
        {
            let result = [];
            for (let i = 0; i < json.length; i++)
            {
                result.push(SpawnerData.fromJSON(json[i]));
            }

            return result;
        }
        else if (json.iterations)
        {
            if (json.isSpawner)
            {
                return new IteratingSpawner_SpawnerData(
                    json.iterations,
                    StringHelper.Iteration_readSimplifiedFor(json.angle),
                    StringHelper.Iteration_readSimplifiedFor(json.speed),
                    StringHelper.Iteration_readSimplifiedFor(json.rotation), 
                    StringHelper.Iteration_readSimplifiedFor(json.lifetime),
                    StringHelper.Iteration_readSimplifiedFor(json.cooldown),
                    SpawnerData.fromJSON(json.spawnData),
                    json.position,
                    json.spawnLimits,
                    json.gravityStrength,
                    json.followMouse);
            }
            else
            {
                return new IteratingSpawnerData(
                    json.iterations,
                    StringHelper.Iteration_readSimplifiedFor(json.cooldown),
                    StringHelper.Iteration_readSimplifiedFor(json.angle),
                    StringHelper.Iteration_readSimplifiedFor(json.speed),
                    StringHelper.Iteration_readSimplifiedFor(json.rotation), 
                    StringHelper.Iteration_readSimplifiedFor(json.lifetime),
                    StringHelper.Iteration_readSimplifiedFor(json.alphaFadeOut),
                    DrawData.fromJSON(json.drawData));
            }
        }
        else
        {
            if (json.isSpawner)
            {
                return new Spawner_SpawnerData(json.angle, json.speed, json.rotation, json.lifetime, json.cooldown, SpawnerData.fromJSON(json.spawnData), json.position, json.spawnLimits, json.gravityStrength, json.followMouse);
            }
            else
            {
                return new SpawnerData(json.cooldown, json.angle, json.speed, json.rotation, json.lifetime, json.alphaFadeOut, DrawData.fromJSON(json.drawData));
            }
        }
    }

    spawn(system, pos, angle)
    {
        let a = angle + Math.rad(resolve(this.angle));
        let dir = new Vector(Math.cos(a), Math.sin(a));
        system.particles.push(
            new Particle(
                pos.copy(),
                dir, 
                resolve(this.speed), 
                resolve(this.rotation), 
                resolve(this.lifetime), 
                this.drawData.copy(), 
                resolve(this.alphaFadeOut), 
                a)
        );
    }
}

class IteratingSpawnerData extends SpawnerData {
    constructor(iterations, cooldown, angle, speed, rotation, lifetime, alphaFadeOut, drawData)
    {
        super(cooldown, angle, speed, rotation, lifetime, alphaFadeOut, drawData);
        this.iterations = iterations;
    }

    spawn(system, pos, angle)
    {
        let a = angle;
        
        for (let i = 0; i < this.iterations; i++)
        {
            a = angle + Math.rad(resolve(ForLoopHandler.getDataFromLoop(this.angle, i)));
            let dir = new Vector(Math.cos(a),Math.sin(a)); //TODO - resolve rotation bug

            system.particles.push(
                new Particle(
                    pos.copy(),
                    dir, 
                    resolve(ForLoopHandler.getDataFromLoop(this.speed, i)),
                    resolve(ForLoopHandler.getDataFromLoop(this.rotation, i)),
                    resolve(ForLoopHandler.getDataFromLoop(this.lifetime, i)),
                    this.drawData.copy(),
                    resolve(ForLoopHandler.getDataFromLoop(this.alphaFadeOut,i)),
                    a)
            );
        }
    }
}

class Spawner_SpawnerData
{
    constructor(angle, speed, rotation, lifetime, cooldown, spawnData, position = undefined, spawnLimits = undefined, gravityStrength = undefined, followMouse = undefined)
    {
        this.spawnerData = {
            cooldown: cooldown,
            angle : StringHelper.checkFunc(angle, particleSystem, 0, 360) || 0,
            rotation: StringHelper.checkFunc(rotation, particleSystem, 0, 360) || 0,
            lifetime: StringHelper.checkFunc(lifetime, particleSystem, 0, 360) || Infinity,
            speed: StringHelper.checkFunc(speed, particleSystem, 0, 360),
            spawnData: spawnData
        };
        this.otherData = {
            position: position,
            spawnLimits: spawnLimits,
            gravityStrength: gravityStrength,
            followMouse: followMouse
        }
    }

    static cloneData(spawnerData)
    {
        let clone = {};

        clone.cooldown = spawnerData.cooldown;
        clone.angle = spawnerData.angle;
        clone.rotation = spawnerData.rotation;
        clone.lifetime = spawnerData.lifetime;
        clone.spawnData = spawnerData.spawnData;
        clone.speed = spawnerData.speed;

        return clone;
    }

    spawn(system, pos, angle)
    {
        let data = Spawner_SpawnerData.cloneData(this.spawnerData);
        if (this.otherData.position)
        {
            if (this.otherData.position.isRelative)
            {
                pos = pos.copy();
                pos.add(new Vector(this.otherData.position.x, this.otherData.position.y));
            }

            if (this.otherData.gravityStrength)
            {
                data.gravityStrength = this.otherData.gravityStrength;
            }
        }
        else if (this.otherData.spawnLimits)
        {
            data.spawnLimits = this.otherData.spawnLimits;
        }
        else if (this.otherData.followMouse)
        {
            data.followMouse = this.otherData.followMouse;
        }

        if (pos) data.position = pos;
        data.angle = resolve(data.angle);
        if (angle) data.angle += angle;

        system.spawners.push(new Spawner(data, system));
    }
}

class IteratingSpawner_SpawnerData extends Spawner_SpawnerData
{
    constructor(iterations, angle, speed, rotation, lifetime, cooldown, spawnData, position = undefined, spawnLimits = undefined, gravityStrength = undefined, followMouse = undefined)
    {
        super(angle, speed, rotation, lifetime, cooldown, spawnData, position, spawnLimits, gravityStrength, followMouse);
        this.iterations = iterations;
    }

    spawn(system, pos, angle)
    {
        let data;
        for (let i = 0; i < this.iterations; i++)
        {
            data = Spawner_SpawnerData.cloneData(this.spawnerData);
            if (this.otherData.position)
            {
                if (this.otherData.position.isRelative)
                {
                    pos = pos.copy();
                    pos.add(new Vector(this.otherData.position.x, this.otherData.position.y));
                }

                if (this.otherData.gravityStrength)
                {
                    data.gravityStrength = this.otherData.gravityStrength;
                }
            }
            else if (this.otherData.spawnLimits)
            {
                data.spawnLimits = this.otherData.spawnLimits;
            }
            else if (this.otherData.followMouse)
            {
                data.followMouse = this.otherData.followMouse;
            }

            if (pos) data.position = pos;
            data.angle = resolve(ForLoopHandler.getDataFromLoop(data.angle, i));
            if (angle) data.angle += angle;
            data.angle = Math.rad(data.angle);
            data.rotation = ForLoopHandler.getDataFromLoop(data.rotation, i);
            data.lifetime = ForLoopHandler.getDataFromLoop(data.lifetime, i);

            system.spawners.push(new Spawner(data, system));
        }
    }
}

class ForLoopHandler {
    constructor(startVal, addVal, char)
    {
        this.startVal = startVal;
        this.addVal = addVal;
        this.operation = char;

        if (this.operation == '/')
        {
            if (this.addVal == 0) this.addVal = 1;
        }
    }

    getDataAtIteration(i)
    {
        switch(this.operation)
        {
            case '+':
                return this.startVal + (i * this.addVal);
            case '-':
                return this.startVal - (i * this.addVal);
            case '*':
                return this.startVal * Math.pow(this.addVal, i);
            case '/':
                return this.startVal / Math.pow(this.addVal, i);
            case "^":
                return Math.pow(this.startVal, Math.pow(this.addVal, i));
        }
        
        return null;
    }

    static getDataFromLoop(data,i)
    {
        return (data instanceof ForLoopHandler) ? data.getDataAtIteration(i) : data;
    }
}