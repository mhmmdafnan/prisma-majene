import { Suspense } from "react";
import MainApp from "./dashboard.js";
import Loading from "@/components/Loading.js";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <MainApp />
    </Suspense>
  );
}
