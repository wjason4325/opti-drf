import { Routes, Route } from 'react-router';
import Home from '../pages/Home/Home';
import React from "react";


export default function AppRoutes() {
    return(
        <Routes>
            <Route path="/" element={<Home/>}/>
        </Routes>
    );
}