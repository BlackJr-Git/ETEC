"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Trash2,
  Eye,
  Search,
  Inbox,
  Phone,
  Mail,
  MapPin,
  FileClock,
  Clock,
  CheckCircle2,
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

type Demande = {
  id: string;
  type: string;
  nom: string;
  telephone: string;
  email: string | null;
  ville: string;
  site: string | null;
  message: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  notes: string | null;
};

type DemandeStats = {
  total: number;
  byStatus: Record<string, number>;
  byType: { label: string; value: number }[];
  byVille: { label: string; value: number }[];
  nouvelles: number;
};

const statuses = ["nouveau", "en_cours", "traite", "archive"];
const types = [
  "achat",
  "funerailles",
  "diaspora",
  "renseignement",
  "reclamation",
];
const villes = ["Kinshasa", "Lubumbashi"];

const TYPE_LABELS: Record<string, string> = {
  achat: "Achat d’espace",
  funerailles: "Funérailles",
  diaspora: "Diaspora",
  renseignement: "Renseignement",
  reclamation: "Réclamation",
};

const STATUS_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  traite: "Traité",
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

export default function AdminDemandesPage() {
  const [rows, setRows] = useState<Demande[]>([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [ville, setVille] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Demande | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [stats, setStats] = useState<DemandeStats | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(meta.page));
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (ville) params.set("ville", ville);
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/demandes?${params.toString()}`);
    const data = (await res.json()) as {
      data: Demande[];
      meta: { page: number; pages: number; total: number };
    };
    setRows(data.data ?? []);
    setMeta(data.meta ?? { page: 1, pages: 1, total: 0 });
    setSelected([]);
    setLoading(false);
  }, [meta.page, status, type, ville, search]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    params.set("page", String(meta.page));
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (ville) params.set("ville", ville);
    if (search) params.set("search", search);

    fetch(`/api/admin/demandes?${params.toString()}`)
      .then(
        (res) =>
          res.json() as Promise<{
            data: Demande[];
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
  }, [meta.page, status, type, ville, search]);

  useEffect(() => {
    fetch("/api/admin/demandes/stats")
      .then((res) => res.json() as Promise<DemandeStats>)
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
    const res = await fetch("/api/admin/demandes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, status: newStatus }),
    });
    if (res.ok) refresh();
  }

  async function deleteRow(id: string) {
    if (!confirm("Supprimer cette demande ?")) return;
    const res = await fetch(`/api/admin/demandes/${id}`, { method: "DELETE" });
    if (res.ok) refresh();
  }

  return (
    <div>
      <PageHeader
        title="Demandes"
        description="Liste des demandes reçues depuis le site, avec les coordonnées et le statut de traitement."
      />

      <StatsSummary
        items={[
          {
            label: "Total demandes",
            value: stats?.total ?? "—",
            subLabel: "toutes périodes",
            icon: Inbox,
          },
          {
            label: "Nouvelles",
            value: stats?.nouvelles ?? "—",
            subLabel: "à traiter en priorité",
            icon: FileClock,
          },
          {
            label: "En cours",
            value: stats?.byStatus.en_cours ?? 0,
            subLabel: "en traitement",
            icon: Clock,
          },
          {
            label: "Traitées",
            value: stats?.byStatus.traite ?? 0,
            subLabel: "dont archivées",
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
              placeholder="Nom, e-mail, téléphone, message…"
              className="bg-white pl-9"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 md:w-[28rem]">
          <div>
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
          <div>
            <label className="mb-1.5 block text-xs font-medium text-(--muted-foreground)">
              Type
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABELS[t] ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-(--muted-foreground)">
              Ville
            </label>
            <Select value={ville} onValueChange={setVille}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes</SelectItem>
                {villes.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              Marquer {s}
            </Button>
          ))}
        </div>
      )}

      {rows.length === 0 && !loading ? (
        <EmptyState
          icon={Inbox}
          title="Aucune demande"
          description="Les demandes envoyées depuis le site apparaîtront ici. Utilisez les filtres pour afficher les archives."
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
                <TableHead>Référence</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Ville / Site</TableHead>
                <TableHead>Mise à jour</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
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
                    <TableCell className="font-mono text-xs text-(--ink)">
                      {row.id}
                    </TableCell>
                    <TableCell className="text-sm text-(--muted-foreground)">
                      {formatDate(row.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-(--ink)">
                      {TYPE_LABELS[row.type] ?? row.type}
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
                      ) : (
                        <a
                          href={`tel:${row.telephone}`}
                          className="inline-flex items-center gap-1 text-sm text-(--ink) hover:text-[#9c8a54]"
                        >
                          <Phone size={12} />
                          {row.telephone}
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-(--ink)">
                      <span className="inline-flex items-center gap-1">
                        <MapPin
                          size={12}
                          className="text-(--muted-foreground)"
                        />
                        {row.ville}
                      </span>
                      {row.site && (
                        <span className="block text-xs text-(--muted-foreground)">
                          {row.site}
                        </span>
                      )}
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
                        onClick={() => setDetail(row)}
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
              Détails de la demande
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-3">
                <span className="text-(--muted-foreground)">Référence</span>
                <span className="font-mono text-xs">{detail.id}</span>
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
                <span className="text-(--muted-foreground)">Reçue le</span>
                <span>{formatDateTime(detail.createdAt)}</span>
                <span className="text-(--muted-foreground)">Mise à jour</span>
                <span>{formatDateTime(detail.updatedAt)}</span>
                <span className="text-(--muted-foreground)">Statut</span>
                <span>
                  <StatusBadge status={detail.status} />
                </span>
              </div>
              <div>
                <span className="text-(--muted-foreground)">Message</span>
                <p className="mt-1.5 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg border border-[#e7e7dd] bg-(--cream) p-3 text-(--ink)">
                  {detail.message}
                </p>
              </div>
              {detail.notes && (
                <div>
                  <span className="text-(--muted-foreground)">
                    Notes internes
                  </span>
                  <p className="mt-1.5 whitespace-pre-wrap rounded-lg border border-[#e7e7dd] bg-(--cream) p-3 text-(--ink)">
                    {detail.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
