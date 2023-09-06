import './App.css'
import * as cheerio from 'cheerio';
import {useEffect, useState} from "react";
import Timetable from "./models/Timetable.ts";
import Day from "./models/Day.ts";
import Hour from "./models/Hour.ts";
import Lesson from "./models/Lesson.ts";
import TimeRemaining from "./components/TimeRemaining.tsx";
import HourTime from "./models/HourTime.ts";
import {DateTime} from "luxon";

function App() {
    const [timetable, setTimetable] = useState<Timetable | null>(null);

    useEffect(() => {
        const url = 'https://delta-skola.bakalari.cz/Timetable/Public/Actual/Class/3Q';

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then((htmlContent) => {
                const $ = cheerio.load(htmlContent);

                const days: Day[] = [];
                const cellWrappers = $(".bk-timetable-row > .bk-cell-wrapper");
                for (const cellWrapper of cellWrappers) {
                    const hours: Hour[] = [];

                    const cells = $(cellWrapper).find(".bk-timetable-cell");
                    for (const cell of cells) {
                        const lessons: Lesson[] = [];

                        const dayItems = $(cell).find(".day-item > .day-item-hover > .day-flex");
                        for (const dayItem of dayItems) {
                            const subject = $(dayItem).find(".middle").text();
                            const group = $(dayItem).find(".top > .left > div").text();
                            const room = $(dayItem).find(".top > .right > div").text();
                            const teacher = $(dayItem).find(".bottom > span").text();

                            const lesson: Lesson = {
                                subject: subject,
                                group: group ? group : null,
                                room: room,
                                teacher: teacher,
                            };
                            lessons.push(lesson);
                        }

                        const hour: Hour = {
                            lessons: lessons,
                        };
                        hours.push(hour);
                    }

                    const day: Day = {
                        hours: hours,
                    }
                    days.push(day);
                }

                const timetable: Timetable = {
                    days: days,
                }

                console.log(timetable);
                setTimetable(timetable);
            })
            .catch((error) => {
                console.error('Error fetching webpage:', error);
            });
    }, []);

    const hourTimes: HourTime[] = [
        {start: DateTime.fromObject({hour: 8, minute: 0}), end: DateTime.fromObject({hour: 8, minute: 45})},
        {start: DateTime.fromObject({hour: 8, minute: 50}), end: DateTime.fromObject({hour: 9, minute: 35})},
        {start: DateTime.fromObject({hour: 9, minute: 50}), end: DateTime.fromObject({hour: 10, minute: 35})},
        {start: DateTime.fromObject({hour: 10, minute: 40}), end: DateTime.fromObject({hour: 11, minute: 25})},
        {start: DateTime.fromObject({hour: 11, minute: 35}), end: DateTime.fromObject({hour: 12, minute: 20})},
        {start: DateTime.fromObject({hour: 12, minute: 25}), end: DateTime.fromObject({hour: 13, minute: 10})},
        {start: DateTime.fromObject({hour: 13, minute: 15}), end: DateTime.fromObject({hour: 14, minute: 0})},
        {start: DateTime.fromObject({hour: 14, minute: 0}), end: DateTime.fromObject({hour: 14, minute: 45})},
        {start: DateTime.fromObject({hour: 14, minute: 45}), end: DateTime.fromObject({hour: 15, minute: 30})},
    ];

    return (
        <div>
            <TimeRemaining hourTime={hourTimes[5]}/>
        </div>
    );
}

export default App
