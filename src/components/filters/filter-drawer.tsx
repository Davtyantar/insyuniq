"use client";

import { FilterPanel, type FilterPanelProps } from "@/components/filters/filter-panel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FilterDrawerProps extends Omit<FilterPanelProps, "variant"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Bottom sheet on phones, centred dialog on tablets and up. */
export function FilterDrawer({ open, onOpenChange, ...panelProps }: FilterDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="sheet" className="flex max-h-[92vh] flex-col p-0">
        <DialogHeader className="border-b border-border px-4 py-4">
          <DialogTitle>Ֆիլտրեր</DialogTitle>
        </DialogHeader>
        <FilterPanel
          {...panelProps}
          variant="drawer"
          onApply={() => {
            panelProps.onApply();
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
