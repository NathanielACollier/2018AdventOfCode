import { utility } from "../common/utility";
import * as pad from "pad";

/*
--- Part Two ---
Strategy 2: Of all guards, which guard is most frequently asleep on the same minute?

In the example above, Guard #99 spent minute 45 asleep more than any other guard or minute - three times in total. (In all other cases, any guard spent any minute asleep at most twice.)

What is the ID of the guard you chose multiplied by the minute you chose? (In the above example, the answer would be 99 * 45 = 4455.)
*/

interface TimeRecordType{
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
}

interface GuardEventType{
    time: TimeRecordType;
    guardID: number;
    startShift: boolean;
    wakesUp: boolean;
    fallsAsleep: boolean;
}


interface Guard{
    ID: number;

    daysOnShift: Map<string,Day>;
}

interface Day{
    month: number;
    day: number;
    hours: Map<number,Hour>;
}

interface Hour{
    hour: number;
    minuteSleepStatus: string[];
}


interface GuardMaxSleep{
    ID: number;
    minutesAsleep: number;
    minuteWithMostAsleep: MinuteMostAsleep;
}


interface MinuteMostAsleep{
    minute: number;
    count: number;
}


async function main(){
    let entries = await utility.readInput("./dec_4_2/input.txt");

    let guardEvents = interpretEntries(entries);
    let guardSorted = sortGuardEvents(guardEvents);
    printInput("./output/dec_4_2_sorted_input.txt", guardSorted);
    let guardSleepData = populateGuardAsleepData(guardSorted);
    // map this out to a file
    mapGuardSleepingToFile("./output/dec_4_2_graph.txt", guardSleepData);


    let maxGuardAsleep = findGuardMaxAsleep(guardSleepData);

    console.log(`
    \n---- Max Sleep ----
    \nGuard ID: ${maxGuardAsleep.ID}
    \nMinutes Asleep: ${maxGuardAsleep.minutesAsleep}
    \nminute with most asleep: ${JSON.stringify(maxGuardAsleep.minuteWithMostAsleep)}
    `);

    console.log(`Puzzle Awnser: ${maxGuardAsleep.ID * maxGuardAsleep.minuteWithMostAsleep.minute}`);
}



function printInput(filePath: string, events: GuardEventType[]){
    let out = "";

    for( let e of events){
        out += `[${pad(4,e.time.year+"","0")}-${pad(2,e.time.month+"","0")}-${pad(2,e.time.day+"","0")} ${pad(2,e.time.hour+"","0")}:${pad(2,e.time.minute+"","0")}] `;
        if( e.startShift ){
            out += `Guard #${e.guardID} begins shift`;
        }else if( e.fallsAsleep ){
            out += "falls asleep";
        }else if( e.wakesUp ){
            out += "wakes up";
        }
        out += "\n";
    }

    utility.writeAllText(filePath, out);
}


function mapGuardSleepingToFile(filePath: string, guards: Map<number,Guard>):void{
    let graph = "";
    
    // write out graph header
    // Need 2 rows for hour indicator, then 2 rows for minute indicator 

    let hour1 = "";
    let hour2 = "";
    let min1 = "";
    let min2 = "";
    for( let h = 0; h <= 24; ++h ){
        for( let m = 0; m <= 60; ++m ){
            hour1 += Math.floor(h /10) + "";
            hour2 += h % 10 + "";
            min1 += Math.floor(m / 10) + "";
            min2 += m % 10 + "";
        }

    }

    let prefix = pad(17,"","_");
    graph += prefix + hour1 + "\n" + 
            prefix + hour2 + "\n" + 
            prefix + min1 + "\n" + 
            prefix + min2 + "\n";
 
    for( let g of guards.values()){
        for( let d of g.daysOnShift.values()){
            graph += `${pad(5,g.ID+"",'0')} - ${pad(2,""+d.month,'0')} - ${pad(2,""+d.day,'0')}: `;
            let hourMinArray = utility.range(0,24*60+59).map(()=>  " "); // make them all blank
            for( let h of d.hours.values()){

                h.minuteSleepStatus.forEach((val,index)=>{
                    let strIndex = h.hour * 60 + index;
                    hourMinArray[strIndex] = val;
                });
            }
            graph += hourMinArray.join("");
            graph += "\n"; // each new day is a line
        }
        
    }

    utility.writeAllText(filePath, graph);
}


