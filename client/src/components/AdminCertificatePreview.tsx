import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Download,
  Eye,
  ImageDown,
  Loader2,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  Undo2,
  Redo2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { downloadCertificatePng } from "@/lib/certificatePng";
import { courseCatalog } from "@shared/courseCatalog";
import { buildCertificateDownloadChartData } from "@shared/certificateAnalytics";
import "@/certificate-print.css";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type FieldConfig = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  visible?: boolean;
  text?: string;
};
type FieldLayout = Record<string, FieldConfig>;
const defaultLayout: FieldLayout = {
  logo: { x: 735, y: 24, width: 530, height: 265, visible: true },
  recipient: { x: 1000, y: 795, visible: true },
  course: { x: 1000, y: 965, visible: true },
  issuedDate: { x: 210, y: 1195, visible: true },
  certificateId: { x: 1450, y: 1195, visible: true },
  signature: { x: 865, y: 1080, width: 270, height: 125, visible: true },
  trainerName: { x: 1000, y: 1260, visible: true },
  trainerTitle: { x: 1000, y: 1298, visible: true },
  qrCode: { x: 1450, y: 980, visible: true },
  seal: { x: 1785, y: 170, visible: true },
  signatureRule: { x: 800, y: 1218, visible: true },
  waveTopOne: { visible: true },
  waveTopTwo: { visible: true },
  waveTopGold: { visible: true },
  waveBottomOne: { visible: true },
  waveBottomGold: { visible: true },
  waveBottomWhite: { visible: true },
  certificateLabel: { x: 1000, y: 505, visible: true },
  completionLabel: { x: 1000, y: 580, visible: true },
  awardLabel: { x: 1000, y: 695, visible: true },
  completionText: { x: 1000, y: 885, visible: true },
  issuedLabel: { x: 210, y: 1155, visible: true },
  idLabel: { x: 1450, y: 1155, visible: true },
};
const fieldLabels: Record<string, string> = {
  logo: "Site logo",
  recipient: "Respondent name",
  course: "Course title",
  issuedDate: "Issue date",
  certificateId: "Certificate ID",
  signature: "Signature",
  trainerName: "Trainer name",
  trainerTitle: "Trainer title",
  qrCode: "QR verification code",
  seal: "Achievement seal",
  signatureRule: "Signature rule",
  waveTopOne: "Top wave 1",
  waveTopTwo: "Top wave 2",
  waveTopGold: "Top gold wave",
  waveBottomOne: "Bottom wave 1",
  waveBottomGold: "Bottom gold wave",
  waveBottomWhite: "Bottom white wave",
  certificateLabel: "Certificate heading",
  completionLabel: "Completion heading",
  awardLabel: "Award label",
  completionText: "Completion sentence",
  issuedLabel: "Issue-date label",
  idLabel: "Certificate-ID label",
};

