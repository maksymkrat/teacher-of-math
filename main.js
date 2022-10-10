const canvas = document.getElementById("canvas");
canvas.width = 500;
canvas.height = 500;

let context = canvas.getContext("2d");
let start_background_color = "white "
context.fillStyle = start_background_color;
context.fillRect(0, 0 ,canvas.width,canvas.height);

let default_img = new Image();

let draw_color = "black";

let draw_width = "9";
let is_drawing = false;
let touched_canvas = false;

let positionX = 0;
let positionY = 0;
//symbol
let is_symbol = false;
let is_square = false;
let print_symbol = "";

//arrow
let is_arrow = false;
let fromX = 0;
let fromY = 0;

//history
let restore_array = [];
let index = -1;

//button style
let temporaryIdButton = "Btn_pen"; //default style for pen when start draw
let temporaryIdHistoryLayer = null;

let boolSelectLayer = false;

function clearCanvas(){
    temporaryIdHistoryLayer = null;
    restore_array = [];
    boolSelectLayer = null;

    context.fillStyle = start_background_color;
    context.fillRect(0, 0 ,canvas.width,canvas.height);

    restore_array = []
    index = -1;

    //history
    let history_container = document.getElementsByClassName('history_changes')[0];
    history_container.innerHTML = "";
}
canvas.addEventListener("touchstart", start, false);
canvas.addEventListener("touchmove", draw, false); 

canvas.addEventListener("mousedown", start, false);
canvas.addEventListener("mousemove", draw, false);

canvas.addEventListener("touchend", stop, false);
canvas.addEventListener("mouseup", stop, false);
canvas.addEventListener("mouseout", stop, false);

let fs = require('fs');
let files = fs.readdirSync('/assets/photos/');

pickDefaultPhoto();
function pickDefaultPhoto(){
    let file_png = new Image();
    let file_jpg = new Image();
    let file_jpeg = new Image();
    let file_svg = new Image();
     file_png.src =  "default_img.png";
     file_jpg.src =  "default_img.jpg";
     file_jpeg.src =  "default_img.jpeg";
     file_svg.src =  "default_img.svg";
     //default_img = file_png;
    file_jpg.onload = function (){
        default_img = this;
    };
    file_png.onload = function (){
        default_img = this;
    };
    file_jpeg.onload = function (){
        default_img = this;
    };
    file_svg.onload = function (){
        default_img = this;
    };
}
function changeColor(element){
    draw_color = element.style.background;
}

let executeDoubleHistory  = false;
function start(event){
        is_drawing = true;
        fromX = positionX;
        fromY = positionY;
        if(is_arrow){
            executeDoubleHistory = true;
        }
       
        if(event.type == "mousedown"){
            touched_canvas = true;
           
        }
        context.beginPath();
        context.moveTo(positionX,positionY);
    
    event.preventDefault();
}

function  draw(event){
     positionX = event.clientX - canvas.offsetLeft;
     positionY = event.clientY - canvas.offsetTop;
    
    if(is_arrow && fromY != positionY && fromX != positionX && fromX != 0 && fromY != 0){
        if(boolSelectLayer){
            addChangesToHistory()
        }
        
        addChangesToHistory();
        
        if(event.type != 'mouseup' ){
            removeLast();
        }
        drawArrow(context,fromX,fromY,positionX,positionY,draw_width,draw_color);
    }
     
    if(is_drawing){
        if(!is_symbol && !is_arrow){
            context.lineTo(positionX,positionY);
            context.lineCap = "round";
            context.lineJoin = "round";
        }
        
        context.strokeStyle = draw_color;
        context.lineWidth = draw_width;
        context.stroke();
    }
    event.preventDefault();
}