function findGuardMaxAsleep(guards: Map<number,Guard>): GuardMaxSleep{
    let max: GuardMaxSleep = null;

    for( let g of guards.values()){
        let totalMinutesAsleep = 0;
        let asleepMinuteCount = utility.range(0,60).map((val)=>0);

        // go through all the minutes asleep and count them
        for( let d of g.daysOnShift.values()){
            for( let h of d.hours.values()){
                h.minuteSleepStatus.forEach((status,minute)=>{
                    if( status == "S"){
                        asleepMinuteCount[minute]++;
                        totalMinutesAsleep++;
                    }
                });
            }
        }

        let guardSleepStats = <GuardMaxSleep>{
            ID: g.ID,
            minuteWithMostAsleep: asleepMinuteCount.reduce((max: MinuteMostAsleep,curr,minute)=>{
                if( curr > max.count ){
                    max.minute = minute;
                    max.count = curr;
                }
                return max;
            }, <MinuteMostAsleep>{minute:-1,count:0}),
            minutesAsleep: totalMinutesAsleep
        };

        if( !max){
            max = guardSleepStats;
        }else if( guardSleepStats.minuteWithMostAsleep.count > max.minuteWithMostAsleep.count){
            max = guardSleepStats;
        }
    }

    return max;
}


function populateGuardAsleepData(events: GuardEventType[]): Map<number,Guard>{
    let result = new Map<number,Guard>();

    let currentGuardID = -1;
    let lastTime: TimeRecordType= null;


    for( let g of events ){
        if( g.startShift ){
            currentGuardID = g.guardID;
            lastTime = null;
            if( !result.has(currentGuardID) ){
                result.set(currentGuardID, <Guard>{
                    ID: currentGuardID,
                    daysOnShift: new Map<string, Day>()                  
                });
            }
        }

        let currentGuard = result.get(currentGuardID);

        let dayKey = g.time.month+""+g.time.day;
        if( !currentGuard.daysOnShift.has(dayKey)){
            currentGuard.daysOnShift.set(dayKey, <Day>{
                day : g.time.day,
                month : g.time.month,
                hours: new Map<number, Hour>()
            });
        }
        let day: Day = currentGuard.daysOnShift.get(dayKey);

        if( lastTime != null && g.wakesUp ){
            
            if( lastTime.hour != g.time.hour){
                // not sure what to do here
                console.error("The hour changed, so we need to account for that being possible");
            }else {
                if( !day.hours.has(g.time.hour)){
                    day.hours.set(g.time.hour, <Hour>{
                        hour: g.time.hour,
                        minuteSleepStatus : utility.range(0,60).map((val)=>{ return "A"}) // start out everyone asleep
                    });
                }
            }

            let hour = day.hours.get(g.time.hour);
            
            // do -1 on the wakeup minute because that minue counts as awake instead of sleeping
            for( let m = lastTime.minute; m <= g.time.minute-1; ++m ){
                hour.minuteSleepStatus[m] = "S";
            }
        }

        lastTime = g.time;
    }

    return result;
}


function sortGuardEvents( events: GuardEventType[]): GuardEventType[]{
    return events.sort((a,b)=>{

        if( a.time.year >b.time.year )
            return 1; // a greater
        else if( b.time.year > a.time.year ) return -1; // b greater

        if( a.time.month > b.time.month ) return 1; // a greater
        else if( b.time.month > a.time.month) return -1; // b greater

        if( a.time.day > b.time.day) return 1;
        else if( b.time.day > a.time.day) return -1;

        if( a.time.hour > b.time.hour) return 1;
        else if( b.time.hour > a.time.hour) return -1;

        if( a.time.minute > b.time.minute) return 1;
        else if( b.time.minute > a.time.minute) return -1;


        return 0; // they are equal
    });
}


function interpretEntries(entries: string[]): GuardEventType[]{
    let events: GuardEventType[] = [];
    for( let e of entries){
        // tackle time portion first
        // es2018; Named Capture Groups: http://2ality.com/2017/05/regexp-named-capture-groups.html
        let entryRegex = /\[(?<year>\d+)-(?<month>\d+)-(?<day>\d+) (?<hour>\d+):(?<minute>\d+)\] ((G.+#(?<guardID>\d+).+)|(w(?<wakeup>.+))|(f(?<falls>.+)))/;
        let matches = entryRegex.exec(e).groups;

        let guardID = matches["guardID"] && matches["guardID"].length > 0 ? +matches["guardID"] : -1;

        let evt = <GuardEventType>{
            time: <TimeRecordType>{
                year: +matches["year"],
                month: +matches["month"],
                day: +matches["day"],
                hour: +matches["hour"],
                minute: +matches["minute"]
            },
            guardID: guardID,
            startShift: guardID != -1 ? true : false,
            wakesUp: matches["wakeup"] && matches["wakeup"].length > 0 ? true: false,
            fallsAsleep: matches["falls"] && matches["falls"].length > 0 ? true: false
        };
        events.push(evt);
    }
    return events;
}

main();