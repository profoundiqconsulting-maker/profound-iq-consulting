// @profound-iq/ui — versioned internal UI component library
// Canonical primitives live in client/src/components/ui; this barrel
// re-exports them so public and admin surfaces stay in sync.
// Version: see VERSION (1.0.0)

export { VERSION } from "./version.js";

export { Button, buttonVariants } from "../../client/src/components/ui/button.js";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "../../client/src/components/ui/card.js";
export { Badge, badgeVariants } from "../../client/src/components/ui/badge.js";
export { Separator } from "../../client/src/components/ui/separator.js";
export { Input } from "../../client/src/components/ui/input.js";
export { Textarea } from "../../client/src/components/ui/textarea.js";
export { Label } from "../../client/src/components/ui/label.js";
export { Spinner } from "../../client/src/components/ui/spinner.js";
export { Skeleton } from "../../client/src/components/ui/skeleton.js";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../../client/src/components/ui/dialog.js";
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "../../client/src/components/ui/sheet.js";
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "../../client/src/components/ui/popover.js";
export { Toggle, toggleVariants } from "../../client/src/components/ui/toggle.js";
export { ToggleGroup, ToggleGroupItem } from "../../client/src/components/ui/toggle-group.js";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "../../client/src/components/ui/tabs.js";
export { Progress } from "../../client/src/components/ui/progress.js";
export { ProgressRing } from "../../client/src/components/ui/progress-ring.js";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../../client/src/components/ui/tooltip.js";
export { Toaster } from "../../client/src/components/ui/sonner.js";
