import { utility } from "../common/utility";

/*

--- Part Two ---
Time to improve the polymer.

One of the unit types is causing problems; it's preventing the polymer from collapsing as much as it should. Your goal is to figure out which unit type is causing the most problems, remove all instances of it (regardless of polarity), fully react the remaining polymer, and measure its length.

For example, again using the polymer dabAcCaCBAcCcaDA from above:

Removing all A/a units produces dbcCCBcCcD. Fully reacting this polymer produces dbCBcD, which has length 6.
Removing all B/b units produces daAcCaCAcCcaDA. Fully reacting this polymer produces daCAcaDA, which has length 8.
Removing all C/c units produces dabAaBAaDA. Fully reacting this polymer produces daDA, which has length 4.
Removing all D/d units produces abAcCaCBAcCcaA. Fully reacting this polymer produces abCBAc, which has length 6.
In this example, removing all C/c units was best, producing the answer 4.

What is the length of the shortest polymer you can produce by removing all units of exactly one type and fully reacting the result?

*/

async function main(){
    let entries = await utility.readInput("./dec_5_2/input.txt");
    //let entries = ["dabAcCaCBAcCcaDA"];
    let formula = entries[0].split(''); // get all the characters individually
    let elements = utility.distinct(entries[0].toLowerCase().split(''));
    console.log(`Element Count: ${elements.length}`);

    formula = formulaWithElementOccuringMostRemoved(elements, formula);

    utility.writeAllText("./output/dec_5_1_formula.txt", formula.join(""));

    console.log(`Count: ${formula.length}`);
}


function formulaWithElementOccuringMostRemoved(elements: Array<string>, formula: Array<string>): Array<string>{
    let minFormula: Array<string> = undefined;

    for( let e of elements){
        let formulaWithoutE = formula.filter((val)=>{
            return val.toUpperCase() !== e.toUpperCase();
        });

        let reacted = reactAllElements(formulaWithoutE);

        if( !minFormula || reacted.length < minFormula.length){
            minFormula = reacted;
        }
    }
    return minFormula;
}


function reactAllElements(formula: Array<string>): Array<string>{
    let copy = JSON.parse(JSON.stringify(formula)); // make a copy of it
    for( let i = 0; i < copy.length-1; ++i ){
        
        // find the same letter with different case right next to each other
        //  if it's the same letter and same case, then that's fine
        if( copy[i].toUpperCase() == copy[i+1].toUpperCase() &&
            copy[i] != copy[i+1]
            ){

            copy.splice(i,2);

            /*
            go back a character because we've removed the one we are on, and it's neighbor so we need to go back over the character that slid into place
             since i gets incrimented, the way to go over this new character is to decrement i, then it will be the next position looked at
             but we need to consider the previous to where we where compared with the one that slid in so --2
             However if we removed at position 0, then there is no previous and we just incriment 1
             */
            i -= (i==0) ? 1 : 2;

        }
    }

    return copy;
}



main();