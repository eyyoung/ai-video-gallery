"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { ChangeEvent } from "react";
import type { VideoEntry } from "@/lib/types";

const categories = [
  "品牌形象",
  "产品展示",
  "汽车出行",
  "美妆护肤",
  "食品饮料",
  "科技数码",
  "服饰时尚",
  "地产家居",
];

export function AdminUploadForm({ existingVideos }: { existingVideos: VideoEntry[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("品牌形象");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const latestVideos = existingVideos.slice(0, 4);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    const nextPreview = file ? URL.createObjectURL(file) : null;
    previewUrlRef.current = nextPreview;
    setSelectedFile(file || null);
    setPreviewUrl(nextPreview);
    setError("");
  }

  function submitForm() {
    if (!selectedFile) {
      setError("请先选择一个 MP4、MOV 或 WebM 格式的本地视频文件。");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim() || selectedFile.name.replace(/\.[^.]+$/, ""));
    formData.append("description", description.trim());
    formData.append("category", category);
    formData.append("file", selectedFile);

    startTransition(async () => {
      setError("");

      const response = await fetch("/api/videos", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error || "上传失败，请重试。");
        return;
      }

      const payload = (await response.json()) as { video: VideoEntry };
      router.push(`/video/${payload.video.slug}`);
      router.refresh();
    });
  }

  return (
    <div className="dashboard-grid">
      <section className="panel panel--padded">
        <div className="form-grid">
          <label className="field">
            <span className="field__label">视频标题</span>
            <input
              type="text"
              placeholder="输入影像项目名称..."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <div className="field">
            <span className="field__label">分类</span>
            <div className="category-grid">
              {categories.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={option === category ? "category-pill is-active" : "category-pill"}
                  onClick={() => setCategory(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span className="field__label">描述</span>
            <textarea
              rows={4}
              placeholder="描述这个视频的氛围、场景或内容..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <div className="field">
            <span className="field__label">视频文件上传</span>
            <button
              type="button"
              className="dropzone"
              onClick={() => inputRef.current?.click()}
            >
              <span className="dropzone__icon">☁</span>
              <strong>将视频文件拖放到此处</strong>
              <p>支持 MP4、MOV 或 WebM 格式，文件存储在应用静态资源目录下。</p>
              <span className="dropzone__button">浏览文件</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              hidden
              onChange={onFileChange}
            />
            {selectedFile ? <p className="field__hint">已选择：{selectedFile.name}</p> : null}
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="button" className="button-primary" disabled={isPending} onClick={submitForm}>
            {isPending ? "正在上传..." : "发布视频"}
          </button>
        </div>
      </section>

      <aside className="dashboard-sidebar">
        <section className="panel preview-panel">
          <div className="preview-panel__media">
            {previewUrl ? (
              <video src={previewUrl} controls muted playsInline className="preview-panel__video" />
            ) : (
              <>
                <Image
                  fill
                  sizes="(max-width: 1180px) 100vw, 33vw"
                  src="/stitch/admin.png"
                  alt=""
                  className="preview-panel__placeholder"
                />
                <div className="preview-panel__empty">
                  <span>◌</span>
                  <p>暂无预览</p>
                  <small>上传视频后可在此处预览</small>
                </div>
              </>
            )}
          </div>
          <div className="preview-panel__body">
            <div className="card__row">
              <span className="tag-chip">草稿</span>
              <span className="micro-copy">修改时间：刚刚</span>
            </div>
            <h3>项目信息</h3>
            <dl className="meta-list">
              <div>
                <dt>画面比例</dt>
                <dd>自动检测</dd>
              </div>
              <div>
                <dt>分辨率</dt>
                <dd>原始画质</dd>
              </div>
              <div>
                <dt>存储位置</dt>
                <dd className="meta-list__accent">public/uploads</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="panel panel--padded">
          <h4 className="checklist__title">发布前检查</h4>
          <ul className="checklist">
            <li>视频格式适合网页播放，且未超过本地静态存储限额。</li>
            <li>标题和分类已准备就绪，可在画廊卡片中公开展示。</li>
            <li>管理员会话处于活跃状态，可执行服务端写入操作。</li>
          </ul>
        </section>

        <section className="panel panel--padded">
          <h4 className="checklist__title">最新作品</h4>
          <div className="latest-list">
            {latestVideos.map((video) => (
              <div key={video.id} className="latest-list__item">
                <div>
                  <strong>{video.shortTitle}</strong>
                  <span>
                    {video.category} · {video.duration}
                  </span>
                </div>
                <span className="latest-list__year">{video.year}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
