class PixelBuffer{
    static #minDataAlloc = 50000;

    constructor()
    {
        this.lastIndex = 0;

        this.imageData = null;
        this.buffer = null;
        this.bytesBuffer = null;
        this.intsBuffer = null;
        this.dimensions = {w:-1,h:-1};
    }

    addPixel(color, alpha, x, y)
    {
        if (x < 0 || x > this.dimensions.w || y < 0 || y > this.dimensions.h) return;

        this.intsBuffer[y * this.dimensions.w + x] = this.#alphaBlendC(color, alpha, this.intsBuffer[y * this.dimensions.w + x]);
        this.lastIndex++;
    }

    addCircle(color, alpha, x, y, r) //TODO
    {
        /* DIVIDE THE CIRCLE BY FOUR AND TAKE ONLY THE TOP-LEFT CORNER */
        /* CALCULATE THE TOP-LEFT CORNER THEN TWEAK SOME VALUE TO APPLY THE SAME THING TO THE OTHER CORNERS*/
            
        /*Use square distance to avoid square roots*/
        let sq_r = r*r;
        let dx = 0;
        let dy = 0;

        let L_nx,R_nx,T_ny,B_ny;
        let rDist;

        while(dy < r){
            L_nx = x-dx;
            R_nx = x+dx;

            rDist = (r-dy);

            T_ny = y-rDist;
            B_ny = y+rDist;
            for (let i = 0; i < r-dy; i++)
            {
                if ( !(L_nx < 0 || L_nx > this.dimensions.w || (T_ny+i) < 0 || (T_ny+i) >= this.dimensions.h) )
                    this.intsBuffer[(T_ny+i) * this.dimensions.w + L_nx] = this.#alphaBlendC(color, alpha, this.intsBuffer[(T_ny+i) * this.dimensions.w + L_nx]);
    
                if ( !(L_nx < 0 || L_nx > this.dimensions.w || (B_ny-i) < 0 || (B_ny-i) >= this.dimensions.h) )
                    this.intsBuffer[(B_ny-i) * this.dimensions.w + L_nx] = this.#alphaBlendC(color, alpha, this.intsBuffer[(B_ny-i) * this.dimensions.w + L_nx]);
    
                if (dx != 0) {
                    if ( !(R_nx < 0 || R_nx > this.dimensions.w || (T_ny+i) < 0 || (T_ny+i) >= this.dimensions.h) )
                        this.intsBuffer[(T_ny+i) * this.dimensions.w + R_nx] = this.#alphaBlendC(color, alpha, this.intsBuffer[(T_ny+i) * this.dimensions.w + R_nx]);

                    if ( !(R_nx < 0 || R_nx > this.dimensions.w || (B_ny-i) < 0 || (B_ny-i) >= this.dimensions.h) )
                        this.intsBuffer[(B_ny-i) * this.dimensions.w + R_nx] = this.#alphaBlendC(color, alpha, this.intsBuffer[(B_ny-i) * this.dimensions.w + R_nx]);
                }
            }

            /* Draw the middle of the circle Horizontally */
            if ( !(L_nx < 0 || L_nx > this.dimensions.w || (T_ny+rDist) < 0 || (T_ny+rDist) >= this.dimensions.h) )
                this.intsBuffer[(T_ny+rDist) * this.dimensions.w + L_nx] = this.#alphaBlendC(color, alpha, this.intsBuffer[(T_ny+rDist) * this.dimensions.w + L_nx]);
            
            if (dx != 0) {
                if ( !(R_nx < 0 || R_nx > this.dimensions.w || (T_ny+rDist) < 0 || (T_ny+rDist) >= this.dimensions.h) )
                    this.intsBuffer[(T_ny+rDist) * this.dimensions.w + R_nx] = this.#alphaBlendC(color, alpha, this.intsBuffer[(T_ny+rDist) * this.dimensions.w + R_nx]);
            }
            
            dx++;
            L_nx = x-dx;
            while (Math.pow(L_nx-x,2) + Math.pow(T_ny-y,2) > sq_r && dy < r)
            {
                dy++;
                T_ny = y-(r-dy);
            }
        }

        this.lastIndex++;
    }

    addDrawData(drawData, alpha, x, y)
    {
        if (!drawData) return;
        if (drawData.radius <= 0) return;

        if (drawData.radius == 1) this.addPixel(drawData.color, alpha, x, y);
        else this.addCircle(drawData.color, alpha, x, y, drawData.radius);
    }

    setImageData(canvas, ctx)
    {
        this.imageData = ctx.getImageData(0,0,canvas.width, canvas.height);

        this.buffer = new ArrayBuffer(this.imageData.data.length);
        this.bytesBuffer = new Uint8ClampedArray(this.buffer);
        this.intsBuffer = new Uint32Array(this.buffer);

        this.dimensions.w = canvas.width;
        this.dimensions.h = canvas.height;
    }

    saveImageData()
    {
        if (this.lastIndex > 0) this.imageData.data.set(this.bytesBuffer);
    }

    #alphaBlend(c1, a1, c2, a2)
    {
        //TODO - alpha blend c1 over c2 and return the result color;
        let b1 = (c1 >> 16) & 0xFF;
        let g1 = (c1 >> 8) & 0xFF;
        let r1 = c1 & 0xFF;

        let b2 = (c2 >> 16) & 0xFF;
        let g2 = (c2 >> 8) & 0xFF;
        let r2 = c2 & 0xFF;

        let a0 = a1 + a2*(1-a1);

        let r0, g0, b0;

        if (a0 <= 0)
        {
            return 0;
        }
        else if (a0 >= 1)
        {
            r0 = r1*a1 + (r2*a2)*(1-a1);
            g0 = g1*a1 + (g2*a2)*(1-a1);
            b0 = b1*a1 + (b2*a2)*(1-a1);
        }
        else
        {
            r0 = (r1*a1 + (r2*a2)*(1-a1))/a0;
            g0 = (g1*a1 + (g2*a2)*(1-a1))/a0;
            b0 = (b1*a1 + (b2*a2)*(1-a1))/a0;
        }

        return ((a0 * 0xFF) << 24) | ((b0 & 0xFF) << 16) | ((g0 & 0xFF) << 8) | (r0 & 0xFF);
    }

    #alphaBlendC(c1, a1, c2)
    {
        let a2 = (c2 >> 24) & 0xFF;
        if (a1 >= 1 || a2 <= 0) return c1 | ((a1*255) << 24);
        else if (a1 <= 0) return c2;

        return this.#alphaBlend(c1,a1, c2, a2/0xFF);
    }

    empty()
    {
        this.lastIndex = 0;
    }

    draw(ctx, redrawRect)
    {
        if (this.lastIndex <= 0) return;

        /* NEW METHOD WITH IMAGEDATA */
        let x = redrawRect.smallestX;
        let y = redrawRect.smallestY;
        let w = redrawRect.highestX - redrawRect.smallestX;
        let h = redrawRect.highestY - redrawRect.smallestY;

        ctx.putImageData(this.imageData, 0, 0, x, y, w, h);

    }
}