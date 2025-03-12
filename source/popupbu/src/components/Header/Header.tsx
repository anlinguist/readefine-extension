import MainLogo from "../Logo/main_logo";
// @ts-expect-error TS(6142): Module '../Navigation/NavBar' was resolved to '/Us... Remove this comment to see the full error message
import NavBar from "../Navigation/NavBar";
import { useState, useEffect, useContext } from "react";
// @ts-expect-error TS(2307): Cannot find module '../../assets/def_prof_pic.jpeg... Remove this comment to see the full error message
import default_photo from '../../assets/def_prof_pic.jpeg'
// @ts-expect-error TS(6142): Module '../../RDFNContext' was resolved to '/Users... Remove this comment to see the full error message
import { RDFNContext } from "../../RDFNContext";

function Header() {
    // @ts-expect-error TS(2339): Property 'user' does not exist on type 'unknown'.
    const { user } = useContext(RDFNContext)

    return (
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <div id="header-container">
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <MainLogo/>
            {
                user &&
                // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                <NavBar />
            }
        </div>
    );
}

export default Header;