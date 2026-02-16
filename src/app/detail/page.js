import { Suspense } from "react";
import DetailPage from "./DetailPage.js";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailPage />
    </Suspense>
  );
}
