


class SGraph{

    constructor(parent, width, bg, title, data, yAxisLabel, xAxisLabel, postFix, maxValue){

        this.parent = document.getElementById(parent);
        this.ns = "http://www.w3.org/2000/svg";
        this.width = width;
        this.height = 0;
        this.bg = bg;
        this.title = title;

        this.maxValue = 0;
        this.minValue = 0;
        this.maxData = 0;
        this.valueOffset = 0;

        this.maxDecimalsPlaces = 3;

        this.lastUpdate = 0;

        this.data = data;

        this.colors = [
            "red",
            "rgb(0,168,255)",
            "rgb(60,255,60)",
            "yellow",
            "orange",
            "pink",
            "white",
            "rgb(150,150,150)"
        ];


        this.postFix = postFix;
        this.yAxisLabel = yAxisLabel;
        this.xAxisLabel = xAxisLabel;

        this.mouseOverId = "svg-sgraph-mouse-over";

        this.mouseOverTitleId = "svg-sgraphs-mouse-over-title";

        this.mouseOverContentId = "svg-sgraphs-mouse-over-content";

        this.gridStartX = 15;
        this.gridStartY = 75;

        this.graphWidth = 84;
        this.graphHeight = 60;


        this.bDisplayMouseOver = false;

        

        
        this.getSGraphCount();

       // this.maxValue = maxValue;

        this.inputMaxValue = maxValue;

        this.setMaxValue();

        this.createSVG();

        this.drawGraph();

        //this.drawMouseOver();

        //if(this.graphId == 0){
            this.createMouseOver();
       // }

        this.addEvents();

        //this.appendStyles();
        
    }


    createMouseOver(){

        if(this.graphId == 0){
            const elem = document.createElement("div");

            //elem.className = "svg-sgraph-mouse-over";

            elem.id = this.mouseOverId;

            this.mouseOver = elem;

        // this.parent.appendChild(elem);
            
            //const elems = document.getElementsByTagName("div");
            //const last = elems[elems.length - 1]; 
            document.body.appendChild(elem);

            //title elem

            const title = document.createElement("div");
            title.id = this.mouseOverTitleId;

            title.innerHTML = "title";

            this.mouseOverTitle = title;

            elem.appendChild(title);

            //content elem

            const content = document.createElement("div");

            content.id = this.mouseOverContentId;

            this.mouseOverContent = content;

            elem.appendChild(content);
        }else{

            this.mouseOver = document.getElementById(this.mouseOverId);
            this.mouseOverTitle = document.getElementById(this.mouseOverTitleId);
            this.mouseOverContent = document.getElementById(this.mouseOverContentId);
        }
    }

    getSGraphCount(){

        const elems = document.getElementsByClassName("s-graphs");

        this.graphId = elems.length;
    }


    hideMouseOver(){

        //console.log("trest");
        const elem = document.getElementById(this.mouseOverId);

        //console.log(elem);

        elem.setAttribute("y",-999);
        elem.setAttribute("x",-999);
    }

    addEvents(){

       // this.elem.addEventListener("mouseout", () =>{
         //   this.hideMouseOver();
       // });
    }

    x(input){
        return (this.width / 100) * input;
    }

    y(input){
        return (this.height / 100) * input;
    }


    updateMouseOver(e, x, y, title, text){

        const parentBounds = this.elem.getBoundingClientRect();

       // console.log(parentBounds);
        this.mouseOverTitle.innerHTML = title;
        this.mouseOverContent.innerHTML = this.removeDecimals(text)+this.postFix;



        //console.log(parentBounds);
        this.mouseOver.style.cssText = `margin-left:${e.clientX}px;margin-top:${e.clientY + 25}px;`;

        
    }

    createSVG(){

        this.elem = document.createElementNS(this.ns,"svg");

        this.elem.id = "s-graphs-"+this.graphId;

        const parentBounds = this.parent.getBoundingClientRect();

        this.width = parentBounds.width * this.width;
        this.height = this.width * 0.5625;
        //this.mouseOverId = "s-graphs-mouseover-"+this.graphId;

        this.elem.setAttribute("class","s-graphs");

        if(this.width == this.width){
            this.elem.setAttribute("width", this.width);
        }
        if(this.height == this.height){
            this.elem.setAttribute("height", this.height);
        }

        this.parent.appendChild(this.elem);

        
    }

