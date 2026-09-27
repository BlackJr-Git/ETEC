"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Trash2,
  Eye,
  Search,
  MessageSquareText,
  Phone,
  Mail,
  Reply,
  Archive,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/admin/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { StatsSummary } from "@/components/admin/stats-summary";

type Message = {
  id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  sujet: string;
  contenu: string;
  status: string;
  createdAt: number;
  updatedAt: number;
};

type MessageStats = {
  total: number;
  byStatus: Record<string, number>;
  nouveaux: number;
  nonRepondus: number;
};

const statuses = ["nouveau", "lu", "repondu", "archive"];

const STATUS_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  lu: "Lu",
  repondu: "Répondu",
  archive: "Archivé",
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminMessagesPage() {
  const [rows, setRows] = useState<Message[]>([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Message | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(meta.page));
    if (status) params.set("status", status);
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/messages?${params.toString()}`);
    const data = (await res.json()) as {
      data: Message[];
      meta: { page: number; pages: number; total: number };
    };
    setRows(data.data ?? []);
    setMeta(data.meta ?? { page: 1, pages: 1, total: 0 });
    setSelected([]);
    setLoading(false);
  }, [meta.page, status, search]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    params.set("page", String(meta.page));
    if (status) params.set("status", status);
    if (search) params.set("search", search);

    fetch(`/api/admin/messages?${params.toString()}`)
      .then(
        (res) =>
          res.json() as Promise<{
            data: Message[];
            meta: { page: number; pages: number; total: number };
          }>,
      )
      .then((data) => {
        if (cancelled) return;
        setRows(data.data ?? []);
        setMeta(data.meta ?? { page: 1, pages: 1, total: 0 });
        setSelected([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [meta.page, status, search]);

  useEffect(() => {
    fetch("/api/admin/messages/stats")
      .then((res) => res.json() as Promise<MessageStats>)
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  function toggleAll() {
    setSelected(selected.length === rows.length ? [] : rows.map((r) => r.id));
  }

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function updateStatus(newStatus: string) {
    if (selected.length === 0) return;
    const res = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, status: newStatus }),
    });
    if (res.ok) refresh();
  }

  async function deleteRow(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    if (res.ok) refresh();
  }

  async function openDetail(row: Message) {
    setDetail(row);
    if (row.status === "nouveau") {
      await fetch(`/api/admin/messages/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "lu" }),
      });
      refresh();
    }
  }

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Messages envoyés via le formulaire de contact du site."
      />

      <StatsSummary
        items={[
          {
            label: "Total messages",
            value: stats?.total ?? "—",
            subLabel: "toutes périodes",
            icon: Inbox,
          },
          {
            label: "Nouveaux",
            value: stats?.nouveaux ?? "—",
            subLabel: "non lus",
            icon: AlertCircle,
          },
          {
            label: "Non répondus",
            value: stats?.nonRepondus ?? "—",
            subLabel: "nouveau + lu",
            icon: Clock,
          },
          {
            label: "Répondus",
            value: stats?.byStatus.repondu ?? 0,
            subLabel: "traités",
            icon: CheckCircle2,
          },
        ]}
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-(--muted-foreground)">
            Rechercher
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, e-mail, sujet, contenu…"
              className="bg-white pl-9"
            />
          </div>
        </div>
        <div className="md:w-56">
          <label className="mb-1.5 block text-xs font-medium text-(--muted-foreground)">
            Statut
          </label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s] ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-[#e7e7dd] bg-white p-2">
          <span className="px-2 text-sm text-(--muted-foreground)">
            {selected.length} sélectionné(s)
          </span>
          {statuses.map((s) => (
            <Button
              key={s}
              variant="ghost"
              size="sm"
              onClick={() => updateStatus(s)}
              className="text-xs"
            >
              Marquer {STATUS_LABELS[s] ?? s}
            </Button>
          ))}
        </div>
      )}

      {rows.length === 0 && !loading ? (
        <EmptyState
          icon={MessageSquareText}
          title="Aucun message"
          description="Les messages envoyés depuis le site apparaîtront ici."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#e7e7dd] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-(--cream)/50 hover:bg-(--cream)/50">
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === rows.length && rows.length > 0}
                    onChange={toggleAll}
                    className="accent-(--ink)"
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead>Mise à jour</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-(--muted-foreground)"
                  >
                    Chargement…
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="transition-colors hover:bg-(--cream)"
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggle(row.id)}
                        className="accent-(--ink)"
                      />
                    </TableCell>
                    <TableCell className="text-sm text-(--muted-foreground)">
                      {formatDate(row.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium text-(--ink)">
                      {row.nom}
                    </TableCell>
                    <TableCell>
                      {row.email ? (
                        <a
                          href={`mailto:${row.email}`}
                          className="inline-flex items-center gap-1 text-sm text-(--ink) hover:text-[#9c8a54]"
                        >
                          <Mail size={12} />
                          {row.email}
                        </a>
                      ) : row.telephone ? (
                        <a
                          href={`tel:${row.telephone}`}
                          className="inline-flex items-center gap-1 text-sm text-(--ink) hover:text-[#9c8a54]"
                        >
                          <Phone size={12} />
                          {row.telephone}
                        </a>
                      ) : (
                        <span className="text-sm text-(--muted-foreground)">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-(--ink)">
                      {row.sujet}
                    </TableCell>
                    <TableCell className="text-sm text-(--muted-foreground)">
                      {formatDate(row.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDetail(row)}
                        aria-label="Voir le détail"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRow(row.id)}
                        aria-label="Supprimer"
                      >
                        <Trash2 size={16} className="text-rose-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination
            page={meta.page}
            pages={meta.pages}
            total={meta.total}
            onChange={(p) => setMeta((m) => ({ ...m, page: p }))}
          />
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal tracking-tight text-(--ink)">
              {detail?.sujet}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-[5rem_1fr] gap-x-3 gap-y-3">
                <span className="text-(--muted-foreground)">De</span>
                <span className="font-medium">{detail.nom}</span>
                <span className="text-(--muted-foreground)">E-mail</span>
                <span>{detail.email ?? "—"}</span>
                <span className="text-(--muted-foreground)">Téléphone</span>
                <span>{detail.telephone ?? "—"}</span>
                <span className="text-(--muted-foreground)">Reçu le</span>
                <span>{formatDateTime(detail.createdAt)}</span>
                <span className="text-(--muted-foreground)">Mis à jour</span>
                <span>{formatDateTime(detail.updatedAt)}</span>
                <span className="text-(--muted-foreground)">Statut</span>
                <span>
                  <StatusBadge status={detail.status} />
                </span>
              </div>
              <div>
                <span className="text-(--muted-foreground)">Message</span>
                <p className="mt-1.5 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-[#e7e7dd] bg-(--cream) p-3 text-(--ink)">
                  {detail.contenu}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetail(null)}>
              Fermer
            </Button>
            {detail?.status !== "repondu" && (
              <Button
                variant="outline"
                onClick={async () => {
                  await fetch(`/api/admin/messages/${detail?.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "repondu" }),
                  });
                  setDetail(null);
                  refresh();
                }}
              >
                <Reply size={14} className="mr-1.5" />
                Marquer répondu
              </Button>
            )}
            {detail?.status !== "archive" && (
              <Button
                variant="outline"
                onClick={async () => {
                  await fetch(`/api/admin/messages/${detail?.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "archive" }),
                  });
                  setDetail(null);
                  refresh();
                }}
              >
                <Archive size={14} className="mr-1.5" />
                Archiver
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
