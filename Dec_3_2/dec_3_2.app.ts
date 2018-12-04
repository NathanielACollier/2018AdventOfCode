import { utility } from "../common/utility";

/*
--- Part Two ---
Amidst the chaos, you notice that exactly one claim doesn't overlap by even a single square inch of fabric with any other claim. If you can somehow draw attention to it, maybe the Elves will be able to make Santa's suit after all!

For example, in the claims above, only claim 3 is intact after all claims are made.

What is the ID of the only claim that doesn't overlap?
*/


interface FabricDef{
    id: number;
    fromLeftEdge: number;
    fromTopEdige: number;
    width: number;
    height:number;
}

interface RectangleDefinition{
    width: number;
    height: number;
}

async function main(){
    let entries = await utility.readInput("./dec_3_2/input.txt");

    let fabrics = getFabrics(entries);

    let rectDim = getRectangleDimensions(fabrics);

    let rect = formBlankRectangle(rectDim);

    for( let f of fabrics){
        writeFabricToRectangle(f, rect);
    }

    await printRectangleToFile("./output/dec_3_2_rectangle.txt", rect );

    for( let f of fabrics){
        if( !doesFabricHaveAnyOverLap(f,rect)){
            console.log(`Fabric: ${f.id} has no overlap`);
        }
    }
}

function doesFabricHaveAnyOverLap(fabric: FabricDef, rec: Array<Array<string>>): boolean{
    for( let r = fabric.fromTopEdige; r < fabric.height + fabric.fromTopEdige; ++r){
        for( let c = fabric.fromLeftEdge; c < fabric.width + fabric.fromLeftEdge; ++c){
            let overlapCount = +rec[r][c];
            if( overlapCount > 1 ){
                return true;
            }
        }
    }

    return false; // never found an overlap
}

function writeFabricToRectangle(fabric: FabricDef, rec: Array<Array<string>>){
    for( let r = fabric.fromTopEdige; r < fabric.height + fabric.fromTopEdige; ++r){
        for( let c = fabric.fromLeftEdge; c < fabric.width + fabric.fromLeftEdge; ++c){
            rec[r][c] = (+rec[r][c] + 1) + ""; // convert to number add 1, and convert back to string
        }
    }
}


async function printRectangleToFile(filePath: string, rect: Array<string[]>){
    let out = "";
    for(let row of rect){
        for(let col of row){
            out += col;
        }
        out += "\n";
    }

    await utility.writeAllText(filePath, out);
}

function formBlankRectangle(dim: RectangleDefinition): Array<Array<string>>{
    let rect = new Array<Array<string>>(dim.height);
    for(let r = 0; r < dim.height; ++r){
        let row = new Array<string>(dim.width);
        for(let c = 0; c < dim.width; ++c){
            row[c] = "0";
        }
        rect[r] = row;
    }
    return rect;
}

function getFabrics(entries: string[]): FabricDef[]{
    return entries.map((val)=>{
        let fabircRegex = /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/;
        let [,id,left,top,width,height] = val.match(fabircRegex);

        return <FabricDef>{
            id: +id,
            fromLeftEdge: +left,
            fromTopEdige: +top,
            width: +width,
            height: +height
        };
    });
}


function getRectangleDimensions(fabrics: FabricDef[]): RectangleDefinition{
    return {
        height: fabrics.reduce((prev, curr)=> {
            let height = curr.fromTopEdige + curr.height;
            if( height > prev){
                return height
            }else {
                return prev;
            }
            
        },-1),
        width: fabrics.reduce((prev,cur)=>{
            let width = cur.fromLeftEdge+cur.width;
            if( width > prev){
                return width
            }else {
                return prev
            }
        },-1)
    }
}

main();