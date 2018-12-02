import { utility } from "../common/utility";
/*
--- Part Two ---
Confident that your list of box IDs is complete, you're ready to find the boxes full of prototype fabric.

The boxes will have IDs which differ by exactly one character at the same position in both strings. For example, given the following box IDs:

abcde
fghij
klmno
pqrst
fguij
axcye
wvxyz
The IDs abcde and axcye are close, but they differ by two characters (the second and fourth). However, the IDs fghij and fguij differ by exactly one character, the third (h and u). Those must be the correct boxes.

What letters are common between the two correct box IDs? (In the example above, this is found by removing the differing character from either ID, producing fgij.)
*/

interface WordDiff {
    pos: number;
    letterA: string;
    letterB: string;
}

async function main(){
    let entries = await utility.readInput("./dec_2_2/input.txt");
    
    for( let i = 0; i < entries.length; ++i ){
        let matchingEntry = entries.filter((val,index)=>{
            return index != i;
        }).map((val,index)=>{
            let diff = compareTwoEntries(entries[i],val);
            return diff;
        }).filter((val,index)=>{
            return val.length <= 1
        });

        if( matchingEntry.length > 0 ){
            let firstMatch = matchingEntry[0];
            console.log(`Index: ${i}, Matching entry found: ${JSON.stringify(matchingEntry)}`);

            // to get a string into a char array split on empty string
            //   see: https://stackoverflow.com/questions/4547609/how-do-you-get-a-string-to-a-character-array-in-javascript
            let matchingParts = entries[i].split('').filter((val, ind)=>{
                return firstMatch.filter((val)=>{
                    return val.pos == ind;
                }).length == 0;
            }).join("");
            console.log(`Matching parts word is: ${matchingParts}`);
        }
    }
}

function compareTwoEntries(a: string, b:string ): WordDiff[]{
    let result: WordDiff[] = [];

    for(let i =0; a.length >= b.length ? i < a.length : i < b.length; ++i ){
        if( a[i] !== b[i]){
            result.push({
                pos: i,
                letterA: a[i],
                letterB: b[i]
            });
        }
    }

    return result;
}


main();