function applyLiveLayout(svg: string, layout: FieldLayout) {
  return Object.entries(layout).reduce((output, [field, config]) => {
    const marker = `data-field="${field}"`;
    const markerIndex = output.indexOf(marker);
    if (markerIndex < 0) return output;
    const tagStart = output.lastIndexOf("<", markerIndex);
    const tagEnd = output.indexOf(">", markerIndex);
    if (tagStart < 0 || tagEnd < 0) return output;
    let tag = output.slice(tagStart, tagEnd + 1);
    if (config.visible === false)
      tag = tag.replace(/^<([a-z]+)/, '<$1 display="none"');
    if (typeof config.x === "number")
      tag = tag.replace(/\sx="[^\"]*"/, ` x="${config.x}"`);
    if (typeof config.y === "number")
      tag = tag.replace(/\sy="[^\"]*"/, ` y="${config.y}"`);
    if (
      (typeof config.x === "number" || typeof config.y === "number") &&
      !/\sx="/.test(tag) &&
      !/\sy="/.test(tag)
    ) {
      const x = config.x ?? 0;
      const y = config.y ?? 0;
      if (/\stransform="/.test(tag))
        tag = tag.replace(
          /\stransform="[^"]*"/,
          ` transform="translate(${x} ${y})"`
        );
      else if (tag.endsWith("/>"))
        tag = tag.replace(/\/>$/, ` transform="translate(${x} ${y})"/>`);
      else tag = tag.replace(/>$/, ` transform="translate(${x} ${y})">`);
    }
    if (typeof config.width === "number")
      tag = tag.replace(/\swidth="[^\"]*"/, ` width="${config.width}"`);
    if (typeof config.height === "number")
      tag = tag.replace(/\sheight="[^\"]*"/, ` height="${config.height}"`);
    let next = output.slice(0, tagStart) + tag + output.slice(tagEnd + 1);
    if (typeof config.text === "string" && tag.startsWith("<text")) {
      const contentStart = next.indexOf(">", tagStart) + 1;
      const contentEnd = next.indexOf("</text>", contentStart);
      if (contentStart > 0 && contentEnd > contentStart)
        next =
          next.slice(0, contentStart) +
          config.text.replace(
            /[&<>\"']/g,
            value =>
              ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&apos;",
              })[value] ?? value
          ) +
          next.slice(contentEnd);
    }
    return next;
  }, svg);
}

