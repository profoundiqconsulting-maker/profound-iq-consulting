from pathlib import Path
p=Path('/home/ubuntu/profound-iq-consulting/client/src/pages/CareerPath.tsx')
t=p.read_text()
needle='  return <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]"><TransformationNav active="careerpath" /><main'
print('normal return matches', t.count(needle))
if t.count(needle) != 1:
    raise SystemExit('unexpected normal return match count')
t=t.replace(needle,'  return <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]"><TransformationNav active="careerpath" /><CareerPathStepIndicator current={requestedStep === "assessment" ? "assessment" : "introduction"} /><main',1)
old='{assessmentStarted && <form onSubmit={submit}'
new='{isAssessmentStep && <aside className="fixed right-6 top-32 z-20 hidden w-64 border border-[#16243d]/15 bg-[#16243d] p-5 text-[#f7f3e8] shadow-lg lg:block" aria-label="CareerPath progress summary"><p className="eyebrow text-[#c9a34e]">Live overview</p><h2 className="display mt-2 text-2xl">Your pathway</h2><div className="mt-5 space-y-4 text-sm"><div><div className="flex items-center justify-between gap-3"><span className="text-[#c1cad7]">Assessment progress</span><strong>{overallCompletion}%</strong></div><div className="mt-2 h-2 bg-[#f7f3e8]/15"><div className="h-2 bg-[#c9a34e] transition-all" style={{ width: `${overallCompletion}%` }} /></div><p className="mt-2 text-xs text-[#c1cad7]">{answeredCount} of {data?.questions.length ?? 0} responses</p></div><div className="border-t border-[#f7f3e8]/15 pt-4"><p className="text-xs uppercase tracking-[.1em] text-[#c1cad7]">Payment status</p><p className="mt-1 font-semibold">{paymentState === "paid" ? "Verified" : paymentState === "verifying" ? "Verifying" : paymentState === "error" ? "Needs attention" : "Not started"}</p><p className="mt-1 text-xs text-[#c1cad7]">Secure Paystack checkout</p></div><div className="border-t border-[#f7f3e8]/15 pt-4"><p className="text-xs uppercase tracking-[.1em] text-[#c1cad7]">Current location</p><p className="mt-1 font-semibold">Module {modulePage + 1} of {grouped.length}</p><p className="mt-1 text-xs text-[#c1cad7]">{currentGroup?.name ?? "Preparing modules"}</p></div></div></aside>}{isAssessmentStep && <form onSubmit={submit}'
if t.count(old) != 1:
    raise SystemExit('unexpected form match count')
t=t.replace(old,new,1)
t=t.replace('  const currentGroup = grouped[modulePage];','  const isAssessmentStep = requestedStep === "assessment" || assessmentStarted;\n  const currentGroup = grouped[modulePage];',1)
t=t.replace('onClick={() => setAssessmentStarted(true)}','onClick={() => { setAssessmentStarted(true); setLocation("/careerpath/assessment"); }}',1)
t=t.replace('setAssessmentStarted(false); window.scrollTo','setAssessmentStarted(false); setLocation("/careerpath"); window.scrollTo',1)
p.write_text(t)
