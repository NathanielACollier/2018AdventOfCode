import { utility } from "../common/utility";
import * as pad from "pad";

/*
--- Day 4: Repose Record ---
You've sneaked into another supply closet - this time, it's across from the prototype suit manufacturing lab. You need to sneak inside and fix the issues with the suit, but there's a guard stationed outside the lab, so this is as close as you can safely get.

As you search the closet for anything that might help, you discover that you're not the first person to want to sneak in. Covering the walls, someone has spent an hour starting every midnight for the past few months secretly observing this guard post! They've been writing down the ID of the one guard on duty that night - the Elves seem to have decided that one guard was enough for the overnight shift - as well as when they fall asleep or wake up while at their post (your puzzle input).

For example, consider the following records, which have already been organized into chronological order:

[1518-11-01 00:00] Guard #10 begins shift
[1518-11-01 00:05] falls asleep
[1518-11-01 00:25] wakes up
[1518-11-01 00:30] falls asleep
[1518-11-01 00:55] wakes up
[1518-11-01 23:58] Guard #99 begins shift
[1518-11-02 00:40] falls asleep
[1518-11-02 00:50] wakes up
[1518-11-03 00:05] Guard #10 begins shift
[1518-11-03 00:24] falls asleep
[1518-11-03 00:29] wakes up
[1518-11-04 00:02] Guard #99 begins shift
[1518-11-04 00:36] falls asleep
[1518-11-04 00:46] wakes up
[1518-11-05 00:03] Guard #99 begins shift
[1518-11-05 00:45] falls asleep
[1518-11-05 00:55] wakes up
Timestamps are written using year-month-day hour:minute format. The guard falling asleep or waking up is always the one whose shift most recently started. Because all asleep/awake times are during the midnight hour (00:00 - 00:59), only the minute portion (00 - 59) is relevant for those events.

Visually, these records show that the guards are asleep at these times:

Date   ID   Minute
            000000000011111111112222222222333333333344444444445555555555
            012345678901234567890123456789012345678901234567890123456789
11-01  #10  .....####################.....#########################.....
11-02  #99  ........................................##########..........
11-03  #10  ........................#####...............................
11-04  #99  ....................................##########..............
11-05  #99  .............................................##########.....
The columns are Date, which shows the month-day portion of the relevant day; ID, which shows the guard on duty that day; and Minute, which shows the minutes during which the guard was asleep within the midnight hour. (The Minute column's header shows the minute's ten's digit in the first row and the one's digit in the second row.) Awake is shown as ., and asleep is shown as #.

Note that guards count as asleep on the minute they fall asleep, and they count as awake on the minute they wake up. For example, because Guard #10 wakes up at 00:25 on 1518-11-01, minute 25 is marked as awake.

If you can figure out the guard most likely to be asleep at a specific time, you might be able to trick that guard into working tonight so you can have the best chance of sneaking in. You have two strategies for choosing the best guard/minute combination.

Strategy 1: Find the guard that has the most minutes asleep. What minute does that guard spend asleep the most?

In the example above, Guard #10 spent the most minutes asleep, a total of 50 minutes (20+25+5), while Guard #99 only slept for a total of 30 minutes (10+10+10). Guard #10 was asleep most during minute 24 (on two days, whereas any other minute the guard was asleep was only seen on one day).

While this example listed the entries in chronological order, your entries are in the order you found them. You'll need to organize them before they can be analyzed.

What is the ID of the guard you chose multiplied by the minute you chose? (In the above example, the answer would be 10 * 24 = 240.)
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
    let entries = await utility.readInput("./dec_4_1/input.txt");

    let guardEvents = interpretEntries(entries);
    let guardSorted = sortGuardEvents(guardEvents);
    let guardSleepData = populateGuardAsleepData(guardSorted);
    // map this out to a file
    mapGuardSleepingToFile("./output/dec_4_1_graph.txt", guardSleepData);


    let maxGuardAsleep = findGuardMaxAsleep(guardSleepData);

    console.log(`
    \n---- Max Sleep ----
    \nGuard ID: ${maxGuardAsleep.ID}
    \nMinutes Asleep: ${maxGuardAsleep.minutesAsleep}
    \nminute with most asleep: ${JSON.stringify(maxGuardAsleep.minuteWithMostAsleep)}
    `);

    console.log(`Puzzle Awnser: ${maxGuardAsleep.ID * maxGuardAsleep.minuteWithMostAsleep.minute}`);
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
        }else if( guardSleepStats.minutesAsleep > max.minutesAsleep){
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
            
            for( let m = lastTime.minute; m <= g.time.minute; ++m ){
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