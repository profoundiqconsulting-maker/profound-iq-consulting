import fs from "fs";

let content = fs.readFileSync("client/src/pages/AdminDashboard.tsx", "utf-8");

// Fix closing tag - find the exact one for OrganizationApprovalQueue
// It's the one right after "itemLabel="organization approval records""
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
  console.log("Closing pattern not found - trying without the trailing )}");
  const altClose = `    </section>
  );
}`;
  const altNewClose = `    </Section>
  );
}`;
  if (content.includes(altClose)) {
    content = content.replace(altClose, altNewClose);
    console.log("Fixed with alt closing pattern");
  } else {
    console.log("Alt closing not found either");
  }
}

// Fix header and grid - find the one with "Organization review queue"
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
  // Find all occurrences of "Organization review queue"
  let idx = content.indexOf("Organization review queue");
  while (idx !== -1) {
    console.log(`Found at ${idx}:`);
    console.log(JSON.stringify(content.substring(idx, idx + 300)));
    idx = content.indexOf("Organization review queue", idx + 1);
  }
}

fs.writeFileSync("client/src/pages/AdminDashboard.tsx", content, "utf-8");
