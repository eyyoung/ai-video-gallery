"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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

interface EditorState {
  title: string;
  shortTitle: string;
  description: string;
  summary: string;
  category: string;
  tags: string;
  duration: string;
  year: string;
  accent: string;
  featured: boolean;
  creatorName: string;
  creatorRole: string;
}

function videoToState(v: VideoEntry): EditorState {
  return {
    title: v.title,
    shortTitle: v.shortTitle,
    description: v.description,
    summary: v.summary,
    category: v.category,
    tags: v.tags.join(", "),
    duration: v.duration,
    year: v.year,
    accent: v.accent,
    featured: v.featured ?? false,
    creatorName: v.creator.name,
    creatorRole: v.creator.role,
  };
}

function stateToPayload(s: EditorState) {
  return {
    title: s.title,
    shortTitle: s.shortTitle,
    description: s.description,
    summary: s.summary,
    category: s.category,
    tags: s.tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean),
    duration: s.duration,
    year: s.year,
    accent: s.accent,
    featured: s.featured,
    creator: { name: s.creatorName, role: s.creatorRole },
  };
}

export function AdminVideoEditor({ videos }: { videos: VideoEntry[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditorState | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function openEditor(video: VideoEntry) {
    setEditingId(video.id);
    setForm(videoToState(video));
    setError("");
    setSuccess("");
  }

  function closeEditor() {
    setEditingId(null);
    setForm(null);
    setError("");
    setSuccess("");
    setDeletingId(null);
  }

  function patch(key: keyof EditorState, value: string | boolean) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function saveVideo() {
    if (!editingId || !form) return;

    startTransition(async () => {
      setError("");
      setSuccess("");

      const res = await fetch(`/api/videos/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stateToPayload(form)),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(payload?.error || "保存失败，请重试。");
        return;
      }

      setSuccess("保存成功");
      router.refresh();
      setTimeout(() => setSuccess(""), 2000);
    });
  }

  function deleteVideo(id: string) {
    startTransition(async () => {
      setError("");
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(payload?.error || "删除失败，请重试。");
        return;
      }

      setDeletingId(null);
      closeEditor();
      router.refresh();
    });
  }

  function moveVideo(index: number, delta: -1 | 1) {
    const next = index + delta;
    if (next < 0 || next >= videos.length) return;

    const orderedIds = videos.map((v) => v.id);
    const [removed] = orderedIds.splice(index, 1);
    orderedIds.splice(next, 0, removed);

    startTransition(async () => {
      setError("");
      const res = await fetch("/api/videos/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(payload?.error || "调整顺序失败，请重试。");
        return;
      }

      setError("");
      router.refresh();
    });
  }

  if (videos.length === 0) {
    return (
      <div className="panel panel--padded editor-empty">
        <p>暂无视频作品，请先上传视频。</p>
      </div>
    );
  }

  return (
    <div className="video-editor">
      {error ? (
        <p className="form-error video-editor__global-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="video-editor__list">
        {videos.map((video, index) => (
          <div key={video.id} className="video-editor__row">
            <div className="video-editor__reorder">
              <button
                type="button"
                className="video-editor__reorder-btn"
                aria-label="上移"
                disabled={isPending || index === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  moveVideo(index, -1);
                }}
              >
                ↑
              </button>
              <button
                type="button"
                className="video-editor__reorder-btn"
                aria-label="下移"
                disabled={isPending || index === videos.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  moveVideo(index, 1);
                }}
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              className={`video-editor__item ${editingId === video.id ? "is-active" : ""}`}
              onClick={() => openEditor(video)}
            >
              <div className="video-editor__thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={video.poster} alt="" />
              </div>
              <div className="video-editor__info">
                <strong>{video.title}</strong>
                <span>
                  {video.category} · {video.year}
                </span>
              </div>
              {video.featured && <span className="tag-chip">精选</span>}
            </button>
          </div>
        ))}
      </div>

      {editingId && form ? (
        <div className="panel panel--padded video-editor__form">
          <div className="video-editor__form-header">
            <h4>编辑视频信息</h4>
            <button
              type="button"
              className="video-editor__close"
              onClick={closeEditor}
            >
              ✕
            </button>
          </div>

          <div className="form-grid">
            <div className="editor-row-2">
              <label className="field">
                <span className="field__label">标题</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => patch("title", e.target.value)}
                />
              </label>

              <label className="field">
                <span className="field__label">短标题</span>
                <input
                  type="text"
                  value={form.shortTitle}
                  onChange={(e) => patch("shortTitle", e.target.value)}
                />
              </label>
            </div>

            <label className="field">
              <span className="field__label">描述</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => patch("description", e.target.value)}
              />
            </label>

            <label className="field">
              <span className="field__label">简介</span>
              <textarea
                rows={2}
                value={form.summary}
                onChange={(e) => patch("summary", e.target.value)}
              />
            </label>

            <div className="field">
              <span className="field__label">分类</span>
              <div className="category-grid">
                {categories.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`category-pill ${option === form.category ? "is-active" : ""}`}
                    onClick={() => patch("category", option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <label className="field">
              <span className="field__label">标签（逗号分隔）</span>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => patch("tags", e.target.value)}
              />
            </label>

            <div className="editor-row-3">
              <label className="field">
                <span className="field__label">时长</span>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => patch("duration", e.target.value)}
                />
              </label>

              <label className="field">
                <span className="field__label">年份</span>
                <input
                  type="text"
                  value={form.year}
                  onChange={(e) => patch("year", e.target.value)}
                />
              </label>

              <label className="field">
                <span className="field__label">主色调</span>
                <div className="editor-color-field">
                  <input
                    type="color"
                    value={form.accent}
                    onChange={(e) => patch("accent", e.target.value)}
                    className="editor-color-input"
                  />
                  <input
                    type="text"
                    value={form.accent}
                    onChange={(e) => patch("accent", e.target.value)}
                    className="editor-color-text"
                  />
                </div>
              </label>
            </div>

            <div className="editor-row-2">
              <label className="field">
                <span className="field__label">创作者</span>
                <input
                  type="text"
                  value={form.creatorName}
                  onChange={(e) => patch("creatorName", e.target.value)}
                />
              </label>

              <label className="field">
                <span className="field__label">角色</span>
                <input
                  type="text"
                  value={form.creatorRole}
                  onChange={(e) => patch("creatorRole", e.target.value)}
                />
              </label>
            </div>

            <label className="editor-toggle">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => patch("featured", e.target.checked)}
              />
              <span className="editor-toggle__track">
                <span className="editor-toggle__thumb" />
              </span>
              <span className="field__label">精选作品</span>
            </label>

            {success && <p className="editor-success">{success}</p>}

            <div className="editor-actions">
              <button
                type="button"
                className="button-primary"
                disabled={isPending}
                onClick={saveVideo}
              >
                {isPending ? "保存中..." : "保存修改"}
              </button>

              {deletingId === editingId ? (
                <div className="editor-delete-confirm">
                  <span>确认删除？</span>
                  <button
                    type="button"
                    className="editor-btn-danger"
                    disabled={isPending}
                    onClick={() => deleteVideo(editingId)}
                  >
                    确认
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setDeletingId(null)}
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="editor-btn-danger"
                  onClick={() => setDeletingId(editingId)}
                >
                  删除视频
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="panel panel--padded editor-empty">
          <span className="editor-empty__icon">✎</span>
          <p>选择左侧视频以编辑元数据</p>
        </div>
      )}
    </div>
  );
}
