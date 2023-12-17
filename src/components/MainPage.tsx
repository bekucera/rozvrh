import {Button} from "react-bootstrap";
import TimetableInfo from "./TimetableInfo.tsx";
import Timetable from "../models/Timetable.ts";
import {Link} from "react-router-dom";
import {useEffect} from "react";
import NoSleep from 'nosleep.js';
import WholeTimetableLink from "./WholeTimetableLink.tsx";

interface Props {
    isQueryLoading: boolean;
    isQueryError: boolean;
    timetable: Timetable | null;
}

function MainPage(props: Props) {
    document.title = "Rozvrh";

    useEffect(() => {
        const noSleep = new NoSleep();
        document.addEventListener('click', function enableNoSleep() {
            document.removeEventListener('click', enableNoSleep, false);
            void noSleep.enable();
        }, false);
    }, []);

    return (
        <div className="h-100 d-flex flex-column justify-content-center align-items-center text-center p-5">
            <Link to="/nastaveni">
                <Button variant="outline-secondary">
                    <i className="bi bi-gear-fill"></i> nastavení
                </Button>
            </Link>
            <div className="flex-fill d-flex justify-content-center align-items-center">
                {
                    props.isQueryLoading ? (<p>Načítání...</p>
                    ) : props.isQueryError ? (<p>Rozvrh se nepodařilo načíst.</p>
                    ) : props.timetable === null ? (<p>Zvolte školu, třídu a skupiny v nastavení.</p>
                    ) : <div className="d-flex flex-column gap-4 align-items-center">
                        <TimetableInfo {...props} timetable={props.timetable}/>
                        <WholeTimetableLink timetable={props.timetable}/>
                    </div>
                }
            </div>
            <Button variant="outline-secondary" href="https://github.com/matous-volf/rozvrh" target="_blank">
                <i className="bi bi-github"></i> GitHub
            </Button>
        </div>
    );
}

export default MainPage