    drawRect(x, y, width, height, style){

        //x = this.x(x);
       // y = this.x(y);
       // width = this.x(width);
        //height = this.y(height);

        const elem = document.createElementNS(this.ns, "rect");

        if(x == x){
            elem.setAttribute("x", x);
        }
        if(y == y){
            elem.setAttribute("y", y);
        }
        if(width == width){
            elem.setAttribute("width", width);
        }
        if(height == height){
            elem.setAttribute("height", height);
        }

        elem.setAttribute("style", style);
        

        this.elem.appendChild(elem);

        if(arguments.length == 5){
            //this.elem.appendChild(elem);
            //return elem;
        }else{
            elem.setAttribute("id", arguments[5]);
            elem.setAttribute("class", "s-graphs-mouse-over");
        }

    }

    drawText(x, y, text, style){

        const elem = document.createElementNS(this.ns, "text");

       // x = this.x(x);
       // y = this.y(y);

        if(x == x){
            elem.setAttribute("x",x);
        }
        if(y == y){
            elem.setAttribute("y",y);
        }
        elem.setAttribute("style",style);
        
        elem.innerHTML = text;

        this.elem.appendChild(elem);
    }

    drawCircle(x, y, size, color, bMouseOverElem){

        if(x != x || y != y){
            return;
        }

        const elem = document.createElementNS(this.ns, "circle");

        elem.setAttribute("cx", x);
        elem.setAttribute("cy", y);
        elem.setAttribute("r", size);
        elem.setAttribute("fill", color);


        

        /*if(bMouseOverElem){

            elem.addEventListener("mouseover", (e) =>{
               // console.log(x,y);

                this.updateMouseOver(e,x,y,"title","text");
            });
        }*/

        this.elem.appendChild(elem);

        //<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
    }

    removeDecimals(value){

        if(value != value){
            return value;
        }

        
        if(typeof value == "string"){
            return value;
        }

        const offset = value % 1;
        //console.log("offset = "+offset);

        if(offset != 0){
            return value.toFixed(this.maxDecimalsPlaces);
        }

        return value;
    }

    drawAxes(){

        let elem = document.createElementNS(this.ns, "path");

        const valueOffset = this.y(this.graphHeight) / 4;
        const dataOffset = this.x(this.graphWidth) / this.maxData;

        if(valueOffset != valueOffset){
            console.trace("Warning: valueOffset is NaN, skipping drawAxes!");
            return;
        }

        const barWidth = this.x(1);
        const barHeight = this.y(2);

        const textOffsetX = this.x(13);
        const fontSize = 3;

        elem.setAttribute("d",`
        m ${this.x(this.gridStartX)} ${this.y(this.gridStartY) - this.y(this.graphHeight)} 
        l 0 ${this.y(this.graphHeight)}
        m 0 0
        l ${this.x(this.graphWidth)} 0

        m -${this.x(this.graphWidth)} 0
        l -${barWidth} 0  

        m  0 -${valueOffset}
        l   ${barWidth} 0  

        m  0 -${valueOffset}
        l -${barWidth} 0  

        m 0 -${valueOffset}
        l ${barWidth} 0  

        m 0 -${valueOffset}
        l -${barWidth} 0  
        
        z
        `);

        this.drawText(textOffsetX, this.y(15 + (fontSize / 2)), this.removeDecimals(this.maxValue),"fill:yellow;font-family:arial;text-anchor:end;font-size:"+this.y(fontSize)+"px;");
        this.drawText(textOffsetX, this.y(30 + (fontSize / 2)), this.removeDecimals(this.minValue + (this.valueOffset * 3)),"fill:yellow;font-family:arial;text-anchor:end;font-size:"+this.y(fontSize)+"px;");
        this.drawText(textOffsetX, this.y(45 + (fontSize / 2)), this.removeDecimals(this.minValue + (this.valueOffset * 2)),"fill:yellow;font-family:arial;text-anchor:end;font-size:"+this.y(fontSize)+"px;");
        this.drawText(textOffsetX, this.y(60 + (fontSize / 2)), this.removeDecimals(this.minValue + this.valueOffset),"fill:yellow;font-family:arial;text-anchor:end;font-size:"+this.y(fontSize)+"px;");
        this.drawText(textOffsetX, this.y(75 + (fontSize / 2)), this.removeDecimals(this.minValue),"fill:yellow;font-family:arial;text-anchor:end;font-size:"+this.y(fontSize)+"px;");

        elem.setAttribute("style","stroke:rgba(255,255,255,0.9);stroke-width:"+this.y(0.25)+"px;");

        this.elem.appendChild(elem);

        elem = document.createElementNS(this.ns, "path");

        elem.setAttribute("style","stroke:rgba(255,255,255,0.9);stroke-width:"+this.y(0.35)+"px;");

        /*let string = `m 0 0  
        l 0 ${barHeight} 
        m 0 -${barHeight} `;

        for(let i = 0; i < this.maxData; i++){

            string += `m ${dataOffset} 0  
                       l 0 ${barHeight} 
                       m 0 -${barHeight} `;
        }

        elem.setAttribute("d", `
        m ${this.x(this.gridStartX)} ${this.y(this.gridStartY)} 
        
        ${string}
        z
        `);


        this.elem.appendChild(elem);*/

        
    }


