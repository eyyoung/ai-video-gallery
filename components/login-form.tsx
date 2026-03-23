"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit() {
    startTransition(async () => {
      setError("");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error || "访问被拒绝。");
        return;
      }

      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <div className="login-card">
      <div className="login-card__brand">
        <div className="login-card__icon">✦</div>
        <h1>光言科技</h1>
        <p>创作者安全通道</p>
      </div>

      <label className="field">
        <span className="field__label">管理员验证</span>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit();
            }
          }}
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button type="button" className="button-primary" onClick={onSubmit} disabled={isPending}>
        {isPending ? "验证中..." : "进入工作台"}
      </button>

      <div className="login-card__meta">
        <span>申请权限</span>
        <span>
          系统状态 <i />
        </span>
      </div>
    </div>
  );
}
