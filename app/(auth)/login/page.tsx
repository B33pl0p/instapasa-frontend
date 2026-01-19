import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col py-4 width-[316px] justify-center items-center gap-6">
      <div className="flex flex-col items-center gap-2 self-stretch">
         <p className="text-2xl">Welcome Back</p>
         <p className="text-gray-400">Sign in with your account to continue</p>
      </div>
      <div className="flex flex-col py-4 px-4 items-center gap-8 rounded-sm border-2 border-gray-600">
        <div className="flex flex-col py-4 px-4 items-center gap-6">
        <div className="relative flex flex-col items-start gap-2">
          <label className="text-md text-left">Email Address</label>
          <div className="flex py-2 px-2 gap-4 items-center border rounded-sm bg-[#303030]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 20C3.45 20 2.97933 19.8043 2.588 19.413C2.19667 19.0217 2.00067 18.5507 2 18V6C2 5.45 2.196 4.97933 2.588 4.588C2.98 4.19667 3.45067 4.00067 4 4H20C20.55 4 21.021 4.196 21.413 4.588C21.805 4.98 22.0007 5.45067 22 6V18C22 18.55 21.8043 19.021 21.413 19.413C21.0217 19.805 20.5507 20.0007 20 20H4ZM12 12.825C12.0833 12.825 12.171 12.8123 12.263 12.787C12.355 12.7617 12.4423 12.7243 12.525 12.675L19.6 8.25C19.7333 8.16667 19.8333 8.06267 19.9 7.938C19.9667 7.81333 20 7.67567 20 7.525C20 7.19167 19.8583 6.94167 19.575 6.775C19.2917 6.60833 19 6.61667 18.7 6.8L12 11L5.3 6.8C5 6.61667 4.70833 6.61267 4.425 6.788C4.14167 6.96333 4 7.209 4 7.525C4 7.69167 4.03333 7.83767 4.1 7.963C4.16667 8.08833 4.26667 8.184 4.4 8.25L11.475 12.675C11.5583 12.725 11.646 12.7627 11.738 12.788C11.83 12.8133 11.9173 12.8257 12 12.825Z" fill="#E8E8E8"/>
            </svg>
           <input 
           type="email"
           className="bg-transparent border-none outline-none text-white placeholder-gray-400"
           placeholder="Enter your email"
           />
          </div>

        </div>
        <div className="flex width-[261px] flex-col items-start gap-2">
          <label className="text-md text-left">Password</label>
          <div className="flex py-2 px-2 gap-4 rounded-sm border bg-[#303030]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
           <path d="M6.616 21C6.17133 21 5.791 20.8417 5.475 20.525C5.159 20.2083 5.00067 19.8287 5 19.386V10.616C5 10.172 5.15833 9.792 5.475 9.476C5.79167 9.16 6.17167 9.00133 6.615 9H8V7C8 5.886 8.38833 4.941 9.165 4.165C9.941 3.38833 10.886 3 12 3C13.114 3 14.0593 3.38833 14.836 4.165C15.6127 4.94167 16.0007 5.88667 16 7V9H17.385C17.829 9 18.209 9.15833 18.525 9.475C18.841 9.79167 18.9993 10.1717 19 10.615V19.385C19 19.829 18.8417 20.209 18.525 20.525C18.2083 20.841 17.8283 20.9993 17.385 21H6.616ZM12 16.5C12.422 16.5 12.7773 16.3553 13.066 16.066C13.3553 15.7773 13.5 15.422 13.5 15C13.5 14.578 13.3553 14.2227 13.066 13.934C12.7767 13.6453 12.4213 13.5007 12 13.5C11.5787 13.4993 11.2233 13.644 10.934 13.934C10.6447 14.2227 10.5 14.578 10.5 15C10.5 15.422 10.6447 15.7773 10.934 16.066C11.2227 16.3553 11.578 16.5 12 16.5ZM9 9H15V7C15 6.16667 14.7083 5.45833 14.125 4.875C13.5417 4.29167 12.8333 4 12 4C11.1667 4 10.4583 4.29167 9.875 4.875C9.29167 5.45833 9 6.16667 9 7V9Z" fill="#E8E8E8"/>
            </svg>
           <input 
           type="text"
           className="bg-transparent border-none outline-none text-white placeholder-gray-400"
           placeholder="Enter your password"
           />
          </div>

        </div>
        </div>


        <div className="flex flex-col gap-2 self-stretch">
          <button className="px-4 py-2 gap-2 items-center rounded-lg bg-[#8A38F5]">Sign in</button>
          <button>Forgot password</button>
          <Link 
          href="/signup" className="text-center">
          <button>Sign up</button>
          </Link>
        </div>

      </div>
    </div>
  );
}