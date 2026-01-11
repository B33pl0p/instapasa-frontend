// InstagramLoginButton.tsx
import React from "react";

const META_APP_ID = "869172442507684";
const REDIRECT_URI = "https://lakhey.tech/meta-success";

const InstagramLoginButton: React.FC = () => {
  const handleClick = () => {
    const url = new URL("https://www.facebook.com/v24.0/dialog/oauth");

    url.searchParams.set("client_id", META_APP_ID);
    url.searchParams.set("display", "page");
    url.searchParams.set(
      "extras",
      JSON.stringify({ setup: { channel: "IG_API_ONBOARDING" } })
    );
    url.searchParams.set("redirect_uri", REDIRECT_URI); 
    url.searchParams.set("response_type", "token");
    url.searchParams.set(
      "scope",
      [
        "instagram_basic",
        "instagram_manage_messages",
        "instagram_business_basic",
        "instagram_business_manage_insights",
        "pages_show_list",
        "pages_messaging",
        "pages_read_engagement",
        //adding business management as extra debu
        "business_management"
      ].join(",")
    );

    window.location.href = url.toString();
  };

  return <button onClick={handleClick}
        className="bg-[linear-gradient(86deg,_rgba(249,206,52,0.75)_-7.01%,_rgba(238,42,123,0.75)_52.81%,_rgba(98,40,215,0.75)_110.91%)] text-white px-4 py-2 rounded-md text-sm
             hover:bg-brand hover:text-white/90
             transition-all duration-200">   
        Login with Instagram 
    </button>;
};

export default InstagramLoginButton;