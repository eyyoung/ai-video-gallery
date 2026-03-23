import { redirect } from "next/navigation";
import { AdminUploadForm } from "@/components/admin-upload-form";
import { AdminVideoEditor } from "@/components/admin-video-editor";
import { AmbientBackdrop, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { isAuthenticated } from "@/lib/auth";
import { readVideos } from "@/lib/video-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  const videos = await readVideos();

  return (
    <>
      <AmbientBackdrop />
      <SiteHeader active="admin" />
      <main className="page-shell">
        <section className="shell dashboard-hero">
          <h1>
            创作者 <span>工作台</span>
          </h1>
          <p>
            上传和管理高保真影像作品。本地文件由服务器直接写入应用的静态资源目录。
          </p>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="button-secondary">
              退出登录
            </button>
          </form>
        </section>
        <section className="shell">
          <AdminUploadForm existingVideos={videos} />
        </section>
        <section className="shell admin-editor-section">
          <div className="admin-editor-section__header">
            <h2>作品管理</h2>
            <p>
              编辑视频元数据；列表左侧 ↑↓ 可调整展示顺序，修改将直接写入{" "}
              <code>content/videos.json</code>
            </p>
          </div>
          <AdminVideoEditor videos={videos} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