export function AdminCertificatePreview() {
  const [courseTitle, setCourseTitle] = useState(
    courseCatalog[0]?.title ?? "Leadership and Strategic Growth"
  );
  const [trainerName, setTrainerName] = useState("Stephen Mwihaki");
  const [trainerTitle, setTrainerTitle] = useState("Managing Director");
  const [signatureDataUri, setSignatureDataUri] = useState("");
  const [fieldLayout, setFieldLayout] = useState<FieldLayout>(defaultLayout);
  const [layoutHistory, setLayoutHistory] = useState<FieldLayout[]>([]);
  const [layoutFuture, setLayoutFuture] = useState<FieldLayout[]>([]);
  const [selectedField, setSelectedField] = useState("recipient");
  const [downloading, setDownloading] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [previewHash, setPreviewHash] = useState("");
  const [snapshots, setSnapshots] = useState<
    Array<{ id: string; createdAt: string; layout: FieldLayout; svg: string }>
  >([]);
  const [customElementUri, setCustomElementUri] = useState("");
  const [usageFromDate, setUsageFromDate] = useState("");
  const [usageToDate, setUsageToDate] = useState("");
  const dragRef = useRef<{
    field: string;
    mode: "move" | "resize";
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startLayout: FieldLayout;
  } | null>(null);
  const usageInput = useMemo(
    () => ({
      fromDate: usageFromDate || undefined,
      toDate: usageToDate || undefined,
    }),
    [usageFromDate, usageToDate]
  );
  const settings = trpc.admin.certificateSettings.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const usage = trpc.admin.certificateUsageAnalytics.useQuery(usageInput, {
    retry: false,
    refetchInterval: 30000,
  });
  const publicShares = trpc.admin.publicCertificateShareAnalytics.useQuery(
    usageInput,
    { retry: false, refetchInterval: 30000 }
  );
  const exportUsage = trpc.admin.exportCertificateUsageAnalytics.useQuery(
    usageInput,
    { enabled: false }
  );
  const exportGenerations =
    trpc.admin.exportCertificateGenerationRecords.useQuery(usageInput, {
      enabled: false,
    });
  const exportPdf = trpc.admin.certificatePdfPreview.useMutation({
    onError: error =>
      toast.error("Could not create PDF preview", {
        description: error.message,
      }),
  });
  const downloadGenerationCsv = async () => {
    const result = await exportGenerations.refetch();
    if (!result.data) return;
    const url = URL.createObjectURL(
      new Blob([result.data.data], { type: result.data.contentType })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.data.filename;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Certificate generation records exported");
  };
  const downloadUsageCsv = async () => {
    const result = await exportUsage.refetch();
    if (!result.data) return;
    const url = URL.createObjectURL(
      new Blob([result.data.data], { type: result.data.contentType })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.data.filename;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Certificate analytics exported");
  };
  const chartData = useMemo(
    () => buildCertificateDownloadChartData(usage.data?.daily ?? []),
    [usage.data]
  );
  const platformDownloads = chartData.byPlatform;
  const dailyDownloads = chartData.daily;
  const saveSettings = trpc.admin.saveCertificateSettings.useMutation({
    onSuccess: value => {
      setTrainerName(value.trainerName);
      setTrainerTitle(value.trainerTitle);
      setSignatureDataUri(value.signatureDataUri);
      setFieldLayout(
        (value.fieldLayout as FieldLayout | null) ?? defaultLayout
      );
      void preview.refetch();
      toast.success("Certificate settings saved");
    },
    onError: error =>
      toast.error("Could not save certificate settings", {
        description: error.message,
      }),
  });
  const preview = trpc.admin.certificatePreview.useQuery(
    { courseTitle },
    { staleTime: 30_000 }
  );
  const svgData = preview.data?.data ?? "";
  const liveSvgData = useMemo(
    () => (svgData ? applyLiveLayout(svgData, fieldLayout) : ""),
    [fieldLayout, svgData]
  );
  useEffect(() => {
    let cancelled = false;
    if (!liveSvgData) {
      setPreviewHash("");
      return;
    }
    void crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(liveSvgData))
      .then(buffer => {
        if (!cancelled)
          setPreviewHash(
            Array.from(new Uint8Array(buffer))
              .map(byte => byte.toString(16).padStart(2, "0"))
              .join("")
          );
      });
    return () => {
      cancelled = true;
    };
  }, [liveSvgData]);
  const svgSrc = useMemo(
    () =>
      liveSvgData
        ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(liveSvgData)}`
        : "",
    [liveSvgData]
  );
  const persistedCustomElements =
    (
      settings.data as
        | (typeof settings.data & { customElements?: Record<string, string> })
        | undefined
    )?.customElements ?? {};
  const customElementEntries = Object.entries({
    ...persistedCustomElements,
    ...(customElementUri ? { primary: customElementUri } : {}),
  });
  const editableLayout: FieldLayout = {
    ...defaultLayout,
    ...Object.fromEntries(
      customElementEntries.map(([name]) => [
        `custom:${name}`,
        { x: 100, y: 100, width: 240, height: 180, visible: true },
      ])
    ),
    ...fieldLayout,
  };
  const selected = editableLayout[selectedField] ?? {};

  useEffect(() => {
    if (!settings.data) return;
    setTrainerName(settings.data.trainerName);
    setTrainerTitle(settings.data.trainerTitle);
    setSignatureDataUri(settings.data.signatureDataUri);
    setFieldLayout(
      (settings.data.fieldLayout as FieldLayout | null) ?? defaultLayout
    );
  }, [settings.data]);
  const applyLayout = (next: FieldLayout) => {
    setLayoutHistory(history => [...history.slice(-19), fieldLayout]);
    setLayoutFuture([]);
    setFieldLayout(next);
  };
  const updateField = (patch: FieldConfig) =>
    applyLayout({
      ...fieldLayout,
      [selectedField]: { ...fieldLayout[selectedField], ...patch },
    });
  const undoLayout = () => {
    const previous = layoutHistory.at(-1);
    if (!previous) return;
    setLayoutFuture(future => [fieldLayout, ...future]);
    setFieldLayout(previous);
    setLayoutHistory(history => history.slice(0, -1));
  };
  const redoLayout = () => {
    const next = layoutFuture[0];
    if (!next) return;
    setLayoutHistory(history => [...history, fieldLayout]);
    setFieldLayout(next);
    setLayoutFuture(future => future.slice(1));
  };
  const resetLayout = () => applyLayout(defaultLayout);
  const saveSnapshot = () => {
    const snapshot = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      layout: fieldLayout,
      svg: liveSvgData,
    };
    setSnapshots(items => [snapshot, ...items].slice(0, 10));
    toast.success("Layout snapshot saved");
  };
  const restoreSnapshot = (snapshot: {
    layout: FieldLayout;
    createdAt?: string;
  }) => {
    if (
      !window.confirm(
        `Restore the certificate layout saved ${snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleString() : "in this snapshot"}? Unsaved layout changes will be replaced.`
      )
    )
      return;
    applyLayout(snapshot.layout);
    toast.success("Layout snapshot restored");
  };
  const beginAssetPointer = (
    event: React.PointerEvent<HTMLElement>,
    field: string,
    mode: "move" | "resize"
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      field,
      mode,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startLayout: fieldLayout,
    };
  };
  const moveAssetPointer = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const current = drag.startLayout[drag.field] ?? {};
    const scale = 2;
    const dx = (event.clientX - drag.startClientX) * scale;
    const dy = (event.clientY - drag.startClientY) * scale;
    if (drag.mode === "resize")
      updateField({
        width: Math.max(40, Math.min(2000, (current.width ?? 240) + dx)),
        height: Math.max(40, Math.min(1414, (current.height ?? 180) + dy)),
      });
    else
      updateField({
        x: Math.max(0, Math.min(2000, (current.x ?? 100) + dx)),
        y: Math.max(0, Math.min(1414, (current.y ?? 100) + dy)),
      });
  };
  const endAssetPointer = (event: React.PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };
  const removeField = () => updateField({ visible: false });
  const downloadSvg = () => {
    if (!liveSvgData) return;
    const link = document.createElement("a");
    link.href = svgSrc;
    link.download = "profound-iq-certificate-qa-preview.svg";
    link.click();
    toast.success("Certificate SVG preview downloaded");
  };
  const downloadPdf = async () => {
    setPdfDownloading(true);
    try {
      const result = await exportPdf.mutateAsync({ courseTitle });
      const bytes = Uint8Array.from(atob(result.data), character =>
        character.charCodeAt(0)
      );
      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob([bytes], { type: result.contentType })
      );
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      toast.success("Certificate PDF downloaded");
    } catch {
      /* mutation callback provides feedback */
    } finally {
      setPdfDownloading(false);
    }
  };
  const downloadPng = async () => {
    if (!liveSvgData) return;
    setDownloading(true);
    try {
      await downloadCertificatePng(
        liveSvgData,
        "profound-iq-certificate-qa-preview.png",
        2
      );
      toast.success("High-resolution PNG preview downloaded");
    } catch (error) {
      toast.error("Could not create PNG preview", {
        description: error instanceof Error ? error.message : "Please retry.",
      });
    } finally {
      setDownloading(false);
    }
  };
  const printPreview = () => {
    if (!liveSvgData) return;
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) {
      toast.error("Allow pop-ups to print the certificate preview");
      return;
    }
    popup.document.write(
      `<html><head><title>Profound IQ certificate preview</title><style>@page{size:${pageSize === "letter" ? "Letter" : "A4"} landscape;margin:0}html,body{margin:0;background:#fff}img{display:block;width:100vw;height:100vh;object-fit:contain;print-color-adjust:exact;-webkit-print-color-adjust:exact}</style></head><body><img alt="Certificate preview" src="${svgSrc}" /></body></html>`
    );
    popup.document.close();
    popup.focus();
    popup.print();
  };
  const readSignature = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Choose a PNG, JPEG, or WebP signature image");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSignatureDataUri(String(reader.result));
    reader.readAsDataURL(file);
  };
  const readCustomElement = (file: File) => {
    if (!(file.type === "image/svg+xml" || file.type.startsWith("image/"))) {
      toast.error("Choose an SVG, PNG, JPEG, or WebP element");
      return;
    }
    if (file.size > 2_000_000) {
      toast.error("Custom element must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCustomElementUri(String(reader.result));
      toast.success("Custom certificate element ready for preview");
    };
    reader.readAsDataURL(file);
  };

  return (
    <section
      className="border border-[var(--brand)]/70 bg-[#fffaf0] p-5 text-[var(--fg)] shadow-sm sm:p-6"
      aria-labelledby="admin-certificate-preview-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-[var(--brand)]">Quality control</p>
          <h2
            id="admin-certificate-preview-title"
            className="display mt-2 text-3xl"
          >
            Certificate preview & settings
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fg-muted)]">
            Move, hide, restore, or edit supported fields. Changes apply to
            future certificate generations after saving.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--brand)]">
          <Eye size={16} /> Sample data only
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border border-[#16243d]/15 bg-white p-3">
        <span className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
          Design versions
        </span>
        <button
          type="button"
          onClick={saveSnapshot}
          className="border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
        >
          Save snapshot
        </button>
        {snapshots.map(snapshot => (
          <button
            key={snapshot.id}
            type="button"
            onClick={() => restoreSnapshot(snapshot)}
            className="border border-[#16243d]/20 px-3 py-2 text-[10px] text-[var(--fg-muted)]"
          >
            <span className="flex items-center gap-2">
              <img
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(snapshot.svg)}`}
                alt="Saved certificate layout thumbnail"
                className="h-10 w-16 border border-[var(--brand)]/50 bg-white object-cover"
              />
              <span>
                <strong className="block text-left">Restore snapshot</strong>
                <span className="block text-left text-[9px]">
                  {new Date(snapshot.createdAt).toLocaleString()}
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand)]">
          Trainer name
          <input
            value={trainerName}
            onChange={event => setTrainerName(event.target.value)}
            className="mt-2 block w-full border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal tracking-normal outline-none focus:border-[var(--brand)]"
            maxLength={160}
          />
        </label>
        <label className="block text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand)]">
          Trainer title
          <input
            value={trainerTitle}
            onChange={event => setTrainerTitle(event.target.value)}
            className="mt-2 block w-full border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal tracking-normal outline-none focus:border-[var(--brand)]"
            maxLength={160}
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 border border-[#16243d]/25 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[.12em]">
          <Upload size={14} /> Add custom SVG/image
          <input
            type="file"
            accept="image/svg+xml,image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) readCustomElement(file);
            }}
          />
        </label>
        {customElementEntries.map(([name, uri]) => (
          <div
            key={name}
            className="flex items-center gap-2 border border-[#16243d]/15 bg-white p-2"
          >
            <div
              className="relative flex h-20 w-28 touch-none items-center justify-center overflow-hidden border border-dashed border-[var(--brand)] bg-[#f7f3e8]"
              onPointerDown={event => {
                setSelectedField(`custom:${name}`);
                beginAssetPointer(event, `custom:${name}`, "move");
              }}
              onPointerMove={moveAssetPointer}
              onPointerUp={endAssetPointer}
              onPointerCancel={endAssetPointer}
              title="Drag to position custom asset"
            >
              <img
                src={uri}
                alt={`Custom certificate element ${name}`}
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />
              <button
                type="button"
                aria-label={`Resize custom asset ${name}`}
                className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize bg-[var(--brand)]"
                onPointerDown={event => {
                  event.stopPropagation();
                  setSelectedField(`custom:${name}`);
                  beginAssetPointer(event, `custom:${name}`, "resize");
                }}
                onPointerMove={moveAssetPointer}
                onPointerUp={endAssetPointer}
                onPointerCancel={endAssetPointer}
              />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[.08em] text-[var(--fg-muted)]">
              Drag / resize
            </span>
          </div>
        ))}
        <label className="inline-flex cursor-pointer items-center gap-2 border border-[#16243d]/25 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[.12em]">
          <Upload size={14} /> Replace signature
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) readSignature(file);
            }}
          />
        </label>
        <span className="text-xs text-[var(--fg-muted)]">
          {signatureDataUri
            ? "A signature image is ready to save."
            : "Using the default signature until you save a replacement."}
        </span>
        <button
          type="button"
          onClick={() =>
            saveSettings.mutate({
              trainerName,
              trainerTitle,
              signatureDataUri:
                signatureDataUri || settings.data?.signatureDataUri || "",
              customElements: customElementUri
                ? { primary: customElementUri }
                : undefined,
              fieldLayout,
            })
          }
          disabled={
            saveSettings.isPending ||
            !trainerName.trim() ||
            !trainerTitle.trim() ||
            !(signatureDataUri || settings.data?.signatureDataUri)
          }
          className="inline-flex items-center gap-2 bg-[#16243d] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8] disabled:opacity-50"
        >
          <Save size={14} />{" "}
          {saveSettings.isPending ? "Saving…" : "Save settings"}
        </button>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[210px_1fr]">
        <div className="border border-[#16243d]/15 bg-white p-3">
          <p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--brand)]">
            Certificate fields
          </p>
          <div className="mt-3 space-y-2">
            {Object.keys(editableLayout).map(field => (
              <button
                key={field}
                type="button"
                draggable
                onDragStart={() => setSelectedField(field)}
                onClick={() => setSelectedField(field)}
                className={`flex w-full items-center justify-between border px-3 py-2 text-left text-xs ${selectedField === field ? "border-[var(--brand)] bg-[#fff5cf]" : "border-[#16243d]/10 bg-[#f7f3e8]"}`}
              >
                <span>{fieldLabels[field]}</span>
                <span className="text-[10px] text-[var(--fg-muted)]">
                  {fieldLayout[field]?.visible === false ? "Hidden" : "Visible"}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="border border-[#16243d]/15 bg-[#f7f3e8] p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--brand)]">
                Edit selected field
              </p>
              <h3 className="mt-1 text-lg font-bold">
                {fieldLabels[selectedField]}
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={undoLayout}
                disabled={!layoutHistory.length}
                className="inline-flex items-center gap-1 border border-[#16243d]/20 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
              >
                <Undo2 size={13} /> Undo
              </button>
              <button
                type="button"
                onClick={redoLayout}
                disabled={!layoutFuture.length}
                className="inline-flex items-center gap-1 border border-[#16243d]/20 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
              >
                <Redo2 size={13} /> Redo
              </button>
              <button
                type="button"
                onClick={resetLayout}
                className="inline-flex items-center gap-1 border border-[#16243d]/20 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
              >
                <RotateCcw size={13} /> Reset layout
              </button>
              <button
                type="button"
                onClick={removeField}
                className="inline-flex items-center gap-1 border border-red-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-red-700"
              >
                <Trash2 size={13} /> Hide field
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
              Horizontal position
              <input
                type="range"
                min="0"
                max="2000"
                value={selected.x ?? 0}
                onChange={event =>
                  updateField({ x: Number(event.target.value), visible: true })
                }
                className="mt-2 w-full accent-[var(--brand)]"
              />
              <span className="text-xs font-bold text-[var(--fg)]">
                {selected.x ?? 0}
              </span>
            </label>
            <label className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
              Vertical position
              <input
                type="range"
                min="0"
                max="1414"
                value={selected.y ?? 0}
                onChange={event =>
                  updateField({ y: Number(event.target.value), visible: true })
                }
                className="mt-2 w-full accent-[var(--brand)]"
              />
              <span className="text-xs font-bold text-[var(--fg)]">
                {selected.y ?? 0}
              </span>
            </label>
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs font-bold">
            <input
              type="checkbox"
              checked={selected.visible !== false}
              onChange={event => updateField({ visible: event.target.checked })}
              className="accent-[#a27e2e]"
            />{" "}
            Show field in future certificates
          </label>
          {![
            "recipient",
            "course",
            "issuedDate",
            "certificateId",
            "logo",
            "signature",
          ].includes(selectedField) && (
            <label className="mt-3 block text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
              Custom display text
              <input
                value={selected.text ?? ""}
                onChange={event => updateField({ text: event.target.value })}
                placeholder="Leave blank to use automatic value"
                className="mt-2 block w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal tracking-normal"
                maxLength={240}
              />
            </label>
          )}
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand)]">
          Course title
          <select
            value={courseTitle}
            onChange={event => setCourseTitle(event.target.value)}
            className="mt-2 block w-full border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal tracking-normal outline-none focus:border-[var(--brand)] sm:max-w-md"
          >
            {courseCatalog.slice(0, 30).map(course => (
              <option key={course.slug} value={course.title}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand)]">
          Print paper size
          <select
            value={pageSize}
            onChange={event =>
              setPageSize(event.target.value as "a4" | "letter")
            }
            className="mt-2 block w-full border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal tracking-normal outline-none focus:border-[var(--brand)]"
          >
            <option value="a4">A4 · landscape</option>
            <option value="letter">Letter · landscape</option>
          </select>
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-[var(--brand)]/50 bg-[#fffaf0] px-3 py-2 text-xs">
        <span className="font-black uppercase tracking-[.1em] text-[var(--brand)]">
          Artifact equality hash
        </span>
        <span
          className={`font-black uppercase tracking-[.1em] ${previewHash && preview.data?.artifactHash === previewHash ? "text-emerald-800" : "text-amber-700"}`}
        >
          {previewHash
            ? preview.data?.artifactHash === previewHash
              ? "Match"
              : "Mismatch"
            : "Checking…"}
        </span>
        <span className="break-all font-mono text-[10px] text-[var(--fg-muted)]">
          {previewHash || "Calculating…"}
        </span>
      </div>
      <div className="mt-5 overflow-auto border border-[#16243d]/15 bg-[#d7dbe2] p-2">
        <iframe
          title="Admin sample certificate preview"
          src={svgSrc}
          className="aspect-[2000/1414] h-auto min-h-[260px] origin-top-left bg-white transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%` }}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 border border-[#16243d]/20 bg-white px-2 py-1">
          <span className="px-2 text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
            Preview {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() =>
              setZoom(value =>
                Math.max(0.75, Number((value - 0.25).toFixed(2)))
              )
            }
            disabled={zoom <= 0.75}
            className="p-2 disabled:opacity-40"
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            aria-label="Reset zoom"
            onClick={() => setZoom(1)}
            className="px-2 text-[10px] font-black uppercase tracking-[.1em]"
          >
            Reset
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() =>
              setZoom(value =>
                Math.min(1.75, Number((value + 0.25).toFixed(2)))
              )
            }
            disabled={zoom >= 1.75}
            className="p-2 disabled:opacity-40"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={!liveSvgData}
            onClick={downloadSvg}
            className="inline-flex items-center gap-2 border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] disabled:opacity-50"
          >
            <Download size={14} /> Download SVG
          </button>
          <button
            type="button"
            disabled={!liveSvgData || downloading}
            onClick={() => void downloadPng()}
            className="inline-flex items-center gap-2 bg-[var(--brand)] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[var(--brand-fg)] disabled:opacity-50"
          >
            <ImageDown size={14} />{" "}
            {downloading ? "Rendering PNG…" : "Download PNG"}
          </button>
          <button
            type="button"
            disabled={!liveSvgData || pdfDownloading}
            onClick={() => void downloadPdf()}
            className="inline-flex items-center gap-2 bg-[#16243d] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8] disabled:opacity-50"
          >
            {pdfDownloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}{" "}
            {pdfDownloading ? "Rendering PDF…" : "Download PDF"}
          </button>
          <button
            type="button"
            disabled={!liveSvgData}
            onClick={printPreview}
            className="inline-flex items-center gap-2 border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] disabled:opacity-50"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>
      <div className="mt-5 border border-[#16243d]/15 bg-white p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={15} className="text-[var(--brand)]" />
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--brand)]">
                Certificate usage observatory
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--fg-muted)]">
              Filter verified learner activity by UTC date range.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-[9px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
              From
              <input
                type="date"
                value={usageFromDate}
                onChange={event => setUsageFromDate(event.target.value)}
                className="ml-1 border border-[#16243d]/20 px-2 py-1 text-xs font-normal tracking-normal"
              />
            </label>
            <label className="text-[9px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
              To
              <input
                type="date"
                value={usageToDate}
                onChange={event => setUsageToDate(event.target.value)}
                className="ml-1 border border-[#16243d]/20 px-2 py-1 text-xs font-normal tracking-normal"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setUsageFromDate("");
                setUsageToDate("");
              }}
              className="border border-[#16243d]/20 px-2 py-2 text-[9px] font-black uppercase tracking-[.1em]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => void downloadUsageCsv()}
              disabled={exportUsage.isFetching}
              className="border border-[#16243d]/20 px-2 py-2 text-[9px] font-black uppercase tracking-[.1em]"
            >
              {exportUsage.isFetching ? "Exporting…" : "Export usage CSV"}
            </button>
            <button
              type="button"
              onClick={() => void downloadGenerationCsv()}
              disabled={exportGenerations.isFetching}
              className="border border-[#16243d]/20 px-2 py-2 text-[9px] font-black uppercase tracking-[.1em]"
            >
              {exportGenerations.isFetching
                ? "Exporting…"
                : "Export generation CSV"}
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="border-t-2 border-[var(--brand)] bg-[#fffaf0] p-3">
            <p className="text-[9px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
              Downloads in range
            </p>
            <p className="mt-2 text-3xl font-bold">
              {usage.data?.totals.downloads ?? 0}
            </p>
          </div>
          <div className="border-t-2 border-[#16243d]/30 bg-[#f7f3e8] p-3">
            <p className="text-[9px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
              Shares in range
            </p>
            <p className="mt-2 text-3xl font-bold">
              {usage.data?.totals.shares ?? 0}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.12em] text-[var(--fg-muted)]">
              Downloads by platform
            </p>
            {platformDownloads.length ? (
              <div className="mt-3 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={platformDownloads}
                    layout="vertical"
                    margin={{ left: 8, right: 12 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#d9deea" />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      stroke="#475569"
                      fontSize={10}
                    />
                    <YAxis
                      type="category"
                      dataKey="platform"
                      width={62}
                      stroke="#475569"
                      fontSize={10}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--popover-foreground)",
                        color: "var(--popover-foreground)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Downloads"
                      fill="var(--brand)"
                      radius={[0, 2, 2, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-3 border border-dashed border-[#16243d]/20 p-4 text-xs text-[var(--fg-muted)]">
                No certificate downloads in this range.
              </p>
            )}
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.12em] text-[var(--fg-muted)]">
              Daily download trend
            </p>
            {dailyDownloads.length ? (
              <div className="mt-3 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyDownloads}
                    margin={{ left: 0, right: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#d9deea" />
                    <XAxis dataKey="day" stroke="#475569" fontSize={10} />
                    <YAxis
                      allowDecimals={false}
                      stroke="#475569"
                      fontSize={10}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--popover-foreground)",
                        color: "var(--popover-foreground)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Downloads"
                      stroke="#16243d"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "var(--brand)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-3 border border-dashed border-[#16243d]/20 p-4 text-xs text-[var(--fg-muted)]">
                No daily download activity in this range.
              </p>
            )}
          </div>
        </div>
        <div className="mt-5 border-t border-[var(--brand)]/50 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.12em] text-[var(--brand)]">
                Public verification shares
              </p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Native and platform shares recorded from public certificate
                verification pages.
              </p>
            </div>
            <span className="text-2xl font-bold text-[var(--fg)]">
              {publicShares.data?.total ?? 0}
            </span>
          </div>
          {publicShares.data?.byPlatform.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {publicShares.data.byPlatform.map(item => (
                <span
                  key={item.platform}
                  className="border border-[#16243d]/15 bg-[#fffaf0] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]"
                >
                  {item.platform}: {item.count}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 border border-dashed border-[#16243d]/20 p-3 text-xs text-[var(--fg-muted)]">
              No public verification shares in this range.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
