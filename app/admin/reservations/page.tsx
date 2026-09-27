"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Trash2,
  Eye,
  Search,
  Plus,
  CalendarDays,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type Reservation = {
  id: string;
  demandeId: string | null;
  nom: string;
  telephone: string;
  email: string | null;
  ville: string;
  site: string | null;
  dateReservation: number;
  type: string;
  statut: string;
  notes: string | null;
  createdAt: number;
};

type ReservationStats = {
  total: number;
  byStatus: Record<string, number>;
  upcoming: number;
  confirmed: number;
};

const statuses = ["en_attente", "confirmee", "annulee"];
const types = ["visite", "concession", "obseques"];
const villes = ["Kinshasa", "Lubumbashi"];

const TYPE_LABELS: Record<string, string> = {
  visite: "Visite",
  concession: "Concession",
  obseques: "Obsèques",
};

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
};

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminReservationsPage() {
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<Reservation[]>([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [stats, setStats] = useState<ReservationStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/reservations/stats")
      .then((res) => res.json() as Promise<ReservationStats>)
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      openEdit();
      window.history.replaceState({}, "", "/admin/reservations");
    }
  }, [searchParams]);

  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    email: "",
    ville: "Kinshasa",
    site: "",
    dateReservation: "",
    type: "visite",
    statut: "en_attente",
    notes: "",
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(meta.page));
    if (status) params.set("status", status);
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/reservations?${params.toString()}`);
    const data = (await res.json()) as {
      data: Reservation[];
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

    fetch(`/api/admin/reservations?${params.toString()}`)
      .then(
        (res) =>
          res.json() as Promise<{
            data: Reservation[];
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
    const res = await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, statut: newStatus }),
    });
    if (res.ok) refresh();
  }

  async function deleteRow(id: string) {
    if (!confirm("Supprimer cette réservation ?")) return;
    const res = await fetch(`/api/admin/reservations/${id}`, {
      method: "DELETE",
    });
    if (res.ok) refresh();
  }

  function openEdit(row?: Reservation) {
    if (row) {
      setEditing(row);
      setForm({
        nom: row.nom,
        telephone: row.telephone,
        email: row.email ?? "",
        ville: row.ville,
        site: row.site ?? "",
        dateReservation: new Date(row.dateReservation)
          .toISOString()
          .slice(0, 16),
        type: row.type,
        statut: row.statut,
        notes: row.notes ?? "",
      });
    } else {
      setEditing(null);
      setForm({
        nom: "",
        telephone: "",
        email: "",
        ville: "Kinshasa",
        site: "",
        dateReservation: "",
        type: "visite",
        statut: "en_attente",
        notes: "",
      });
    }
  }

  async function saveReservation() {
    const payload = {
      ...form,
      dateReservation: new Date(form.dateReservation).getTime(),
    };

    const res = editing
      ? await fetch(`/api/admin/reservations/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (res.ok) {
      setEditing(null);
      refresh();
    } else {
      const err = (await res.json()) as { error?: string };
      alert(err.error ?? "Erreur lors de l’enregistrement.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Réservations"
        description="Planifier et suivre les visites, concessions et rendez-vous funéraires."
      >
        <Button onClick={() => openEdit()}>
          <Plus size={16} /> Nouvelle réservation
        </Button>
      </PageHeader>

      <StatsSummary
        items={[
          {
            label: "Total réservations",
            value: stats?.total ?? "—",
            subLabel: "toutes périodes",
            icon: CalendarDays,
          },
          {
            label: "À venir",
            value: stats?.upcoming ?? "—",
            subLabel: "dates futures",
            icon: Calendar,
          },
          {
            label: "Confirmées",
            value: stats?.confirmed ?? "—",
            subLabel: "validées",
            icon: CheckCircle2,
          },
          {
            label: "Annulées",
            value: stats?.byStatus.annulee ?? 0,
            subLabel: "à vérifier",
            icon: XCircle,
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
              placeholder="Nom, e-mail, téléphone, site…"
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
            {selected.length} sélectionnée(s)
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
          icon={CalendarDays}
          title="Aucune réservation"
          description="Créez une réservation manuellement pour planifier un rendez-vous."
        >
          <Button onClick={() => openEdit()}>
            <Plus size={16} /> Nouvelle réservation
          </Button>
        </EmptyState>
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
                <TableHead>Date réservée</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Ville / Site</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Demandé par</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
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
                    <TableCell className="text-sm font-medium text-(--ink)">
                      {formatDateTime(row.dateReservation)}
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
                    <TableCell className="text-sm text-(--ink)">
                      {TYPE_LABELS[row.type] ?? row.type}
                    </TableCell>
                    <TableCell className="text-sm text-(--ink)">
                      {row.ville}
                      {row.site && (
                        <span className="block text-xs text-(--muted-foreground)">
                          {row.site}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-(--muted-foreground)">
                      {formatDate(row.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.demandeId ? (
                        <Link
                          href={`/admin/demandes?ref=${row.demandeId}`}
                          className="font-mono text-xs text-(--ink) hover:text-[#9c8a54]"
                        >
                          {row.demandeId.slice(-8)}
                        </Link>
                      ) : (
                        <span className="text-(--muted-foreground)">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.statut} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDetail(row)}
                        aria-label="Voir le détail"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(row)}
                        className="text-(--ink)"
                      >
                        Modifier
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
              Détail de la réservation
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-3">
                <span className="text-(--muted-foreground)">Nom</span>
                <span>{detail.nom}</span>
                <span className="text-(--muted-foreground)">Téléphone</span>
                <span>{detail.telephone}</span>
                <span className="text-(--muted-foreground)">E-mail</span>
                <span>{detail.email ?? "—"}</span>
                <span className="text-(--muted-foreground)">Ville</span>
                <span>{detail.ville}</span>
                <span className="text-(--muted-foreground)">Site</span>
                <span>{detail.site ?? "—"}</span>
                <span className="text-(--muted-foreground)">Type</span>
                <span>{TYPE_LABELS[detail.type] ?? detail.type}</span>
                <span className="text-(--muted-foreground)">Date réservée</span>
                <span>{formatDateTime(detail.dateReservation)}</span>
                <span className="text-(--muted-foreground)">Créée le</span>
                <span>{formatDateTime(detail.createdAt)}</span>
                <span className="text-(--muted-foreground)">Statut</span>
                <span>
                  <StatusBadge status={detail.statut} />
                </span>
              </div>
              {detail.demandeId && (
                <div className="rounded-lg border border-[#e7e7dd] bg-(--cream) p-3">
                  <span className="text-xs text-(--muted-foreground)">
                    Demande liée
                  </span>
                  <Link
                    href={`/admin/demandes?ref=${detail.demandeId}`}
                    className="mt-1 block font-mono text-sm text-(--ink) hover:text-[#9c8a54]"
                  >
                    {detail.demandeId}
                  </Link>
                </div>
              )}
              <div>
                <span className="text-(--muted-foreground)">Notes</span>
                <p className="mt-1.5 min-h-[3rem] whitespace-pre-wrap rounded-lg border border-[#e7e7dd] bg-(--cream) p-3 text-(--ink)">
                  {detail.notes ?? "—"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editing !== null} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal tracking-tight text-(--ink)">
              {editing ? "Modifier" : "Nouvelle"} réservation
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={form.telephone}
                  onChange={(e) =>
                    setForm({ ...form, telephone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ville">Ville</Label>
                <Select
                  value={form.ville}
                  onValueChange={(v) => setForm({ ...form, ville: v })}
                >
                  <SelectTrigger id="ville">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {villes.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="site">Site</Label>
                <Input
                  id="site"
                  value={form.site}
                  onChange={(e) => setForm({ ...form, site: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date et heure</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={form.dateReservation}
                  onChange={(e) =>
                    setForm({ ...form, dateReservation: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TYPE_LABELS[t] ?? t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="statut">Statut</Label>
              <Select
                value={form.statut}
                onValueChange={(v) => setForm({ ...form, statut: v })}
              >
                <SelectTrigger id="statut">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s] ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button onClick={saveReservation}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
