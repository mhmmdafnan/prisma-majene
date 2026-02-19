import { Suspense } from "react";
import DetailPage from "./DetailPage.js";
import Loading from "@/components/Loading.js";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <DetailPage />
    </Suspense>
  );
}
