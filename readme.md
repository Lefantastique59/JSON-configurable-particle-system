# JSON-Configurable particle system v 1.0.1

This program is a Javascript "canvas" particle system that reads data from a JSON file to setup itself.

This program simulate a bunch of particles on a HTML5 canvas using the 2d canvas context.

To use the particle system, call the **init** function of the particleSystem object and provide the canvas DOM element id and the path (relative from the HTML/PHP page)

## JSON format Documentation

The JSON setup file is structured like this : 

- a "bgColor" field that tells the program what is the background color of the canvas used. **optional -> default value : black**
- a "spawners" JSON array. **mandatory**

The "spawners" array contains JSON objects that defines spawners (one object per spawner).

### A spawner object is defined as follows (may change in future updates) :

#### Spawner-specific values

- "followMouse" : indicates if the spawner follows the mouse. **optional -> default value : false**
- "gravity" : indicates if the spawner should be affected by gravity **optional -> default value : false**
- "position" : the position of the spawner. **optional -> default value : relative to spawn position**
- "speed" : the speed at which the spawner move. **optional -> default value : 0**
- "spawnLimits" : The limits of the canvas where the spawner can spawn things at random. **optional -> default value : undefined if one of the above is specified or takes all the screen {(0,0) to (1,1)}**
- "isSpawner" : indicates if the spawner should spawn others spawners. **optional -> default value : false**

- "cooldown" : number of frames to wait between two spawns.
- "angle" : angle in degrees at which spawn the objects. **optional -> default value : 0**
- "rotation" : rotation in degrees to add up to the spawner angle at each spawns. **optional -> default value : 0**
- "lifetime" : lifetime in frames of the spawner. **optional -> default value : Infinity**

##### if the spawner spawns others spawners

- "spawnData" : a JSON array that defines spawners to spawn. Contains spawner objects.

##### if the spawner spawns particles

- "drawData" : a JSON object that contains data used to draw particles.

A drawData object is defined as follows (may change in future updates) :

- "color" : The color of the particle. **optional -> default value : a random color**
- "radius" : The radius of the particle. If defined to 1 the particle will be a "pixel particle".

## Spawners

### Normal spawners

A normal spawner can spawn one particle/spawner at a time.

The normal spawners uses "basic" value, which means it uses normal values for the spawner parameters.

#### Here are normal values for spawner parameters :

- "cooldown" : **int**
- "angle" : **int or float**
- "rotation" : **int or float**
- "lifetime" : **int**

- "followMouse" : **boolean**
- "gravity" : **boolean**
- "position" : **object {x, y, isRelative}**
    - "x" : **int or float**
    - "y" : **int or float**
    - "isRelative" : **boolean**
- "speed" : **int or float**
- "spawnLimits" : **array [{x, y},{x, y}]**
    - "x" : **int or float**
    - "y" : **int or float**
- "isSpawner" : **boolean**

*If a parameter is provided with invalid type of value, unknown behavior could occur.* 

### Iterating spawners

An iterating spawner can spawn multiple particles/spawners at a time.

It needs the "iterations" parameter to be able to work, this parameters indicating how many particles/spawners should be spawned. As its nature implies, this parameter is constant and cannot be changed through normal means during the execution of the program.

The iterating spawners uses either "basic" values or "simplified for" expressions.

If a "basic" value is used for a parameter, then it will use that same value without changing it for all the objects to spawn.

If an "simplified for" expression is used for a parameter that can accept it, it will behave as follows (we'll use "angle" as an example with expression "0+10") :

- *first spawn iteration*
- "angle" is set to 0
- **spawns particle**
- "angle" goes up by 10
- *second spawn iteration*
- **spawns second particle**
- "angle" goes up by 10
- *continues like that until all iterations are done*

#### Simplified For Expressions

A "simplified for" expression is a simple string expression that serve to represent loops in the particle system for a single parameter.

An "simplified for" expression is defined as follows :

*"<int or float> <operation character> <int or float>"*

example : *"0+45"* is a "simplified for" expression that begins with the value 0 then adds up 45 every iterations.

The differents operations characters are as follows :

- "+" : represents an addition operation character
- "-" : represents a substraction operation character
- "*" : represents a multiplication operation character
- "/" : represents a division operation character
- "^" : represents a power operation character

If the operation character is invalid, it will consider the given string as a normal string and use it as is.

# More infos

This program will receive updates in the future to improve it's stability, it's optimization, and the numbers of possibilities allowed by it. Expect changes in the future.

Hope you'll enjoy it :D !

![thumnail image](/Assets/thumnail.jpg)