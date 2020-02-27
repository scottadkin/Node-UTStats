class SGraph{
    
    constructor(parent, width, bg, title, data, yAxisLabel, xAxisLabel, postFix, maxValue){

        this.parent = document.getElementById(parent);
        this.width = width;
        this.bg = bg;
        this.title = title;
        this.data = data;
        this.yAxisLabel = yAxisLabel;
        this.xAxisLabel = xAxisLabel;
        this.maxValue = maxValue;

        this.graphStartX = 20;
        this.graphStartY = 10;
        this.graphWidth = 78;
        this.graphHeight = 70;
        this.postFix = postFix;

        this.colors = [
            "red",
            "rgb(0,168,255)",
            "rgb(60,255,60)",
            "yellow",
            "orange",
            "pink",
            "white",
            "brown"
        ];

        this.mouseOverData = [];

        this.setMaxValue();

        this.createCanvas();
        this.drawGraph();
        this.plotData();
        this.drawKeys();

        console.log(data);
    }

    setMaxValue(){

        if(this.maxValue == undefined || this.maxValue == null){
            
            let bestValue = null;

            let d = 0;

            for(let i = 0; i < this.data.length; i++){

                d = this.data[i];

                for(let x = 0; x < d.data.length; x++){

                    if(d.data[x] > bestValue || bestValue == null){

                        bestValue = d.data[x];
                       // console.log("Best value is now : "+bestValue);
                    }
                }
            }

            this.maxValue = bestValue;
        }
    }

    x(input){
        return (this.canvas.width * 0.01) * input;
    }

    y(input){
        return (this.canvas.height * 0.01) * input;
    }

    createCanvas(){

        const elem = document.createElement("canvas");
        elem.className = "s-graph";

        const bounds = this.parent.getBoundingClientRect();


        this.canvas = elem;
        this.canvas.width = bounds.width * 0.75;

        if(this.canvas.width > 800){
            this.canvas.width = 800;
        }
        this.canvas.height = this.canvas.width * 0.46;
        this.c = this.canvas.getContext("2d");
        this.parent.appendChild(elem);
    }

    drawRect(x, y, width, height, color){

        const c = this.c;
        c.fillStyle = color;
        c.fillRect(this.x(x), this.y(y), this.x(width), this.y(height));

    }

    strokeRect(x, y, width, height, lineWidth, color){

        const c = this.c;
        c.strokeStyle = color;
        c.lineWidth = this.y(lineWidth);
        c.strokeRect(this.x(x), this.y(y), this.x(width), this.y(height));

    }

    fillText(x, y, align, color, fontSize, text){

        const c = this.c;

        c.fillStyle = color;

        c.textBasline = "top";

        c.textAlign = align;

        c.font = this.y(fontSize)+"px arial";

        c.fillText(text, this.x(x), this.y(y));
    }

    rotate(x, y, angle){

        const c = this.c;

        if(arguments.length == 0){
            c.restore();
        }

        c.save();

        c.translate(this.x(x), this.y(y));

       // c.translate(this.x(-width/2), this.y(-height/2));
        c.rotate(((Math.PI * 2)/ 360) * angle);

        
    }

    drawGraph(){


        const c = this.c;

        this.drawRect(0, 0, 100, 100, this.bg);

        this.drawRect(this.graphStartX, this.graphStartY, this.graphWidth, this.graphHeight, "rgba(0,0,0,0.5)");
        this.strokeRect(this.graphStartX, this.graphStartY, this.graphWidth, this.graphHeight, 0.25, "rgba(0,0,0,0.8)");

        for(let i = 0; i < 4; i+=2){

            this.drawRect(this.graphStartX, this.graphStartY + ((this.graphHeight * 0.25) * i), this.graphWidth, this.graphHeight * 0.25, "rgba(0,0,0,0.75)");

        }

        c.strokeStyle = "rgba(255,255,255,0.2)";

        for(let i = 0; i < 5; i++){

            //console.log(this.graphStartY + (this.graphHeight * 0.25) * i);
            this.fillText(this.graphStartX - 1.5, this.graphStartY + (this.graphHeight * 0.25) * i, "right", "white", 2.5, this.maxValue - ((this.maxValue * 0.25) * i));

            c.beginPath();
            c.moveTo(this.x(this.graphStartX), this.y(this.graphStartY) + this.y((this.graphHeight * 0.25) * i));
            c.lineTo(this.x(this.graphStartX) - this.x(1), this.y(this.graphStartY) + this.y((this.graphHeight * 0.25)) * i);
            c.stroke()
            c.closePath();
        }

        c.beginPath();
        //c.strokeStyle = "white";
        c.moveTo(this.x(this.graphStartX), this.y(this.graphStartY + this.graphHeight));
        c.lineTo(this.x(this.graphStartX + this.graphWidth), this.y(this.graphStartY + this.graphHeight));
        c.stroke()
        c.closePath();

        c.beginPath();
        c.moveTo(this.x(this.graphStartX), this.y(this.graphStartY + this.graphHeight));
        c.lineTo(this.x(this.graphStartX), this.y(this.graphStartY));
        c.stroke()
        c.closePath();


        this.fillText(50, 6, "center", "white", 4, this.title);


        this.rotate(12.5,50,270);
        this.fillText(0,0,"center", "yellow", 4, this.yAxisLabel);
        this.rotate();

        this.fillText(this.graphStartX + (this.graphWidth / 2), 87, "center", "yellow", 4, this.xAxisLabel);

    }

    drawKeys(){

        const c = this.c;

        const rowHeight = 4;

        const columnOffset2 = 25;
        //const boxSize = 3;

        const startY = 65;

        let currentX = 0;
        let currentY = 0;
        let rowOffset = 0;

        for(let i = 0; i < this.data.length; i++){


            //if(i < 4){
                currentX = 1;
                rowOffset = i;
           // }else{

               // currentX = 5 + columnOffset2;

               // rowOffset = i - 4;
            //}

            currentY = startY + (rowHeight * rowOffset);
            this.drawRect(currentX, currentY, 1.5, 2.3, this.colors[i]);
            this.strokeRect(currentX, currentY, 1.5, 2.3, 0.5, "rgba(255,255,255,0.1)");

            this.fillText(currentX + 2, currentY + 2, "left", "white", 3, this.data[i].name);

        }
    }

    plotData(){

        const c = this.c;

        let d = 0;

        const offsetX = this.graphWidth / (this.data[0].data.length - 1);
        const bit = this.graphHeight / this.maxValue;

        let x = 0;
        let nextX = 0;
        let y = 0;
        let nextY = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i].data;

            c.fillStyle = this.colors[i];
            c.strokeStyle = this.colors[i];
            c.lineWidth = this.y(0.25);

            for(let a = 0; a < d.length; a++){
          
                if(a < d.length - 1){

                    x = this.graphStartX + (offsetX * a);
                    nextX = this.graphStartX + (offsetX * (a + 1));
                    y = (this.graphStartY + this.graphHeight) - (bit * d[a]);
                    nextY = (this.graphStartY + this.graphHeight) - (bit * d[a + 1]);

                    //this.drawRect(x - 0.15, y - 0.3,0.3,0.6, this.colors[i]);

                    //this.mouseOverData.push({"x": x - 0.15, "y": y - 0.3, "width": 0.3, "height": 0.6, "text": this.data[i].name+" "+a+" "+this.postFix});


                    c.beginPath();
                    
                    c.moveTo(this.x(x), this.y(y));
                    c.lineTo(this.x(nextX), this.y(nextY));
                    c.stroke();
                    
                    c.closePath();
                }
            }
        }

        console.table(this.mouseOverData);
    }




}