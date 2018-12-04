import * as fs from "fs";
import * as path from "path";

export namespace utility{

    export async function readInput(filePath:string){
        return new Promise<string[]>((res,rej)=>{
            fs.readFile(filePath, (err, data)=> {
                let text = data.toString();
                let entries = text.split("\n").filter((val)=>{
                    return val && val.length > 0;
                });
                res(entries);
            });
        });
    }


    export async function writeAllText(filePath: string, text: string): Promise<void>{
        return new Promise<void>((res,rej)=>{
            let dirPath = path.dirname(filePath);

            if( !fs.existsSync(dirPath)){
                fs.mkdirSync(dirPath);
            }

            // write out to file
            fs.writeFile(filePath, text,{flag: 'w+'}, (err)=>{
                if( err){
                    rej(err);
                }
                res();
            });
        });
    }

}