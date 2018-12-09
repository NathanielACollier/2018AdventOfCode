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

    // from: https://stackoverflow.com/questions/36947847/how-to-generate-range-of-numbers-from-0-to-n-in-es2015-only
    export function range (start: number, end: number) { return [...Array(1+end-start).keys()].map(v => start+v) }


    export function distinct(items: Array<any>): Array<any>{
        // https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
        return [...new Set(items)];
    }

}