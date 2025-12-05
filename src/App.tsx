import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TripCreate from "./views/TripCreate";
import TripDetails from "./views/TripDetails";
import LogView from "./views/LogView";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<TripCreate />} />
                <Route path='/trip/:id' element={<TripDetails />} />
                <Route path='/trip/:id/logs' element={<LogView />} />
                <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
