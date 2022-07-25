class StringHelper {
    static #conversionTable = new Map();

    static init()
    {
        this.#conversionTable.set("random", StringHelper.checkRandomFunc);
        this.#conversionTable.set("randomColor", StringHelper.checkRandomColorFunc);
    }

    static readParameters(strFunc){
        if (strFunc[strFunc.length-1] === ")")
        {
            let paramIndex = strFunc.indexOf("(");
            let strParams = strFunc.substring(paramIndex+1);
            strParams = strParams.slice(0, -1);
            
            let params = strParams.split(",");

            for (let i = 0; i < params.length; i++)
            {
                let temp = parseFloat(params[i]);
                if (temp) params[i] = temp;
            }

            return params;
        }

        return null;
    }

    static checkFunc(str,sys,min = 0,max = Infinity){
        
        if (typeof str === "string")
        {
            if (str.startsWith("runtime_")) /* is Runtime */
            {
                return this.checkRuntimeFunc(str,sys,min,max);
            }
            else /* is not Runtime */
            {
                let index = str.indexOf("(");
                let key = str.substring(0,(index!=-1 ? index : Infinity));
                
                if (this.#conversionTable.has(key))
                {
                    return this.#conversionTable.get(key)(str, sys, min, max);
                }
            }
        }

        return parseFloat(str) || str;
    }

    static checkRandomFunc(str,sys,min,max){
        if (typeof str === "string")
        {
            if (str.startsWith("random"))
            {
                if (str.length == 6)
                {
                    return sys.randomIntFromInterval(min,max);
                }
                else
                {
                    let args = StringHelper.readParameters(str);

                    if (args.length < 2)
                    {
                        args = [args[0] || min,max];
                    }
                    return sys.randomIntFromInterval(args[0], args[1]);
                }
            }
        }

        return parseFloat(str) || str;
    }

    static checkRandomColorFunc(str,sys){
        if (typeof str === "string")
        {
            if (str.startsWith("randomColor"))
            {
                if (str.length == 11)
                {
                    return sys.randomColor(false);
                }
                else
                {
                    let args = StringHelper.readParameters(str);

                    if (args.length < 2)
                    {
                        args = [args[0] || "#000000", "#FFFFFF"];
                    }
                    return sys.randomColor(true, args);
                }
            }
        }

        return str;
    }

    static checkRuntimeFunc(str,sys,min,max)
    {
        if (typeof str === "string")
        {
            if (str.startsWith("runtime"))
            {
                let newStr = str.substring(8);

                let index = newStr.indexOf("(");
                let key = newStr.substring(0, index != -1 ? index : Infinity);

                let func = this.#conversionTable.get(key);

                return function () {return func(newStr, sys, min, max)};
            }
        }

        return parseFloat(str) || str;
    }

    static Iteration_readSimplifiedFor(str)
    {
        if (typeof str === "string")
        {
            let char = "";
            if (str.indexOf("+") != -1 && str.indexOf("+") != 0)
            {
                char = "+";
            }
            else if (str.indexOf("-") != -1 && str.indexOf("-") != 0)
            {
                char = "-";
            }
            else if (str.indexOf("*") != -1 && str.indexOf("*") != 0)
            {
                char = "*";
            }
            else if (str.indexOf("/") != -1 && str.indexOf("/") != 0)
            {
                char = "/";
            }
            else if (str.indexOf("^") != -1 && str.indexOf("^") != 0)
            {
                char = "^";
            }

            if (char === "")
            {
                return str;
            }

            let elems = str.split(char);
            elems[0] = parseFloat(elems[0]);
            elems[1] = parseFloat(elems[1]);

            if (isNaN(elems[0]) || isNaN(elems[1])) return str;

            return new ForLoopHandler(elems[0], elems[1], char);
        }

        return str;
    }

    static ColorToInt(color, alpha = 0)
    {
        let parts = color.substring(1).match(/.{2}/g);
        let c = (parseInt("0x"+parts[0]) & 0xFF);
        c |= (parseInt("0x"+parts[1]) & 0xFF) << 8;
        c |= (parseInt("0x"+parts[2]) & 0xFF) << 16;
        c |= ((alpha*255) & 0xFF) << 24;

        return c;
    }
}
StringHelper.init();
StringHelper.init = undefined;

Object.freeze(StringHelper);