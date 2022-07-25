class Spawner{

    constructor(spawnerData, system, spawndataAnalyser)
    {
        this.maxCooldown = spawnerData.cooldown || 0;
        this.coolDown = 0;
        this.type = null;
        if (spawndataAnalyser) this.spawnData = spawndataAnalyser(spawnerData.spawnData);
        else this.spawnData = spawnerData.spawnData;

        this.system = system;
        this.angle = StringHelper.checkFunc(spawnerData.angle,system,0,360) || 0;
        this.rotation = StringHelper.checkFunc(spawnerData.rotation,system,0,360) || 0;
        this.lifetime = parseFloat(resolve(StringHelper.checkFunc(spawnerData.lifetime, system))) || Infinity;

        this.lifeLived = 0;

        this.direction = new Vector(0,0);

        if (spawnerData.position == undefined || spawnerData.gravity || spawnerData.speed)
        {
            if (spawnerData.followMouse)
            {
                this.type = 2;
            }
            else if (spawnerData.gravity)
            {
                this.type = 3;
                this.position = new Vector(spawnerData.position.x, spawnerData.position.y);
                this.gravityStrength = spawnerData.gravityStrength / 100;
            }
            else if (spawnerData.speed)
            {
                this.type = 4;
                this.position = new Vector(spawnerData.position.x, spawnerData.position.y);
                this.speed = StringHelper.checkFunc(spawnerData.speed, system) || 1;
                let a = typeof this.angle === "number" ? this.angle : Math.random(this.angle());
                let s = resolve(this.speed);
                this.mvt = new Vector(Math.cos(a)*s, Math.sin(a)*s);
                this.gravityStrength = (spawnerData.gravityStrength/100) || 0;
            }
            else
            {
                this.type = 1;
                if (spawnerData.spawnLimits)
                {
                    this.spawnLimits = [
                        new Vector(spawnerData.spawnLimits[0].x,spawnerData.spawnLimits[0].y),
                        new Vector(spawnerData.spawnLimits[1].x,spawnerData.spawnLimits[1].y)
                    ];
                }
                else
                {
                    this.spawnLimits = [
                        new Vector(0,0),
                        new Vector(1,1)
                    ];
                }
            }
        }
        else
        {
            this.type = 0;
            this.position = new Vector(spawnerData.position.x, spawnerData.position.y);
        }

        this.markedForDeletion = false;
    }

    update()
    {
        let pos = this.calculateSpawnPosition();
        if (this.coolDown++ >= this.maxCooldown)
        {
            let angle = resolve(this.angle) + resolve(this.rotation)*this.lifeLived++;
            for (let i = 0; i < this.spawnData.length; i++){
                this.spawnData[i].spawn(this.system, pos, angle);
            }

            this.coolDown = 0;
        }

        if (this.type == 3 || this.type == 4)
        {
            if (this.position.x < 0 || this.position.x > this.system.canvas.width ||
                this.position.y < 0 || this.position.y > this.system.canvas.height)
            {
                this.markedForDeletion = true;
            }
            this.mvt.y += this.gravityStrength;
        }

        if (this.lifetime-- <= 0) this.markedForDeletion = true;
    }

    calculateSpawnPosition()
    {
        let pos = new Vector(-1,-1);
        switch (this.type)
        {
            case 4:
                pos.x = this.position.x;
                pos.y = this.position.y;
                this.position.add(this.mvt);
            break;
            case 3:
            case 0:
                pos.x = this.position.x;
                pos.y = this.position.y;
            break;
            case 1:
                pos.x = this.system.randomIntFromInterval(this.system.canvas.offsetWidth * this.spawnLimits[0].x, this.system.canvas.offsetWidth * this.spawnLimits[1].x);
                pos.y = this.system.randomIntFromInterval(this.system.canvas.offsetHeight * this.spawnLimits[0].y, this.system.canvas.offsetHeight * this.spawnLimits[1].y);
            break;
            case 2:
                pos.x = this.system.mouse.x;
                pos.y = this.system.mouse.y;
            break;
        }

        return pos;
    }

    readSpawnData(data)
    {
        return SpawnerData.fromJSON(data);
    }

}