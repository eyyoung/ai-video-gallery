import Link from "next/link";
import { AmbientBackdrop, SiteFooter } from "@/components/site-chrome";

export default function NotFound() {
  return (
    <>
      <AmbientBackdrop />
      <main className="login-shell">
        <div className="login-card">
          <div className="login-card__brand">
            <div className="login-card__icon">?</div>
            <h1>视频未找到</h1>
            <p>您请求的影像作品已不在此画廊中。</p>
          </div>
          <Link href="/" className="button-primary button-primary--link">
            返回作品集
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
