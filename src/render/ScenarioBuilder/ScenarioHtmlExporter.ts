import { BusinessScenario, ScenarioSentence, ScenarioPoint } from '../../types/index';

export function generateScenarioHTML(scenario: BusinessScenario, allPoints: ScenarioPoint[] = []): string {
  // Helpers
  const escapeHTML = (str?: string) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const getPointsByType = (type: string) => 
    (scenario.scenarioPoints || []).filter((p: any) => p.type === type || p.pointType === type);

  const mandatoryPoints = getPointsByType('mandatory');
  const keyPoints = getPointsByType('key_point');
  const qualificationPoints = getPointsByType('qualification');

  const getPointName = (id: string) => {
    const pt: any = scenario.scenarioPoints?.find((p: any) => p.id === id || p.pointId === id) || 
               allPoints.find((p: any) => p.id === id || p.pointId === id);
    return pt ? (pt.name || pt.pointName) : 'Poin Terkait';
  };

  const renderSentences = () => {
    if (!scenario.sentences || scenario.sentences.length === 0) return '<p style="color:#666;font-style:italic;">Belum ada naskah dialog.</p>';

    return scenario.sentences.map((sen, index) => {
      const isAgent = sen.speaker === 'agent';
      const speakerName = isAgent ? 'AGEN' : 'NASABAH';
      const bgColor = isAgent ? '#f0fdf4' : '#eef2ff';
      const borderColor = isAgent ? '#bbf7d0' : '#c7d2fe';

      let headerExtra = '';
      if (isAgent && sen.intentIds && sen.intentIds.length > 0) {
        headerExtra = `<span style="font-size:10px;color:#666;font-weight:normal;margin-left:8px;">[ Intensi: ${escapeHTML(sen.intentIds[0])} ]</span>`;
      } else if (!isAgent && sen.responseType) {
        const respMap: any = { general: 'Umum', objection: 'Keberatan', question: 'Pertanyaan' };
        headerExtra = `<span style="font-size:10px;color:#666;font-weight:normal;margin-left:8px;">[ Respons: ${respMap[sen.responseType] || 'Umum'} ]</span>`;
      }

      let prefaceHtml = '';
      if (sen.preface) {
        prefaceHtml = `
          <div style="font-size:12px; color:#92400e; margin-bottom:8px; display:flex; align-items:flex-start; font-weight:600;">
            <span style="font-size:14px; margin-right:6px; line-height:1.2;">💡</span>
            <span style="font-style:italic; line-height:1.4;">${escapeHTML(sen.preface)}</span>
          </div>
        `;
      }

      let pointTags = '';
      if (isAgent && (sen as any).scenarioPointIds && (sen as any).scenarioPointIds.length > 0) {
        const pointsList = (sen as any).scenarioPointIds.map((pid: string) => 
          `<span style="display:inline-block;background:#f3f4f6;border:1px solid #e5e7eb;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;color:#374151;margin-right:4px;">✓ ${escapeHTML(getPointName(pid))}</span>`
        ).join('');
        pointTags = `<div style="margin-top:8px;">${pointsList}</div>`;
      }

      let postscriptHtml = '';
      if (sen.postscript) {
        postscriptHtml = `
          <div style="font-size:12px; color:#475569; margin-top:12px; padding-top:8px; border-top:1px dashed ${borderColor}; display:flex; align-items:flex-start; font-weight:600;">
            <span style="font-size:14px; margin-right:6px; line-height:1.2;">📝</span>
            <span style="font-style:italic; line-height:1.4;">${escapeHTML(sen.postscript)}</span>
          </div>
        `;
      }

      return `
        <div style="margin-bottom:16px; page-break-inside: avoid;">
          <div style="background-color:${bgColor}; border:1px solid ${borderColor}; border-radius:8px; padding:12px;">
            <div style="font-size:11px; font-weight:bold; margin-bottom:8px; color:#333; text-transform:uppercase;">
              ${speakerName} ${headerExtra}
            </div>
            ${prefaceHtml}
            <div style="font-size:14px; line-height:1.5; color:#111;">
              "${escapeHTML(sen.text)}"
            </div>
            ${pointTags}
            ${postscriptHtml}
          </div>
        </div>
      `;
    }).join('');
  };

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Cetak Skenario - ${escapeHTML(scenario.title)}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          color: #1e293b;
          margin: 0;
          padding: 20px 40px;
          background: #fff;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none !important; }
        }
        h1 { font-size: 24px; margin-bottom: 8px; color: #0f172a; }
        .meta { font-size: 13px; color: #64748b; margin-bottom: 24px; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .badge-sales { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; }
        .badge-verification { background: #ccfbf1; color: #0f766e; border: 1px solid #99f6e4; }
        
        .section-title { font-size: 16px; font-weight: bold; color: #0f172a; margin: 24px 0 12px 0; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
        
        .points-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; page-break-inside: avoid; }
        .point-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
        .point-box h3 { font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; color: #475569; }
        .point-box ul { margin: 0; padding-left: 20px; font-size: 13px; }
        .point-box li { margin-bottom: 4px; }
        
        .dialogue-container { margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="no-print" style="background:#f8fafc; padding:12px; text-align:center; margin-bottom:24px; border:1px dashed #cbd5e1; border-radius:8px;">
        <p style="margin:0 0 8px 0; font-size:14px; font-weight:bold; color:#333;">Pratinjau Cetak Skenario</p>
        <button onclick="window.print()" style="background:#4f46e5; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; font-family:'Inter',sans-serif;">🖨️ Cetak / Simpan PDF Sekarang</button>
      </div>

      <h1>${escapeHTML(scenario.title)}</h1>
      <div class="meta">
        <span class="badge ${scenario.category === 'sales' ? 'badge-sales' : 'badge-verification'}">
          KATEGORI: ${scenario.category === 'sales' ? 'SALES' : 'VERIFIKASI'}
        </span>
        <div style="margin-top: 8px; font-size: 14px;">${escapeHTML(scenario.description) || '<i>Tidak ada deskripsi</i>'}</div>
      </div>

      ${(mandatoryPoints.length + keyPoints.length + qualificationPoints.length) > 0 ? `
        <div class="section-title">Konteks & Poin Penting</div>
        <div class="points-grid">
          ${mandatoryPoints.length > 0 ? `
            <div class="point-box" style="border-top: 3px solid #ef4444;">
              <h3>Poin Wajib Skenario</h3>
              <ul>${mandatoryPoints.map((p: any) => `<li>${escapeHTML(p.name || p.pointName)}</li>`).join('')}</ul>
            </div>
          ` : ''}
          
          ${keyPoints.length > 0 ? `
            <div class="point-box" style="border-top: 3px solid #f59e0b;">
              <h3>Poin Nilai Jual / Penawaran</h3>
              <ul>${keyPoints.map((p: any) => `<li>${escapeHTML(p.name || p.pointName)}</li>`).join('')}</ul>
            </div>
          ` : ''}
          
          ${qualificationPoints.length > 0 ? `
            <div class="point-box" style="border-top: 3px solid #14b8a6;">
              <h3>Kriteria Profil Nasabah</h3>
              <ul>${qualificationPoints.map((p: any) => `<li>${escapeHTML(p.name || p.pointName)}</li>`).join('')}</ul>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div class="section-title">Naskah Skenario</div>
      <div class="dialogue-container">
        ${renderSentences()}
      </div>

    </body>
    </html>
  `;
}

export function openPrintDialog(scenario: BusinessScenario, allPoints: ScenarioPoint[] = []) {
  const htmlContent = generateScenarioHTML(scenario, allPoints);
  
  // Open a new window
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('Pop-up terblokir! Izinkan pop-up untuk mencetak skenario.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
