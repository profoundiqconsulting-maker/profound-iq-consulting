import fs from "fs";

const content = fs.readFileSync("client/src/pages/AdminDashboard.tsx", "utf-8");

// Fix closing tag - use the actual context
const oldClose = `      />
    </section>
  );
}`;

const newClose = `      />
    </Section>
  );
}`;

if (content.includes(oldClose)) {
  content = content.replace(oldClose, newClose);
  console.log("Fixed OrganizationApprovalQueue closing tag");
} else {
  console.log("Closing pattern not found");
}

// Fix opening tag - use a simpler approach, just replace the section opening
const oldOpenStart = `<section className="mt-14 border border-[#16243d]/15 bg-white/45 p-5 sm:p-6">`;
const newOpenStart = `<Section
      eyebrow="Organization review queue"
      title="Approve with confidence."
      description="Monitor forwarded report requests, respond before invitations expire, and export a filtered compliance history."
      actions={
        <button
          type="button"
          onClick={downloadCsv}
          disabled={exportHistory.isFetching}
          className="inline-flex items-center justify-center gap-2 border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em]"
        >
          <Download size={14} />{" "}
          {exportHistory.isFetching ? "Preparing\u2026" : "Export history"}
        </button>
      }
      className="mt-14"
    >`;

if (content.includes(oldOpenStart)) {
  content = content.replace(oldOpenStart, newOpenStart);
  console.log("Fixed OrganizationApprovalQueue opening tag");
} else {
  console.log("Opening start pattern not found");
}

// Also need to fix the div that follows - it currently starts with <div className="flex flex-col..."> but should start with <div className="grid gap-3 md:grid-cols-4">
// The original has the header content inside a div, then a <div className="mt-6 grid gap-3 md:grid-cols-4">
// We need to remove the header div since it's now in Section props

// Let's find and replace the header div + the mt-6 grid div
const oldHeaderAndGrid = `      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-[#7d5e1e]">Organization review queue</p>
          <h2 className="display mt-3 text-3xl">Approve with confidence.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#16243d]">
            Monitor forwarded report requests, respond before invitations
            expire, and export a filtered compliance history.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={exportHistory.isFetching}
          className="inline-flex items-center justify-center gap-2 border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em]"
        >
          <Download size={14} />{" "}
          {exportHistory.isFetching ? "Preparing\u2026" : "Export history"}
        </button>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">`;

const newHeaderAndGrid = `      <div className="grid gap-3 md:grid-cols-4">`;

if (content.includes(oldHeaderAndGrid)) {
  content = content.replace(oldHeaderAndGrid, newHeaderAndGrid);
  console.log("Fixed OrganizationApprovalQueue header and grid");
} else {
  console.log("Header and grid pattern not found");
  // Find what's there
  const idx = content.indexOf(
    'className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"'
  );
  if (idx > 0) {
    console.log("Context at header:");
    console.log(JSON.stringify(content.substring(idx, idx + 500)));
  }
}

fs.writeFileSync("client/src/pages/AdminDashboard.tsx", content, "utf-8");
