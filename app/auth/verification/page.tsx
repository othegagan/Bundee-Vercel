"use client"

import { fetchSignInMethodsForEmail } from "firebase/auth";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { auth } from "../firebase";

export default function Example() {

  const [sessionUserEmail, setSessionUserEmail] = useState("");
  const [sessionEmailVerifyStatus, setsessionEmailVerifyStatus] = useState("false");

  useEffect(() => {
    setSessionUserEmail(localStorage.getItem("session_user"));
    setsessionEmailVerifyStatus(localStorage.getItem("email_verify_status"));

  }, []);


  const firebseEmailVerifiedOrNotHandler = async (userEmail) => {

    try {
      const dataObject = await fetchSignInMethodsForEmail(auth, userEmail);
      console.log(dataObject);

    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <>
      <main className=" h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-black">Thanks for joining the Bundee</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl">{sessionUserEmail}</h1>

          <p className="mt-6 text-base leading-7 text-gray-600">Verification email has been sent successfully, Please check your inbox and click on verify link</p>
          <div className="mt-10 flex items-center justify-center gap-x-6">

            {sessionUserEmail != "" && (
              <Link href='/auth/login' className='rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
                <p>Login</p>
              </Link>
            )}

            {/* <Link href='/auth/verification' className='text-sm font-semibold text-gray-900 bg-primary/5 px-3.5 py-2.5'>
                <p>Resend Verification link</p>
              </Link> */}

          </div>
        </div>
      </main>
    </>
  )
}
