import {Route, Routes} from "react-router-dom";
import Home from "./view/route/Home";
import ConfirmationAccount from "./view/route/ConfirmationAccount";
import Redirect from "./view/route/Redirect";

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/home" element={<Home/>}/>
            <Route path="/confirm/:id/:token" element={<ConfirmationAccount/>}/>
            <Route path="/confirm" element={<ConfirmationAccount/>}/>
            <Route path="/redirect" element={<Redirect/>}/>
        </Routes>
    );
};
