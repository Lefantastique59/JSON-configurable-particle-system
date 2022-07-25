/*
    Regroups all basics functions for future use.
*/

/**
 * Opens fullscreen
 * Includes prefixes to ensure it works on differents browsers.
 * 
 * Found on : https://www.w3schools.com/howto/howto_js_fullscreen.asp
 * 
 * @param {*} elem The DOM element to be fullscreened.
**/
function openFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

/**
 * Closes fullscreen 
 * Includes prefixes to ensure it works on differents browsers.
 * 
 * Found on : https://www.w3schools.com/howto/howto_js_fullscreen.asp
**/
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}

/**
 * Toggle fullscreen satte for the specified element elem.
 * 
 * @param {*} elem The DOM element to be fullscreened or un-fullscreened.
 */
function toggleFullscreen(elem)
{
    if (document.fullscreenElement){
        closeFullscreen();
    } else {
        openFullscreen(elem);
    }
}

/**
 * Resizes the canvas to the provided width and height
 * 
 * @param {*} canvas The canvas DOM element
 * @param {*} w The width to apply to the canvas, in pixels if integer, must be a string otherwise
 * @param {*} h The height to apply to the canvas, in pixels if integer, must be a string otherwise
**/
function resizeCanvas(canvas, w, h)
{
    if(canvas.tagName.toLowerCase() == "canvas"){
        canvas.style.Width = w+(typeof w === "integer")?"px":"";
        canvas.style.Height = h+(typeof h === "integer")?"px":"";
        canvas.setAttribute("width", w+((typeof w === "number")?"px":""));
        canvas.setAttribute("height", h+((typeof h === "number")?"px":""));
    }
}