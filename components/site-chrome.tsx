import Link from "next/link";

interface SiteHeaderProps {
  active?: "gallery" | "admin";
  compact?: boolean;
}

export function SiteHeader({ active = "gallery", compact = false }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link href="/" className="brand-mark">
          光言科技
        </Link>
        <nav className="site-nav" aria-label="主导航">
          <Link
            href="/"
            className={active === "gallery" ? "site-nav__link is-active" : "site-nav__link"}
          >
            作品集
          </Link>
          <Link
            href="/admin"
            className={active === "admin" ? "site-nav__link is-active" : "site-nav__link"}
          >
            工作台
          </Link>
          {!compact ? (
            <Link href="/admin/login" className="site-nav__icon" aria-label="管理员登录">
              <span>◎</span>
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div className="site-footer__brand">光言科技</div>
        <div className="site-footer__links">
          <span>帮助文档</span>
          <span>隐私政策</span>
          <span>服务条款</span>
          <span>联系我们</span>
        </div>
        <div className="site-footer__copy">© 2026 光言科技 保留所有权利</div>
      </div>
    </footer>
  );
}

export function AmbientBackdrop() {
  return (
    <>
      <div className="ambient ambient--violet" />
      <div className="ambient ambient--cyan" />
    </>
  );
}
