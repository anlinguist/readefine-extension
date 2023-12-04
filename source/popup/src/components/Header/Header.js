import MainLogo from "../Logo/main_logo";
import NavBar from "../Navigation/NavBar";
import { useState, useEffect, useContext } from "react";
import default_photo from '../../assets/def_prof_pic.jpeg'
import { RDFNContext } from "../../RDFNContext";

function Header() {
    const { user } = useContext(RDFNContext)

    return (
        <div id="header-container">
            <MainLogo/>
            {
                user &&
                <NavBar />
            }
        </div>
    );
}

export default Header;