function stop(event){
    if(is_arrow && fromX != 0 && fromY != 0){
        let a = 20;
        if(fromY != positionY && fromX != positionX){
            drawArrow(context,fromX,fromY,positionX,positionY,draw_width,draw_color);
            let userText = prompt('Sign the arrow',"");
            
            if(userText == null){
                userText = "";
            }
            
            context.font = ` bold 15px arial`
            context.fillStyle = draw_color;
            let a = userText.length*8 + parseInt(draw_width);
            
            if(positionX< userText.length*8 + parseInt(draw_width)){
                if(fromY < positionY){
                    if(positionY <= fromY + parseInt(draw_width) ){
                        context.fillText(userText, Math.round(positionX + parseInt(draw_width) +10)  ,positionY + parseInt(draw_width)*2);
                    }else {
                        context.fillText(userText, Math.round(positionX + parseInt(draw_width) +10)  ,positionY + parseInt(draw_width));
                    }
                }else {
                    context.fillText(userText, Math.round(positionX + parseInt(draw_width))  ,positionY - parseInt(draw_width));
                }
            }
            else if (fromX < positionX && fromY < positionY) {
                if(canvas.width - positionX < userText.length*8 + parseInt(draw_width)){
                    if(fromY >= positionY  && fromY < positionY + parseInt(draw_width) ){
                        context.fillText(userText, Math.round(positionX  - userText.length*8 - parseInt(draw_width))  ,positionY );
                    }else {
                        context.fillText(userText, Math.round(positionX  - userText.length*8 - parseInt(draw_width))  ,positionY + parseInt(draw_width));
                    }
                }else {
                    context.fillText(userText, Math.round(positionX + parseInt(draw_width))  ,positionY + parseInt(draw_width));
                }
            }
            else {
                context.fillText(userText, (positionX - userText.length*8 - parseInt(draw_width) ) ,positionY - parseInt(draw_width));
            }
        }
    }
    
    if(is_symbol && event.type != "mouseout"){
        if(is_square){
            context.font = `${Math.round( draw_width * 3 * 2)}px arial`
        }else {
            context.font = `${Math.round( draw_width * 3)}px arial`
        }
        context.fillStyle = draw_color;
        context.fillText(print_symbol, (positionX- parseInt(draw_width)),(positionY+parseInt(draw_width)));
        addChangesToHistory();
    }
   
    if(is_drawing){
         context.stroke();
         context.closePath();
         is_drawing = false;
         
        if( touched_canvas == true && fromX != positionX && fromY != positionY){
            addChangesToHistory();
            touched_canvas = false;
        }
     }
    fromX = 0;
    fromY = 0;
    event.preventDefault();
}

function removeLast(){
    
    if(index <= 0){
        clearCanvas();
    } else {
        let del_element = document.getElementById(`Layer_${restore_array.length}`)
        if(del_element != null){
            del_element.remove();
        }

        index -= 1;
        restore_array.pop();
        context.putImageData(restore_array[index], 0, 0);
      
    }
}
function undoLast(){
        if(temporaryIdHistoryLayer != null){
            let selectedLayer = temporaryIdHistoryLayer;
            let idNum = parseInt(selectedLayer.substring(6, selectedLayer.length));

            let  goToItem = document.getElementById(`Layer_${idNum - 1}`);
            if(goToItem != null){
                selectLayer(goToItem);
                goToItem.scrollIntoView();
            }

        }
}

