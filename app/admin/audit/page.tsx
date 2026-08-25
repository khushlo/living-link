"use client";

import { useEffect, useState } from "react";

type AuditLog = { id: string; action: string; resourceType: string; resourceId: string | null; metadata: Record<string, unknown>; timestamp: string; user: { email: string } | null };

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/admin/audit").then(async (response) => { if (!response.ok) throw new Error(); setLogs(await response.json()); }).catch(() => setError("Unable to load audit logs.")); }, []);
  return <div className="mx-auto max-w-6xl space-y-6"><div><h1 className="text-3xl font-bold text-gray-900">Audit log</h1><p className="mt-2 text-gray-600">Most recent 100 recorded events. Metadata is intentionally limited and should not contain request content.</p></div>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<div className="overflow-x-auto rounded-xl border border-gray-200 bg-white"><table className="w-full text-left text-sm"><thead className="border-b bg-gray-50 text-gray-600"><tr><th className="p-3">Time</th><th className="p-3">Actor</th><th className="p-3">Action</th><th className="p-3">Resource</th><th className="p-3">Metadata</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-b last:border-0"><td className="p-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td><td className="p-3">{log.user?.email ?? "System"}</td><td className="p-3">{log.action}</td><td className="p-3">{log.resourceType}{log.resourceId ? `: ${log.resourceId.slice(0, 8)}` : ""}</td><td className="p-3 font-mono text-xs">{JSON.stringify(log.metadata)}</td></tr>)}</tbody></table></div></div>;
}
