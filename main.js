let particleSystem = {
    particles: [],
    unwantedParticles: [],
    spawners: [],
    mouse: {x: -1,y: -1},
    canvas: null,
    ctx: null,
    convertTable: [["0", 0], ["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["8", 8], ["9", 9] ,["a", 10], ["b", 11], ["c", 12], ["d", 13], ["e", 14], ["f", 15]],
    config: {bgColor:"black"},
    PixelBuffer:null,
    debugHandler: {
        fps:0, 
        currentFPS:0, 
        perfTimestamp:0,
        AvgupdateTime:0,
        timesUpdated:0,
        AvgDrawTime:0,
        timesDrawed:0
    },
    boundRedrawRect:{
        smallestX:0,
        smallestY:0,
        highestX:0,
        highestY:0
    },
    oldRedrawRect:{
        smallestX:0,
        smallestY:0,
        highestX:0,
        highestY:0
    },

    readTextFile: function (file) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);

        let myself = this;
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
                myself.readJSONdata(JSON.parse(rawFile.responseText));
            }
        }
        rawFile.send(null);
    },
    readJSONdata(data){
        this.config.bgColor = data.bgColor || "black";
        this.canvas.style.backgroundColor = this.config.bgColor;

        for (let i = 0; i < data.spawners.length; i++)
        {
            this.spawners.push(new Spawner(data.spawners[i], this, (data) => {return SpawnerData.fromJSON(data)}));
        }
    },
    mouseMovedetect: function(e) {
        let boundingBox = particleSystem.canvas.getBoundingClientRect();
        particleSystem.mouse.x = e.clientX - boundingBox.left;
        particleSystem.mouse.y = e.clientY - boundingBox.top;
    },
    //Color conversion functions
    convertToHex: function(arg){
        
        for (k = 0; k < this.convertTable.length; k++)
        {
            if (arg.toLowerCase() == this.convertTable[k][0].toLowerCase())
            {
                return this.convertTable[k][1];
            }
        }
    },
    HexToString: function(arg) {
        for (k = 0; k < this.convertTable.length; k++)
        {
            if (arg == this.convertTable[k][1])
            {
                return this.convertTable[k][0];
            }
        }
    },
    //Color generation functions
    randomIntFromInterval: function(min,max){
        return Math.floor(Math.random()*(max-min+1)+min);
    },
    randomColor: function(between, color){
        var resultcolor = "#";
        var colorone_one = [];
        if (between)
        {
            for (j = 0; j < 6; j++)
            {
                colorone_one[j] = this.randomIntFromInterval(this.convertToHex(color[0][j+1]), this.convertToHex(color[1][j+1]));
                resultcolor += this.HexToString(colorone_one[j]);
            }
        }
        else
        {
            var color_one = "#000000";
            var color_two = "#ffffff";
            var colorone = [];
            var colortwo = [];
            for (j = 0; j < 6; j++)
            {
                colorone[j] = this.convertToHex(color_one[j + 1]);
                colortwo[j] = this.convertToHex(color_two[j + 1]);
                colorone_one[j] = this.randomIntFromInterval(colorone[j], colortwo[j]);
                resultcolor += this.HexToString(colorone_one[j]);
            }
        }
        return resultcolor;
    },
    onFullscreen: function(){
        let myself = particleSystem;
        if (document.fullscreenElement)
        {
            myself.canvas.width = myself.canvas.offsetWidth;
            myself.canvas.height = myself.canvas.offsetHeight;
        }
        else {
            myself.canvas.width = myself.canvas.getAttribute("base_width");
            myself.canvas.height = myself.canvas.getAttribute("base_height");
        }
        myself.particles = [];
    },

    //Run functions
    init: function(canvasID, path) {
        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext("2d");
        this.canvas.addEventListener("mousemove", this.mouseMovedetect, false);
        this.mouse.x = this.canvas.width/2;
        this.mouse.y = this.canvas.height/2;
        this.PixelBuffer = new PixelBuffer();

        this.canvas.setAttribute("base_width", this.canvas.width);
        this.canvas.setAttribute("base_height", this.canvas.height);
        
        this.readTextFile(path);

        document.addEventListener("fullscreenchange", this.onFullscreen)

        requestAnimationFrame(function(){particleSystem.draw();});
    },
    update: function(){
        let time = performance.now();

        this.oldRedrawRect.smallestX = this.boundRedrawRect.smallestX;
        this.oldRedrawRect.smallestY = this.boundRedrawRect.smallestY;
        this.oldRedrawRect.highestX = this.boundRedrawRect.highestX;
        this.oldRedrawRect.highestY = this.boundRedrawRect.highestY;

        this.boundRedrawRect.smallestX = this.canvas.width;
        this.boundRedrawRect.smallestY = this.canvas.height;
        this.boundRedrawRect.highestX = 0;
        this.boundRedrawRect.highestY = 0;

        this.PixelBuffer.setImageData(this.canvas,this.ctx);

        for (let i = 0; i < this.particles.length; i++)
        {
            this.particles[i].update(this.boundRedrawRect, this.PixelBuffer, this, i);
        }

        for (let i = 0; i < this.spawners.length; i++)
        {
            this.spawners[i].update();
        }

        this.PixelBuffer.saveImageData();

        if (this.boundRedrawRect.smallestX < 0) this.boundRedrawRect.smallestX = 0;
        if (this.boundRedrawRect.smallestY < 0) this.boundRedrawRect.smallestY = 0;
        
        if (this.boundRedrawRect.highestX > this.canvas.width) this.boundRedrawRect.highestX = this.canvas.width;
        if (this.boundRedrawRect.highestY > this.canvas.height) this.boundRedrawRect.highestY = this.canvas.height;

        this.boundRedrawRect.smallestX = (this.boundRedrawRect.smallestX-1) | 0;
        this.boundRedrawRect.smallestY = (this.boundRedrawRect.smallestY-1) | 0;

        this.boundRedrawRect.highestX = (this.boundRedrawRect.highestX+1) | 0;
        this.boundRedrawRect.highestY = (this.boundRedrawRect.highestY+1) | 0;

        this.deleteUnwanted();

        time = performance.now() - time;

        particleSystem.debugHandler.AvgupdateTime += time;
        particleSystem.debugHandler.timesUpdated++;

        requestAnimationFrame(function(){particleSystem.draw();});
    },
    draw: function(){
        let time = performance.now();

        this.ctx.clearRect(
            this.oldRedrawRect.smallestX,
            this.oldRedrawRect.smallestY,
            this.oldRedrawRect.highestX-this.oldRedrawRect.smallestX,
            this.oldRedrawRect.highestY-this.oldRedrawRect.smallestY
        );

        this.PixelBuffer.draw(this.ctx, this.boundRedrawRect);
        this.PixelBuffer.empty();

        /* DEBUG SYSTEM */
        time = performance.now() - time;

        this.debugHandler.fps++;

        this.debugHandler.AvgDrawTime += time;
        this.debugHandler.timesDrawed++;

        let perfNow = performance.now();
        if (perfNow - this.debugHandler.perfTimestamp >= 1000)
        {
            this.debugHandler.currentFPS = this.debugHandler.fps;
            this.debugHandler.fps = 0;
            this.debugHandler.perfTimestamp = perfNow;
            this.debugHandler.AvgupdateTime /= this.debugHandler.timesUpdated;
            this.debugHandler.AvgDrawTime /= this.debugHandler.timesDrawed;

            console.log("\n-------------------------------")
            console.log("Number of particles", this.particles.length);
            console.log("FPS : ", this.debugHandler.currentFPS);
            console.log("Average update time : ", this.debugHandler.AvgupdateTime);
            console.log("Average draw time : ", this.debugHandler.AvgDrawTime);

            let execTime = this.debugHandler.AvgupdateTime + this.debugHandler.AvgDrawTime;
            if (execTime > 1000/60)
            {
                console.log("TOO LONG FOR TARGET FPS!\nTARGET IS : ", 1000/60,"\nEXECUTION TIME IS : ", execTime);
            }

            this.debugHandler.AvgupdateTime = 0;
            this.debugHandler.timesUpdated = 0;
            this.debugHandler.AvgDrawTime = 0;
            this.debugHandler.timesDrawed = 0;
        }

        //UPDATE THE SYSTEM
        this.update();
    },
    deleteUnwanted: function(){
        for(let i = 0; i < this.unwantedParticles.length; i++)
        {
            let index = this.unwantedParticles[i] - i;
            this.particles[index] = undefined;
            this.particles.splice(index, 1);
        }

        for(let i = 0; i < this.spawners.length; i++)
        {
            if (this.spawners[i].markedForDeletion)
            {
                let toDel = this.spawners.splice(i, 1);
                delete toDel[0];
                i--;
            }
        }

        this.unwantedParticles = undefined;
        this.unwantedParticles = [];
    }
}

// Converts from degrees to radians.
Math.rad = function(degrees) {
    /*return degrees * Math.PI / 180;*/
    return degrees * Math.PI * 0.005555555555555556;
};
   
// Converts from radians to degrees.
Math.deg = function(radians) {
    /*return radians * 180 / Math.PI;*/
    return radians * 180 * 0.3183098861837907;
};

function resolve(value)
{
    return (typeof value === "function") ? value() : value;
}

function init()
{
    particleSystem.init("projet-canvas", "ExampleJSON/example.json");
}

init();