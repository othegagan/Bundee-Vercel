"use client"

import Link from "next/link";

export default function Example() {

  function handleContactSupportHander(){

  }
  return (
    <>
      <main className="flex flex-col items-center bg-white px-6 sm:py-32 lg:px-8">
        <img className="h-[200px]" src="https://img.freepik.com/free-vector/select-concept-illustration_114360-393.jpg?w=1380&t=st=1702901606~exp=1702902206~hmac=8c78eea564b8528b9d05cded445c80f54852f14bb16300315766d7b9a9ec31ce" alt="" />
        <div className="text-center">
          <p className="text-base font-semibold text-primary">We are sorry</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Oops, Something went wrong.</h1>
          {/* <p className="mt-6 text-base leading-7 text-gray-600 lg-w-[600px] w-full mx-auto">It seems You already have an reservation the following dates.</p> */}
          <div className="mt-10">
            {/* <Link className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href="/checkout/reservation">
              Try again
            </Link> */}
            <button onClick={handleContactSupportHander} className="rounded-md mx-4 ounded-md bg-primary/5 px-3.5 py-2.5 text-sm font-semibold text-primary border border-primary shadow-sm">
              Contact support
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
