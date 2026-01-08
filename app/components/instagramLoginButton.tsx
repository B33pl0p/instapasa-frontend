// InstagramLoginButton.tsx
import React from "react";

const META_APP_ID = "869172442507684";
const REDIRECT_URI = "https://your-frontend.com/meta-success";

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
        "instagram_content_publish",
        "instagram_manage_comments",
        "instagram_manage_insights",
        "pages_show_list",
        "pages_read_engagement",
      ].join(",")
    );

    window.location.href = url.toString();
  };

  return <button onClick={handleClick}
        className="bg-brand/90 text-white px-4 py-2 rounded-md text-sm
             hover:bg-brand hover:text-white/90
             transition-all duration-200">
        Login with Instagram
    </button>;
};

export default InstagramLoginButton;