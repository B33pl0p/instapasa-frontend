"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const MetaSuccess = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/message");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <p className="text-sm text-gray-700">
        Redirecting to integrations...
      </p>
    </div>
  );
};

export default MetaSuccess;
