export default function Signup() {
  return (
    <div className=" flex px-64 py-12 justify-center items-center ">
        <div className="flex px-4 flex-col justify-center items-center gap-6 flex-1">
          {/* Title  */}
          <div className="flex flex-col items-center gap-2 ">
            <div className="text-center text-lg ">
              Welcome
            </div>
            <div className="text-gray-200/80">
             Please enter the following information to complete the signup process
            </div>
          </div>
               {/* form  */}
              <div className="flex py-4 px-4 flex-col items-center gap-8 self-stretch border border-2 border-[#9D9D9D]">

                <div className="flex flex-col items-center gap-6 self-stretch "> 
                  <div className="w-full">
                    <label className="text-md text-gray-400">Company  name</label>
                    <div className="group/input flex py-3 px-4 gap-2 rounded-lg bg-[#303030] border border-transparent focus-within:border-blue-500 hover:border-gray-600 transition-all">
                    <input
                      type="text"
                      placeholder="Enter your store/company name"
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 italic"
                    />
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="text-md text-gray-400">Contact Number</label>
                    <div className="group/input flex py-3 px-4 gap-2 rounded-lg bg-[#303030] border border-transparent focus-within:border-blue-500 hover:border-gray-600 transition-all">
                    <input
                      type="number"
                      placeholder="Enter your contact number"
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 italic"
                    />
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="text-md text-gray-400">Instagram Handle</label>
                    <div className="group/input flex py-3 px-4 gap-2 rounded-lg bg-[#303030] border border-transparent focus-within:border-blue-500 hover:border-gray-600 transition-all">
                    <input
                      type="text"
                      placeholder="Enter your instagram handle"
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 italic"
                    />
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="text-md text-gray-400">Company Description</label>
                    <div className="group/input flex py-3 px-4 gap-2 rounded-lg bg-[#303030] border border-transparent focus-within:border-blue-500 hover:border-gray-600 transition-all">
                    <input
                      type="text"
                      placeholder="Brief description of your company (50 words)"
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 italic"
                    />
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="text-md text-gray-400">Email</label>
                    <div className="group/input flex items-center py-3 px-4 gap-2 rounded-lg bg-[#303030] border border-transparent focus-within:border-blue-500 hover:border-gray-600 transition-all">
                    <img src="/email.svg" className="w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 italic"
                    />
                      </div>
                  </div>

                  <div className="w-full">
                    <label className="text-md text-gray-400">Password</label>
                    <div className="group/input flex items-center py-3 px-4 gap-2 rounded-lg bg-[#303030] border border-transparent focus-within:border-blue-500 hover:border-gray-600 transition-all">
                    <img src="/paswdicon.svg" className="w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 italic"
                    />
                      </div>
                  </div>

                </div>

                <button className="flex flex-col gap-2 bg-[#8A38F5] py-2 px-4 self-stretch rounded-lg hover:border ">
                  Sign up
                </button>

              </div>
        </div>
        
    </div>




  )
}