export default function NoAuthStatePage() {
    return (
      <>`
        <main className=" h-screen grid min-h-full  bg-primary/5 px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <p className="text-base font-semibold text-indigo-600">Trips</p>
            {/* <div className="flex">
            <img className="max-h-300 max-w-400" src="https://img.freepik.com/free-vector/hand-drawn-no-data-concept_52683-127823.jpg?w=1800&t=st=1702196801~exp=1702197401~hmac=78666d5a240345b1124610b496c0aa32a9ef2a43d8d58f557468b686042b5a50" alt="" />
            </div> */}
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Trips</h1>
            <p className="mt-6 text-base leading-7 text-gray-600">Oops it seems, You are not logged in. Please login and vist the page</p>
            {/* <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Have account ? Login
              </a>
              <a href="#" className="text-sm font-semibold text-gray-900 bg-white px-3.5 py-2.5">
                Create an Account <span aria-hidden="true">&rarr;</span>
              </a>
            </div> */}
          </div>
        </main>
      </>
    )
  }
  