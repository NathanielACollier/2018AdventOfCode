

import * as fs from "fs";


async function main(){
    let data = await readInput();
    console.log(data);
}

async function readInput(){
    return new Promise((res,rej)=>{
        fs.readFile("./dec_1_1/input.txt", (err, data)=> {
            let text = data.toString();
            res(text);
        });
    });
}

main();

