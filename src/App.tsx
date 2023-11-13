import './globals.css';
import {Route, Routes} from "react-router-dom";
import SignInForm from "./_auth/forms/SignInForm.tsx";
import SignUpForm from "./_auth/forms/SignUpForm.tsx";
import {Home} from "./_root/pages";
import AuthLayout from "./_auth/AuthLayout.tsx";
import RootLayout from "./_root/RootLayout.tsx";
import { Toaster } from "@/components/ui/toaster"

const App = () => {
    return (
        <main className='flex h-screen'>
            <Routes>
                {/*public routes*/}
                <Route element={<AuthLayout/>}>
                    <Route path='/sign-in' element={<SignInForm/>}/>
                    <Route path='/sign-up' element={<SignUpForm/>}/>
                </Route>
                {/*private routes*/}
                <Route element={<RootLayout/>}>
                    <Route index element={<Home/>}/>
                </Route>
            </Routes>
            <Toaster/>
        </main>
    )
}
export default App
