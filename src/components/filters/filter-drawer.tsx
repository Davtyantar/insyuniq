"use client";

import { FilterPanel, type DistributiveOmit, type FilterPanelProps } from "@/components/filters/filter-panel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type FilterDrawerProps = DistributiveOmit<FilterPanelProps, "variant"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Bottom sheet on phones, centred dialog on tablets and up. */
export function FilterDrawer(props: FilterDrawerProps) {
  const { open, onOpenChange, onApply } = props;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="sheet" className="flex max-h-[92vh] flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4">
          <DialogTitle>Ֆիլտրեր</DialogTitle>
        </DialogHeader>
        <FilterPanel
          {...props}
          variant="drawer"
          onApply={() => {
            onApply();
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
