import {useEffect, useState} from "react";
import {DateTime} from "luxon";
import Timetable from "../models/Timetable.ts";
import TimeRemaining from "./TimeRemaining.tsx";
import hourTimes from "../data/hourTimes.ts";
import Lessons from "./Lessons.tsx";

interface Props {
    timetable: Timetable;
    selectedClassId: string | null;
    selectedGroups: string[];
    setSelectedClassIdCallback: (classId: string | null) => void;
    setSelectedGroupsCallback: (groups: string[]) => void;
}

function TimetableInfo(props: Props) {
    const [currentTime, setCurrentTime] = useState(DateTime.now());
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(DateTime.now());
        }, 100);

        return () => {
            clearInterval(intervalId);
        }
    }, []);

    const dayIndex: number = currentTime.weekday - 1;
    if (dayIndex > 4) {
        return (
            <>
                <p>Dnes není pracovní den.</p>
            </>
        )
    }

    const hours = props.timetable.days[dayIndex].hours;
    const firstHourIndex = hours.findIndex((hour) => hour.isSelected);
    const lastHourIndex = hours.findLastIndex((hour) => hour.isSelected);

    if (firstHourIndex === -1 || lastHourIndex === -1) {
        return (
            <>
                <p>Dnes není žádné vyučování.</p>
            </>
        )
    }

    return (
        <div className="d-flex flex-column gap-4">
            <p className="display-1 fw-bold">
                <TimeRemaining currentTime={currentTime} hourTimes={hourTimes} hours={hours}
                               firstHourIndex={firstHourIndex} lastHourIndex={lastHourIndex}
                               selectedGroups={props.selectedGroups}/>
            </p>
            <Lessons currentTime={currentTime} hourTimes={hourTimes} hours={hours} firstHourIndex={firstHourIndex}
                     lastHourIndex={lastHourIndex} selectedGroups={props.selectedGroups}/>
        </div>
    );
}

export default TimetableInfo