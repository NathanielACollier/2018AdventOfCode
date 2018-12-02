import * as fs from "fs";

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
}