function redoLast(){
    if(temporaryIdHistoryLayer != null){
        let selectedLayer = temporaryIdHistoryLayer;
        let idNum = parseInt(selectedLayer.substring(6, selectedLayer.length));
        if( idNum != restore_array.length ){
            let  goToItem = document.getElementById(`Layer_${idNum + 1}`);
            if(goToItem != null){
                selectLayer(goToItem);
                goToItem.scrollIntoView();
            }
        }
    }
}
function setDefaultImg(){
    setAdaptiveImage(default_img);
    //context.drawImage(default_img, 0,0);  //must have width and height like in canvas
    addChangesToHistory();
}
function selectFile(input) {
    let img = new Image();
    let reader = new FileReader();
    let file = input.files[0];

    reader.onload = function(x){
        img.src = x.target.result;
        setTimeout(addChangesToHistory, 100);
        input.value = '';
    }

    img.onload = function(){
        setAdaptiveImage(img)
    }
    reader.readAsDataURL(file);
}
function setAdaptiveImage(img){
    let imgHeight = img.height;
    let imgWidth = img.width;
    let marginX = 0;
    let marginY = 0;
    if(imgHeight >= imgWidth){
        imgWidth = Math.round((img.width * canvas.height) / imgHeight);
        imgHeight = canvas.height;
        marginX = Math.round((canvas.width - imgWidth) / 2);
    }else {
        imgHeight = Math.round((img.height * canvas.width) / imgWidth);
        imgWidth = canvas.width;
        marginY = Math.round((canvas.height - imgHeight) / 2);
    }

    context.drawImage(img, marginX,marginY, imgWidth,imgHeight);
}

function selectLayer(element){
    boolSelectLayer = true;
    
    setStyleForCurrentLayer(element)
    let canvas_id = element.id;
    
    let id = parseInt(canvas_id.substring(6, canvas_id.length));
    context.putImageData(restore_array[id - 1], 0, 0);

}

function setStyleForCurrentLayer(element){
   
    if(temporaryIdHistoryLayer != element.id && temporaryIdHistoryLayer != null){
        let removeStyleElement = document.getElementById(temporaryIdHistoryLayer);
        removeStyleElement.style.borderStyle = "hidden";
        removeStyleElement.style.transform = "none";
    }

    element.style.border = "3px solid #e238f1";
    temporaryIdHistoryLayer =element.id;
};

function setStyleButton(element){
    if(temporaryIdButton != element.id ){
        let removeStyleElement = document.getElementById(temporaryIdButton);
        removeStyleElement.style.border = "1px solid white";
    }
    element.style.border = "3px solid #47E6BE";
    temporaryIdButton = element.id;
}

function addChangesToHistory(){
    let history_container = document.getElementsByClassName('history_changes')[0];
   
    let img_layer = document.createElement('img');
    img_layer.height = 100;
    img_layer.width = 100;
    img_layer.className = 'layer';
    img_layer.id = `Layer_${restore_array.length + 1}`;
    img_layer.onclick = function (img_layer) { selectLayer(img_layer.target);}
    img_layer.src = canvas.toDataURL();
    img_layer.tabIndex = "0";

    history_container.appendChild(img_layer);
    history_container.scrollTop = history_container.scrollHeight;
    setStyleForCurrentLayer(img_layer);
    
    let current_layer = context.getImageData(0,0 , canvas.width, canvas.height);
    
    restore_array.push(current_layer);
    index += 1;
    
    boolSelectLayer  = false;
}
function onSymbol(symbol){
     is_symbol = true;
     is_square = false;
     is_arrow = false;
     print_symbol = symbol.innerText;
     setStyleButton(symbol);
}

function onSymbolSquare(symbol){
    is_symbol = true;
    is_square = true;
    is_arrow = false;
    print_symbol = symbol.value;
    setStyleButton(symbol);
}
function onPen(element){
     is_symbol = false;
     is_square =false;
     is_arrow = false;
    setStyleButton(element);
     
}
function onArrow(element){
    fromX = 0;
    fromY = 0;
    is_arrow = true;
    is_symbol = false;
    is_square = false;
    setStyleButton(element);
}

function save(){
    let data = canvas.toDataURL("imag/png")
    let a = document.createElement("a")
    a.href = data
    a.download = "sketch.png"
    a.click()
}
function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color){
    var headlen = 10;
    var angle = Math.atan2(toy-fromy,tox-fromx);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";

    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineWidth = arrowWidth;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
        toy-headlen*Math.sin(angle-Math.PI/7));

    ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),
        toy-headlen*Math.sin(angle+Math.PI/7));

    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
        toy-headlen*Math.sin(angle-Math.PI/7));

    ctx.stroke();
    ctx.restore();
   
}

