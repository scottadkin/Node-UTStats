class SGraph{


    constructor(parent, sideText, bottomText, width, bgColor, data, title){


        this.parent = document.getElementById(parent);

        this.width = width;
        this.height = width * 0.5625;
        this.bgColor = bgColor;
        this.data = data;
        this.title = title;

        this.bottomText = bottomText;
        this.sideText = sideText;

        this.createCanvas();

        //this.graphX = 
        this.graphHeight = this.y(80);
        this.graphWidth = this.x(75);
        
        this.max = 0;

        if(arguments.length == 8){
            this.max = arguments[7];
        }

        this.createColors();

        this.setRange();

        this.render();
        this.main();

    }


    createColors(){

        this.colors = [
            "red",
            "green",
            "pink",
            "yellow",
            "orange",
            "blue",
            "white",
            "black"
        ];
    }

    resizeCanvas(){


       // console.log(this.parent.getBoundingClientRect());

        const bounds = this.parent.getBoundingClientRect();


        this.canvas.width = bounds.width * 0.8;
        this.canvas.height = this.canvas.width * 0.5625;

        this.graphHeight = this.y(80);
        this.graphWidth = this.x(75);
    }

    main(){


        setInterval(() =>{
            this.resizeCanvas();
            this.render();
        },66);
    }

    setRange(){

        //this.max = 0;
       // this.min = 0;

        this.mostData = 0;

        for(let i = 0; i < this.data.length; i++){

            for(let d = 0; d < this.data[i].data.length; d++){

                if(i === 0 && d === 0){
                    if(this.max === 0){
                        this.max = this.data[i].data[d];
                    }
                   // this.min = this.data[i].data[d];
                }

                if(this.data[i].data[d] > this.max){
                    this.max = this.data[i].data[d];
                }

               // if(this.data[i].data[d] < this.min){
               //     this.min = this.data[i].data[d];
              // }

                if(d > this.mostData){
                    this.mostData = d;
                }
            }
        }

        console.log("min = "+this.min)
        console.log("max = "+this.max)

        this.range = this.max - this.min;

        console.log("range = "+this.range);
    }

    x(input){

        return (this.canvas.width / 100) * input;
    }


    y(input){

        return (this.canvas.height / 100) * input;
    }

    createCanvas(){

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.context = this.canvas.getContext("2d");

        this.parent.appendChild(this.canvas);
    }



    drawBackground(){

        const c = this.context;

        const pat = c.createLinearGradient(0, 0, this.x(0), this.y(100));

        pat.addColorStop(0,"rgb(32,32,32)");
        pat.addColorStop(0.5,"rgb(64,64,64)");
        pat.addColorStop(1,"rgb(32,32,32)");

        c.fillStyle = pat;

        c.fillRect(0, 0, this.x(100), this.y(100));

    }

    drawGraph(){

        const c = this.context;
        c.textBasline = "top";


        


        this.drawBackground();

        const titleFont = this.y(3.5)+"px arial";
        c.textAlign = "center";
        c.fillStyle = "white";
        c.font = titleFont;
        c.fillText(this.title, this.x(50), this.y(6));

        c.textAlign = "left";

        c.fillStyle = "rgba(0,0,0,0.25)";
        c.strokeStyle = "rgba(255,255,255,0.25)";
        c.lineWidth = this.y(0.105);

        this.graphX = this.x(24);
        this.graphY = this.y(10);

        c.fillRect(this.graphX, this.graphY, this.graphWidth, this.graphHeight);
        c.strokeRect(this.graphX, this.graphY, this.graphWidth, this.graphHeight);


        c.save();

        c.fillStyle = "white";
        c.textAlign = "center";
        c.translate(this.x(17),this.y(50));
        c.rotate(Math.PI * 1.5);
        c.fillText(this.sideText, 0 ,0);
        c.restore();
    

       // let currentBox = 0;

        this.boxHeight = this.graphHeight * 0.2;

        c.lineWidth = this.y(0.25);
        c.strokeStyle = "rgba(255,255,255,0.1)";

        let currentY = 0;

        c.font = this.y(2.25)+"px arial";
        
        c.textAlign = "right";

        const valueOffset = this.max * 0.2;

        for(let i = 0; i <= 5; i++){

            currentY = this.graphY + (i * this.boxHeight);

            c.fillStyle = "rgba(0,0,0,0.25)";

            if(i % 2 == 0){
                c.fillRect(this.graphX, currentY,this.graphWidth, this.boxHeight);
            }

            c.fillStyle = "white";
            c.fillText((this.max - (valueOffset * i)).toFixed(2), this.graphX - this.x(1.25), currentY);
            c.beginPath();
            c.moveTo(this.graphX - this.x(1.25), currentY);
            c.lineTo(this.graphX, currentY);
            c.stroke();
            c.closePath();
        }


        const dataOffset = this.graphWidth / this.mostData;

        this.dataGap = dataOffset;

        console.log(this.mostData);
        let currentX = 0;



        c.font = this.y(2.25)+"px arial";

        c.textAlign = "center";
        c.fillText(this.bottomText, this.graphX + (this.graphWidth / 2), this.y(96));
        c.textAlign = "left";

      //  c.strokeStyle = "white";

       

        for(let i = -1; i < this.mostData; i++){

            currentX = this.graphX + (dataOffset * (i + 1));

            c.beginPath();
            c.moveTo(currentX, this.graphY + this.graphHeight);
            c.lineTo(currentX, this.graphY + this.graphHeight + this.y(1));
            c.stroke();
            c.closePath();

        }
    }


    drawKeys(){

        const c = this.context;

        const width = this.x(1);
        const height = this.y(2);


        const startX = this.x(2.5);
        const startY = this.y(50);
        const rowHeight = this.y(5);

        const textOffset = this.x(4);


        c.strokeStyle = "rgba(0,0,0,0.25)";
        c.lineWidth = this.y(0.21);


        c.font = this.y(2.4)+"px arial";

        let currentY = 0;

        c.textBaseline = "top";
        c.textAlign = "left";

        for(let i = 0; i < this.data.length; i++){

            currentY = startY + (rowHeight * i);

            c.fillStyle = this.colors[i];
            c.fillRect(startX, currentY, width, height);
            c.strokeRect(startX, currentY, width, height);

            c.fillStyle = "white";
            c.fillText(this.data[i].name, textOffset, currentY);
        }

    }

    plotData(){

        const c = this.context;

        c.lineWidth = this.y(0.175);

        c.strokeStyle = "pink";

        

        let currentX = 0;
        let previousX = 0;

        const startY = this.graphY + this.graphHeight;

        let dataBit = 0;

        if(this.max != 0){
            dataBit = this.graphHeight / this.max;
        }

        for(let i = 0; i < this.data.length; i++){

            c.strokeStyle = this.colors[i];

            for(let d = 0; d < this.data[i].data.length; d++){
                
                previousX = this.graphX + (this.dataGap * d);
                
                if(d == 0){
                    previousX = this.graphX;
                }

                currentX = this.graphX + (this.dataGap * (d + 1));

                c.beginPath();
                c.moveTo(previousX, startY - (dataBit * this.data[i].data[d]) );
                c.lineTo(currentX, startY - (dataBit * this.data[i].data[d+1]));
                c.stroke();
                c.closePath();
            }
        }
    }

    render(){


        this.drawGraph();
        this.drawKeys();

        this.plotData();
    }
}