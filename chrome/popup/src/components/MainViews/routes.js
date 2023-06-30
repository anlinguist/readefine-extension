import PD from "./PD/PD";
import CD from "./CD/CD";
import CDSelector from "./CD/CDSelector";
import Settings from "./Settings/Settings";
import Login from "./Login/Login";
import UhOh from "./UhOh/UhOh";
import TDSelector from "./TD/TDSelector";
import TD from "./TD/TD";

const routes = [
    {
        path: '/personal-dictionary',
        Component: PD
    },
    {
        path: '/community-dictionaries',
        Component: CDSelector
    },
    {
        path: '/community-dictionaries/:selectedCD',
        Component: CD
    },
    {
        path: '/team-dictionaries',
        Component: TDSelector
    },
    {
        path: '/team-dictionaries/:selectedTD',
        Component: TD
    },
    {
        path: '/settings',
        Component: Settings
    },
    {
        path: '/login',
        Component: Login
    },
    {
        path: '/error',
        Component: UhOh
    }
]

export default routes