    drawLine(sx, sy, ex, ey, width, color){

        if(ex != ex || ey != ey || sx != sx || sy != sy){
            return null;
        }
        const elem = document.createElementNS(this.ns, "path");

        elem.setAttribute("style", "stroke:"+color+";stroke-width:"+width+"px;");

        
        elem.setAttribute("d", `
        m ${sx} ${sy}
        l ${ex} ${ey}
        
        z
        `);

        this.elem.appendChild(elem);

        return elem;
    }

    plotData(){

        const dotSize = this.y(1);


        const dataOffset = this.graphWidth / (this.maxData - 1);

        const dataBit = this.graphHeight / this.totalValueOffset;

       // console.log("totalValueOffset = "+this.totalValueOffset);

        const startX = this.gridStartX;
        const startY = this.gridStartY;

        let yOffset = 0;

        if(this.minValue < 0){

            yOffset = Math.abs(this.minValue);
        }

        let currentData = 0;
        let nextData = 0;

        let x = 0;
        let y = 0;

        let nextX = 0;
        let nextY = 0;

        let currentElem = 0;

        const lineWidth = this.x(0.15);

        for(let z = 0; z < this.data.length; z++){

        
            for(let i = 0; i < this.maxData; i++){


                if(this.data[z].data == undefined){
                    break;
                }
                
                if(i >= this.data[z].data.length -1){
                    break;
                }

                

                //console.log(i);
                currentData = startY - (dataBit * (this.data[z].data[i] + yOffset));
                nextData = startY - (dataBit * (this.data[z].data[i+1] + yOffset));

                x = this.x(startX + (dataOffset * (i)));
                y = this.y(currentData) + (dotSize / 2) - lineWidth - lineWidth;

                nextX = this.x(startX + (dataOffset * (i + 1))) ;
                nextY = this.y(nextData) + (dotSize / 2) - lineWidth - lineWidth;

                

                if(i < this.maxData - 1){

                   // (() =>{
                       //console.log(x);

                        if(x > 30){
                            this.drawCircle(x, y, this.x(0.15), this.colors[z], true);
                        }
                        const cx = x;
                        const cy = y;

                        //console.log(cx+" , "+cy);


                        currentElem = this.drawLine(cx, cy, nextX - cx, nextY - cy, lineWidth, this.colors[z]);

                        if(currentElem != null){
                            currentElem.addEventListener("mousemove", (e) =>{

                                //this.updateMouseOver(cx,cy, "title", "text");

                                this.updateMouseOver(e, cx, cy, this.data[z].name+' (data point '+(i+1)+')', this.data[z].data[i+1]);
                            });

                            currentElem.addEventListener("mouseout", () =>{

                                this.hideMouseOver();
                            });
                        }

                   // })();
                    
                }

                //this.drawRect(this.x(startX + (dataOffset * (i + 1))) - (dotSize / 2), this.y(currentData) - (dotSize / 2), dotSize, dotSize, "fill:red");

            }
        }
    }

