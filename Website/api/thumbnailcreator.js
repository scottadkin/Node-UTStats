
const fs = require('fs');
const Jimp = require('jimp');
const Promise = require('promise');

class ThumbnailCreator{

    constructor(dir, targetDir, quality, width, height){

        this.dir = dir;
        this.targetDir = targetDir;
        this.quality = quality;
        this.width = width;
        this.height = height;

        //this.filesToConvert = [];

        this.findFiles();
    }


    findFiles(){

        fs.readdir(this.dir, (err, files) =>{

            if(err) console.log(err);

            const validFiles = [];

            const reg = /^.+\..+$/i;


            for(let i = 0; i < files.length; i++){


                if(reg.test(files[i])){
                    validFiles.push(files[i]);
                }

            }

            this.files = validFiles;

            this.createThumbs();

        });
    }


    createThumbs(){


        let f = null;

        for(let i = 0; i < this.files.length; i++){

            f = this.files[i];

            Jimp.read(this.dir+this.files[i])
                .then(currentFile =>{
                    return currentFile
                    .resize(this.width, this.height)
                    .quality(this.quality)
                    .write(this.targetDir+this.files[i])
                });
        }
    }

    display(req){

        let string = "";

        for(let i = 0; i < this.files.length; i++){

            string += this.dir+this.files[i]+'<br>';
        }

        req.send(string);


    }


}


module.exports = ThumbnailCreator;