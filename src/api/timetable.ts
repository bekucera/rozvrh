import * as cheerio from "cheerio";
import Day from "../models/Day.ts";
import Hour from "../models/Hour.ts";
import Lesson from "../models/Lesson.ts";
import Timetable from "../models/Timetable.ts";
import ClassId from "../models/ClassId.ts";
import HourTime from "../models/HourTime.ts";
import {DateTime} from "luxon";
import Group from "../models/Group.ts";
import School from "../models/School.ts";

const timetableBlankPermanentUrl = "Timetable/Public";

const timetableClassPermanentBaseUrl = "Timetable/Public/Permanent/Class/";
const timetableClassCurrentBaseUrl = "Timetable/Public/Actual/Class/";

async function fetchHtml(url: string) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error();
    }

    return await response.text();
}

export async function getClassIds(school: School): Promise<ClassId[]> {
    const html = await fetchHtml(new URL(timetableBlankPermanentUrl, school.url).toString());
    const $ = cheerio.load(html);

    const classIds: ClassId[] = [];

    try {
        const classSelect = $("#selectedClass")[0];
        for (const option of classSelect.children) {
            const id = $(option).attr("value");
            const name = $(option).text();

            if (id === undefined || name.trim() === "") {
                continue;
            }

            classIds.push(new ClassId(id, name));
        }
    } catch (e) {
        throw new Error();
    }

    return classIds;
}

export async function getTimetable(school: School, classId: string, selectedGroupIds: string[]): Promise<Timetable> {
    const permanentUrl = new URL(timetableClassPermanentBaseUrl + classId, school.url).toString();
    const currentUrl = new URL(timetableClassCurrentBaseUrl + classId, school.url).toString();

    const permanentHtml = await fetchHtml(permanentUrl);
    const currentHtml = await fetchHtml(currentUrl);

    const daysPermanent = createDays(permanentHtml, selectedGroupIds);
    const daysCurrent = createDays(currentHtml, selectedGroupIds);

    const groupGroups: Group[][] = [];

    const hours: Hour[] = [];
    for (const day of daysPermanent) for (const hour of day.hours) hours.push(hour);

    const lessonGroups: Lesson[][] = [];

    for (const hour of hours) {
        const lessonsMap: { [key: string]: Lesson[] } = {};

        const lessonsWithoutColon: Lesson[] = [];

        for (const lesson of hour.lessons) {
            if (lesson.isNotEveryWeek) {
                if (!lessonsMap[lesson.weekId!]) {
                    lessonsMap[lesson.weekId!] = [lesson];
                } else {
                    lessonsMap[lesson.weekId!].push(lesson);
                }
            } else {
                lessonsWithoutColon.push(lesson);
            }
        }

        lessonGroups.push(...Object.values(lessonsMap));
        if (lessonsWithoutColon.length > 0) {
            lessonGroups.push(lessonsWithoutColon);
        }
    }

    hoursLoop:
        for (const lessonGroup of lessonGroups
            .sort((a, b) => b.length - a.length)
            ) {
            const groupGroup: Group[] = [];
            for (const lesson of lessonGroup) {
                if (lesson.group === null) {
                    continue hoursLoop;
                }

                if (groupGroups.some(groupGroup => groupGroup.some((group) => group.id === lesson.group!.id))) {
                    continue;
                }

                groupGroup.push(lesson.group);
            }

            if (groupGroup.length > 0) {
                groupGroup.push(new Group(`blank-${groupGroup.map((group) => group.id)}`, null, true));
                groupGroups.push(groupGroup);
            }
        }

    const hourTimes = createHourTimes(currentHtml);

    return new Timetable(daysCurrent, groupGroups, hourTimes, currentUrl);
}

function createDays(html: string, selectedGroupIds: string[]): Day[] {
    const $ = cheerio.load(html);

    const days: Day[] = [];
    const cellWrappers = $(".bk-timetable-row > .bk-cell-wrapper");
    for (const cellWrapper of cellWrappers) {
        const hours: Hour[] = [];

        const cells = $(cellWrapper).find(".bk-timetable-cell");
        for (const cell of cells) {
            const lessons: Lesson[] = [];

            const dayItems = $(cell).find(".day-item > .day-item-hover > .day-flex");
            for (const dayItem of dayItems) {
                const subject = $(dayItem).find(".middle").text().trim();

                if (subject === "") {
                    continue;
                }

                const groupName = $(dayItem).find(".top > .left > div").text().trim();
                const group = new Group(groupName, groupName, false);
                const room = $(dayItem).find(".top > .right > div").text().trim();
                const teacher = $(dayItem).find(".bottom > span").text().trim();

                let isNotEveryWeek = false;
                let weekId = null;
                if (subject.includes(": ")) {
                    isNotEveryWeek = true;
                    weekId = subject.split(": ")[0];
                }

                lessons.push(new Lesson(subject, group.name !== "" ? group : null, room, teacher, isNotEveryWeek, weekId));
            }

            const selectedLesson = lessons.find((lesson) =>
                lesson.group === null || selectedGroupIds.includes(lesson.group.id));

            hours.push(new Hour(lessons, selectedLesson !== undefined ? selectedLesson : null));
        }

        days.push(new Day(hours));
    }

    return days;
}

function createHourTimes(html: string): HourTime[] {
    const $ = cheerio.load(html);

    const hourTimes = [];

    const hours = $(".bk-timetable-hours > .bk-hour-wrapper > .hour");
    for (const hour of hours) {
        const from = $(hour).children().first().text();
        const to = $(hour).children().last().text();

        hourTimes.push(new HourTime(DateTime.fromFormat(from, "H:mm"), DateTime.fromFormat(to, "H:mm")));
    }

    return hourTimes;
}