    drawKeys(){


        const startY = this.y(85);
        const startX = this.x(5);
        const startX2 = this.x(45);

        const rowHeight = this.y(3.7);


        let x = 0;
        let y = 0;

        const boxSize = this.x(1.6);

        for(let i = 0; i < this.data.length; i++){


            x = startX;

            if(i > 3){
                x = startX2;
            }
            
            y = startY + (rowHeight * (i % 4));


            this.drawRect(x, y, boxSize, boxSize, "fill:"+this.colors[i]+";stroke-width:"+this.y(0.25)+";stroke:black;");
            this.drawText(x + (boxSize * 1.2), y + (rowHeight * 0.7), this.data[i].name, "fill:white;text-anchor:top;font-size:"+this.y(3.2)+"px;");

        }
    }

    drawGraph(){

        this.drawRect(0, 0, this.x(100), this.y(100), "fill:"+this.bg);

        const quarter = 15;

        this.drawRect(this.x(this.gridStartX), this.y(15), this.x(this.graphWidth), this.y(60), "fill:rgb(12,12,12);stroke-width:1px;stroke:rgb(0,0,0);");


        this.drawRect(this.x(this.gridStartX), this.y(15), this.x(this.graphWidth), this.y(quarter), "fill:rgba(0,0,0,0.75);");

        this.drawRect(this.x(this.gridStartX), this.y(15 + (quarter * 2 )), this.x(this.graphWidth), this.y(quarter), "fill:rgba(0,0,0,0.75);");


        this.drawText(this.x(50),this.y(9),this.title,"fill:yellow;font-family:arial;text-anchor:middle;font-size:"+this.y(4.6)+"px;");

        this.drawAxes();

        this.plotData();

        this.drawKeys();

        this.drawText(-this.y(50), this.y(7.5), this.yAxisLabel, "fill:white;transform:rotate(-90deg);text-anchor:middle;font-size:"+this.y(3)+"px;");
        this.drawText(this.x(50), this.y(80), this.xAxisLabel, "fill:white;text-anchor:middle;font-size:"+this.y(3)+"px;");


    }

    setMaxValue(){


        //const inputMaxRange = this.maxRange;
        

        let d = 0;

        let currentData = 0;

        this.maxData = -1;

        for(let i = 0; i < this.data.length; i++){

            if(i != 0){

                if(currentData > this.maxData){
                    this.maxData = currentData;
                }
            }

            currentData = 0;

            if(this.data[i].data != undefined){
                for(let x = 0; x < this.data[i].data.length; x++){

                    currentData++;

                    d = this.data[i].data[x];

                    if(i == 0 && x == 0){

                        this.maxValue = d;
                        this.minValue = d;

                    }else if(d > this.maxValue){

                        this.maxValue = d;

                    }else if(d < this.minValue){

                        this.minValue = d;

                    }
                }
            }else{
                continue;
            }
        }

        if(currentData > this.maxData){
            this.maxData = currentData;
        }

        if(this.maxData < 1){
            this.maxData = 1;
        }

        if(this.minValue > 0){
            this.minValue = 0;
        }


        if(this.inputMaxValue != null){

            this.maxValue = this.inputMaxValue;
            //this.minValue = 0;
            //return;
        }

        const offset = this.maxValue - this.minValue;

        this.totalValueOffset = offset;

        this.valueOffset = offset * 0.25;
    }
}



function createData(amount, start, range){

    let value = 50;

    const data = [];

    for(let i = 0; i < amount; i++){

        value = start + (-range  + (Math.random() * (range * 2 )));

        data.push(value);
    }

    return data;

}




