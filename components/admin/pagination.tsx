"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pages, total, onChange }: PaginationProps) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-[#e7e7dd] bg-(--cream)/30 px-4 py-3">
      <p className="text-sm text-(--muted-foreground)">
        {total} résultat{total > 1 ? "s" : ""} · page {page} / {pages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
