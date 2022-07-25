class Particle{
    constructor(position, direction, mvtSpeed, rotation, lifetime, drawData, alphaFadeOut, angle = undefined)
    {
        this.del_timer = null;
        this.position = position;

        this.speed = mvtSpeed;
        this.alpha = 1;
        this.alphaFadeOut = alphaFadeOut || 0.05;

        this.angle = angle || Math.atan2(direction.y, direction.x);
        this.rotation = Math.rad(rotation);

        this.drawData = drawData;
        this.lifetime = Math.round(resolve(lifetime));

        this.mvt = direction;
        this.mvt.normalize();
        this.mvt.multiply(this.speed);
    }

    update(boundRect, pxBuf, system, id)
    {
        if (!this.markedForDeletion)
        {
            this.position.add(this.mvt);
            if (this.rotation != 0)
            {
                this.angle += this.rotation;
                this.mvt.x = Math.cos(this.angle) * this.speed;
                this.mvt.y = Math.sin(this.angle) * this.speed;
            }

            this.drawData.update();

            if (this.position.x - this.drawData.w < boundRect.smallestX)
            {
                boundRect.smallestX = this.position.x - this.drawData.w;
            }
            if (this.position.x + this.drawData.w > boundRect.highestX)
            {
                boundRect.highestX = this.position.x + this.drawData.w;
            }

            if (this.position.y - this.drawData.h < boundRect.smallestY)
            {
                boundRect.smallestY = this.position.y - this.drawData.h;
            }
            if (this.position.y + this.drawData.h > boundRect.highestY)
            {
                boundRect.highestY = this.position.y + this.drawData.h;
            }

            if (this.position.x <= -this.drawData.radius || this.position.x >= particleSystem.canvas.width + this.drawData.radius ||
                this.position.y <= -this.drawData.radius || this.position.y >= particleSystem.canvas.height + this.drawData.radius)
            {
                system.unwantedParticles.push(id);
            }
            else if (this.fading)
            {
                this.disappear(system, id);
            }
            else if (this.lifetime-- == 0)
            {
                this.markForDeletion();
            }
            

            this.draw(pxBuf);
        }
    }

    markForDeletion()
    {
        this.fading = true;
    }

    disappear(system, id)
    {
        if (this.alpha <= this.alphaFadeOut)
		{
            this.fading = false;
            system.unwantedParticles.push(id);
		}
		else
		{
			this.alpha -= this.alphaFadeOut;
		}
    }

    /* ADD PIXELS TO PARALLEL BUFFERS */
    addPixel_Parallel(pixelBuffer)
    {
        if (this.drawData.w == 1)
        {
            pixelBuffer.Parallel_AddPixel(this.drawData.color, this.alpha, (this.position.x+0.5)|0, (this.position.y+0.5)|0);
        }
    }

    draw(pxBuf)
    {
        pxBuf.addDrawData(this.drawData, this.alpha, (this.position.x+0.5)|0, (this.position.y+0.5)|0);
    }
}