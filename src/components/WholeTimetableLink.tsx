import Timetable from "../models/Timetable.ts";
import deltaTimetableLogo from '../assets/delta-timetable-logo.svg';

const url3A = "https://delta-skola.bakalari.cz/Timetable/Public/Actual/Class/3Q";
const deltaTimetableUrl = "/cely";

interface Props {
    timetable: Timetable;
}

function WholeTimetableLink(props: Props) {
    return (
        <>
            {props.timetable.urlCurrent === url3A ? (
                <a href={deltaTimetableUrl} className="btn btn-outline-secondary" target="_blank">
                    <img src={deltaTimetableLogo} alt="logo Delta timetable" className="delta-timetable-logo"/>
                </a>
            ) : <a href={props.timetable.urlCurrent} className="btn btn-outline-secondary" target="_blank">
                <i className="bi bi-calendar-week-fill"></i> celý rozvrh
            </a>}
        </>
    );
}

export default WholeTimetableLink
