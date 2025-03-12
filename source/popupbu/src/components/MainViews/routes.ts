// @ts-expect-error TS(6142): Module './PD/PD' was resolved to '/Users/andrewnel... Remove this comment to see the full error message
import PD from "./PD/PD";
// @ts-expect-error TS(6142): Module './CD/CD' was resolved to '/Users/andrewnel... Remove this comment to see the full error message
import CD from "./CD/CD";
// @ts-expect-error TS(6142): Module './CD/CDSelector' was resolved to '/Users/a... Remove this comment to see the full error message
import CDSelector from "./CD/CDSelector";
// @ts-expect-error TS(6142): Module './Settings/Settings' was resolved to '/Use... Remove this comment to see the full error message
import Settings from "./Settings/Settings";
// @ts-expect-error TS(6142): Module './Login/Login' was resolved to '/Users/and... Remove this comment to see the full error message
import Login from "./Login/Login";
// @ts-expect-error TS(6142): Module './UhOh/UhOh' was resolved to '/Users/andre... Remove this comment to see the full error message
import UhOh from "./UhOh/UhOh";
// @ts-expect-error TS(6142): Module './Pro/Pro' was resolved to '/Users/andrewn... Remove this comment to see the full error message
import Pro from "./Pro/Pro";

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
        path: '/pro',
        Component: Pro
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