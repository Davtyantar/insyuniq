"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] data-[state=open]:animate-fade-in",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** "blur" is a transparent, edge-to-edge panel over a heavily blurred backdrop — for lightboxes and other content that should float over the page instead of sitting on a solid panel. */
  variant?: "center" | "sheet" | "full" | "blur";
  hideClose?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, variant = "center", hideClose, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay
      className={cn(variant === "blur" && "bg-slate-950/35 backdrop-blur-xl")}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 border border-border bg-card shadow-pop focus:outline-none",
        variant === "center" &&
          "left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 data-[state=open]:animate-slide-up",
        variant === "sheet" &&
          cn(
            "inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl",
            // Phones and tablets: a real bottom-sheet reveal/dismiss (slides the whole sheet
            // off/onto screen). The only current user of this variant (FilterDrawer) is only
            // ever triggerable below `lg` — its desktop sidebar takes over at `lg` and up — so
            // the switch to the centered-modal style below has to happen at that same
            // breakpoint. Switching it any earlier (e.g. the old `sm`) left a dead zone between
            // that and `lg` where the trigger was still visible but this showed as a small
            // floating centered card instead of a bottom sheet.
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full data-[state=open]:duration-300 data-[state=open]:ease-out",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-full data-[state=closed]:duration-200 data-[state=closed]:ease-in",
            // lg+: it's a centered modal instead, so it keeps the original subtle fade/nudge —
            // sliding "to the bottom" would fly off center, which looks wrong for a modal.
            "lg:inset-x-auto lg:left-1/2 lg:top-1/2 lg:max-h-[86vh] lg:w-[560px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-xl",
            "lg:data-[state=open]:animate-slide-up lg:data-[state=closed]:animate-fade-out",
          ),
        variant === "full" && "inset-0 rounded-none border-0 bg-slate-950 p-0",
        variant === "blur" &&
          "inset-0 flex items-center justify-center rounded-none border-0 bg-transparent p-0 shadow-none data-[state=open]:animate-fade-in",
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            (variant === "full" || variant === "blur") &&
              "z-10 bg-card/80 text-foreground shadow-md backdrop-blur hover:bg-card",
          )}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Փակել</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 text-left", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
  );
}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
