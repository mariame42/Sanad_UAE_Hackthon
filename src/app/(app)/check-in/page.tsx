import { CheckInPlayer } from "@/features/check-in/CheckInPlayer";
import { PageTransition } from "@/components/motion/PageTransition";

export default function CheckInPage() {
  return (
    <PageTransition>
      <CheckInPlayer />
    </PageTransition>
  );
}
