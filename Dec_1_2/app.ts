import { utility } from "../common/utility";

/*
--- Part Two ---
You notice that the device repeats the same frequency change list over and over. To calibrate the device, you need to find the first frequency it reaches twice.

For example, using the same list of changes above, the device would loop as follows:

Current frequency  0, change of +1; resulting frequency  1.
Current frequency  1, change of -2; resulting frequency -1.
Current frequency -1, change of +3; resulting frequency  2.
Current frequency  2, change of +1; resulting frequency  3.
(At this point, the device continues from the start of the list.)
Current frequency  3, change of +1; resulting frequency  4.
Current frequency  4, change of -2; resulting frequency  2, which has already been seen.
In this example, the first frequency reached twice is 2. Note that your device might need to repeat its list of frequency changes many times before a duplicate frequency is found, and that duplicates might be found while in the middle of processing the list.

Here are other examples:

+1, -1 first reaches 0 twice.
+3, +3, +4, -2, -4 first reaches 10 twice.
-6, +3, +8, +5, -6 first reaches 5 twice.
+7, +7, -2, -7, -4 first reaches 14 twice.
What is the first frequency your device reaches twice?

*/

async function main(){
    let freqMap: {[key: string]: number;} = {};
    let recordFreq = (freq:number)=>{
        if(!freqMap[freq]){
            freqMap[freq] = 0;
        }

        freqMap[freq]++
    };
    let entries = (await utility.readInput('./dec_1_2/input.txt')).map((val)=>{
        return +val;
    });
    let firstRepeated = undefined;
    let iterationCount = 0;
    let newFrequency = 0;
    while( !firstRepeated ){
        
        for(let i =0; i < entries.length; ++i){
            newFrequency = newFrequency + entries[i];
            recordFreq(newFrequency);
            if( freqMap[newFrequency] > 1){
                firstRepeated = newFrequency;
                break; // get out of loop we found the first repeated
            }
            // do we need to repeat through the list?
            if( i == entries.length){
                i = 0;
            }
        }
        console.log(`List Iteration: ${iterationCount++}`);
    }
    

    if( firstRepeated ){
        console.log(`First Repeated is: ${firstRepeated}`);
    }
}

main();

