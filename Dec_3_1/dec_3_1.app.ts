import { utility } from "../common/utility";

/*
--- Day 3: No Matter How You Slice It ---
The Elves managed to locate the chimney-squeeze prototype fabric for Santa's suit (thanks to someone who helpfully wrote its box IDs on the wall of the warehouse in the middle of the night). Unfortunately, anomalies are still affecting them - nobody can even agree on how to cut the fabric.

The whole piece of fabric they're working on is a very large square - at least 1000 inches on each side.

Each Elf has made a claim about which area of fabric would be ideal for Santa's suit. All claims have an ID and consist of a single rectangle with edges parallel to the edges of the fabric. Each claim's rectangle is defined as follows:

The number of inches between the left edge of the fabric and the left edge of the rectangle.
The number of inches between the top edge of the fabric and the top edge of the rectangle.
The width of the rectangle in inches.
The height of the rectangle in inches.
A claim like #123 @ 3,2: 5x4 means that claim ID 123 specifies a rectangle 3 inches from the left edge, 2 inches from the top edge, 5 inches wide, and 4 inches tall. Visually, it claims the square inches of fabric represented by # (and ignores the square inches of fabric represented by .) in the diagram below:

...........
...........
...#####...
...#####...
...#####...
...#####...
...........
...........
...........
The problem is that many of the claims overlap, causing two or more claims to cover part of the same areas. For example, consider the following claims:

#1 @ 1,3: 4x4
#2 @ 3,1: 4x4
#3 @ 5,5: 2x2
Visually, these claim the following areas:

........
...2222.
...2222.
.11XX22.
.11XX22.
.111133.
.111133.
........
The four square inches marked with X are claimed by both 1 and 2. (Claim 3, while adjacent to the others, does not overlap either of them.)

If the Elves all proceed with their own plans, none of them will have enough fabric. How many square inches of fabric are within two or more claims?

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
    let entries = await utility.readInput("./dec_3_1/input.txt");

    let fabrics = getFabrics(entries);

    let rectDim = getRectangleDimensions(fabrics);

    let rect = formBlankRectangle(rectDim);

    for( let f of fabrics){
        writeFabricToRectangle(f, rect);
    }

    await printRectangleToFile(rect );

    let squareCount = countSquaresWithTwoOrMore(rect);
    console.log(`Squares with Two or More: ${squareCount}`);
}

function countSquaresWithTwoOrMore(rec: Array<Array<string>>){
    let count = 0;

    for(let r = 0; r < rec.length; ++r ){
        let row = rec[r];
        for( let c = 0;  c < row.length; ++c ){
            let overlapCount: number = +row[c];
            if( overlapCount >= 2){
                count++;
            }
        }
    }
    return count;
}

function writeFabricToRectangle(fabric: FabricDef, rec: Array<Array<string>>){
    for( let r = fabric.fromTopEdige; r < fabric.height + fabric.fromTopEdige; ++r){
        for( let c = fabric.fromLeftEdge; c < fabric.width + fabric.fromLeftEdge; ++c){
            rec[r][c] = (+rec[r][c] + 1) + ""; // convert to number add 1, and convert back to string
        }
    }
}


async function printRectangleToFile( rect: Array<string[]>){
    let out = "";
    for(let row of rect){
        for(let col of row){
            out += col;
        }
        out += "\n";
    }

    await utility.writeAllText("./output/dec_3_1_rectangle.txt", out);
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