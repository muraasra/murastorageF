/**
 * Composable unifié pour la génération de PDFs (factures & reçus).
 * Ouvre une fenêtre d'impression — compatible imprimante 80mm et A4.
 */

interface EntrepriseInfo {
  nom: string; adresse: string; telephone: string; email: string
  ville: string; pays: string; numero_fiscal: string; logo: string | null; boutique_nom: string
}

function resolveEntrepriseInfo(): EntrepriseInfo {
  const empty: EntrepriseInfo = { nom: '', adresse: '', telephone: '', email: '', ville: '', pays: '', numero_fiscal: '', logo: null, boutique_nom: '' }
  if (!process.client) return empty
  try {
    const boutique = JSON.parse(localStorage.getItem('boutique') || 'null') || {}
    const ent = (typeof boutique?.entreprise === 'object' ? boutique?.entreprise : null) || {}
    const logo = ent?.logo || boutique?.logo || null
    return {
      nom: ent?.nom || boutique?.nom || '',
      adresse: boutique?.adresse || ent?.adresse || '',
      telephone: boutique?.telephone || ent?.telephone || '',
      email: ent?.email || boutique?.email || '',
      ville: boutique?.ville || ent?.ville || '',
      pays: ent?.pays || '',
      numero_fiscal: ent?.numero_fiscal || '',
      logo,
      boutique_nom: boutique?.nom || '',
    }
  } catch { return empty }
}

async function urlToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch { return null }
}

async function buildLogoHtml(info: EntrepriseInfo): Promise<string> {
  if (info.logo) {
    const b64 = await urlToBase64(info.logo)
    if (b64) return `<img src="${b64}" alt="${info.nom}" style="max-height:55px;max-width:160px;object-fit:contain;" />`
  }
  return `<div style="font-size:18px;font-weight:800;color:#10b981;">${info.nom || 'Entreprise'}</div>`
}

/** Ouvre le HTML dans une popup et déclenche window.print() */
function printHtml(html: string) {
  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) { alert('Autorisez les popups pour imprimer.'); return }
  w.document.open()
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => { w.print() }, 600)
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProduitPDF {
  nom: string; reference?: string; quantite: number; prix: number
}

export interface FacturePDF {
  id: number; numero: string; date: string; nom: string
  type: 'client' | 'partenaire'; status: string
  total: number; verse: number; reste: number
  boutique_nom?: string; created_by_username?: string
}

export interface VersementPDF {
  montant: number; date?: string; created_by_username?: string
}

// ─── Composable ──────────────────────────────────────────────────────────────

export function useFacturePDF() {

  async function genererPDFFacture(facture: FacturePDF, produits: ProduitPDF[]) {
    const info = resolveEntrepriseInfo()
    const logoHtml = await buildLogoHtml(info)
    const now = new Date()
    const adresseLine = [info.adresse, info.ville, info.pays].filter(Boolean).join(', ')

    const lignes = produits.map(p => `
      <tr>
        <td>${p.nom}</td>
        <td style="text-align:center;">${p.quantite}</td>
        <td style="text-align:right;">${p.prix.toLocaleString('fr-FR')}</td>
        <td style="text-align:right;font-weight:600;">${(p.prix * p.quantite).toLocaleString('fr-FR')}</td>
      </tr>`).join('')

    const statusColor = facture.status === 'Payé' ? '#16a34a' : facture.status === 'Annulé' ? '#dc2626' : '#d97706'
    const statusBg = facture.status === 'Payé' ? '#dcfce7' : facture.status === 'Annulé' ? '#fee2e2' : '#fef9c3'

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Facture ${facture.numero}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:Arial,Helvetica,sans-serif;color:#111;font-size:12px;background:#fff;}
  .page{padding:20mm 15mm;min-height:297mm;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:2px solid #10b981;margin-bottom:16px;}
  .header-right{text-align:right;}
  .invoice-title{font-size:26px;font-weight:900;color:#374151;letter-spacing:-1px;}
  .invoice-num{font-size:12px;color:#6b7280;margin-top:3px;}
  .badge{display:inline-block;padding:2px 10px;border-radius:9999px;font-size:10px;font-weight:700;margin-top:5px;}
  .ent-info{font-size:10px;color:#6b7280;margin-top:5px;line-height:1.7;}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#f9fafb;border-radius:6px;padding:12px;margin-bottom:16px;}
  .meta-label{font-size:9px;font-weight:700;text-transform:uppercase;color:#9ca3af;letter-spacing:.5px;margin-bottom:5px;}
  .meta p{margin:2px 0;font-size:11px;}
  table{width:100%;border-collapse:collapse;margin-bottom:16px;}
  thead tr{background:#f3f4f6;}
  th{padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;}
  td{padding:7px 10px;border-bottom:1px solid #f3f4f6;font-size:11px;color:#374151;}
  .totals{text-align:right;background:#f9fafb;border-radius:6px;padding:12px;margin-bottom:24px;}
  .totals p{margin:4px 0;font-size:11px;}
  .total-grand{font-size:17px;font-weight:900;border-top:2px solid #e5e7eb;padding-top:8px;margin-top:8px;}
  .footer{text-align:center;font-size:10px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px;margin-top:8px;}
  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .page{padding:4mm 3mm;font-size:11px;}
    .meta{grid-template-columns:1fr;}
    .header{flex-direction:column;gap:6px;}
    @page{size:80mm auto;margin:0;}
  }
</style></head><body>
<div class="page">
  <div class="header">
    <div>
      ${logoHtml}
      <div class="ent-info">
        ${adresseLine ? `<div>${adresseLine}</div>` : ''}
        ${info.telephone ? `<div>Tél : ${info.telephone}</div>` : ''}
        ${info.numero_fiscal ? `<div>NUI : ${info.numero_fiscal}</div>` : ''}
      </div>
    </div>
    <div class="header-right">
      <div class="invoice-title">FACTURE</div>
      <div class="invoice-num">N° ${facture.numero}</div>
      <span class="badge" style="background:${statusBg};color:${statusColor};">${facture.status}</span>
    </div>
  </div>

  <div class="meta">
    <div>
      <div class="meta-label">Destinataire</div>
      <p><strong>${facture.nom}</strong></p>
      <p>Type : ${facture.type}</p>
      <p>Date : <strong>${new Date(facture.date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</strong></p>
    </div>
    <div style="text-align:right;">
      <div class="meta-label">Émetteur</div>
      ${facture.boutique_nom ? `<p><strong>${facture.boutique_nom}</strong></p>` : ''}
      ${facture.created_by_username ? `<p>Par : ${facture.created_by_username}</p>` : ''}
      <p>Imprimé le : ${now.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</p>
    </div>
  </div>

  <table>
    <thead><tr>
      <th>Produit</th><th style="text-align:center;">Qté</th>
      <th style="text-align:right;">P.U (FCFA)</th><th style="text-align:right;">Total (FCFA)</th>
    </tr></thead>
    <tbody>${lignes || '<tr><td colspan="4" style="text-align:center;padding:16px;color:#9ca3af;">Aucun produit</td></tr>'}</tbody>
  </table>

  <div class="totals">
    <p>Total : <strong>${facture.total.toLocaleString('fr-FR')} FCFA</strong></p>
    <p style="color:#16a34a;">Versé : <strong>${facture.verse.toLocaleString('fr-FR')} FCFA</strong></p>
    <p style="color:${facture.reste > 0 ? '#dc2626' : '#16a34a'};">Reste : <strong>${facture.reste.toLocaleString('fr-FR')} FCFA</strong></p>
    <p class="total-grand">TOTAL : ${facture.total.toLocaleString('fr-FR')} FCFA</p>
  </div>

  <div class="footer">
    <p>${info.nom || facture.boutique_nom || ''} — Merci pour votre confiance</p>
    <p>Document généré le ${now.toLocaleString('fr-FR')}</p>
  </div>
</div>
</body></html>`

    printHtml(html)
  }

  async function genererPDFRecu(facture: FacturePDF, versement: VersementPDF) {
    const info = resolveEntrepriseInfo()
    const logoHtml = await buildLogoHtml(info)
    const now = new Date()
    const dateVers = versement.date ? new Date(versement.date).toLocaleString('fr-FR') : now.toLocaleString('fr-FR')
    const nouveauReste = Math.max(0, facture.reste - versement.montant)
    const nouveauStatut = nouveauReste <= 0 ? 'Payée' : 'Partiellement payée'
    const adresseLine = [info.adresse, info.ville, info.pays].filter(Boolean).join(', ')

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Reçu ${facture.numero}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:Arial,Helvetica,sans-serif;color:#111;font-size:12px;background:#fff;}
  .page{padding:20mm 15mm;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:2px solid #10b981;margin-bottom:16px;}
  .ent-info{font-size:10px;color:#6b7280;margin-top:5px;line-height:1.7;}
  .doc-title{font-size:24px;font-weight:900;color:#374151;}
  .doc-sub{font-size:11px;color:#6b7280;margin-top:3px;}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;}
  .card{background:#f9fafb;border-radius:6px;padding:12px;}
  .card-title{font-size:9px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:8px;}
  .card p{margin:3px 0;font-size:11px;}
  .montant-box{background:#ecfdf5;border:2px solid #10b981;border-radius:10px;padding:20px;text-align:center;margin:16px 0;}
  .montant-label{font-size:10px;font-weight:700;color:#065f46;text-transform:uppercase;margin-bottom:6px;}
  .montant-val{font-size:36px;font-weight:900;color:#059669;}
  .bilan{background:#f0fdf4;border-radius:6px;padding:12px;margin-bottom:20px;}
  .bilan-title{font-size:9px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:8px;}
  .bilan-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e5e7eb;font-size:11px;}
  .bilan-row:last-child{border:none;font-weight:700;font-size:13px;padding-top:8px;}
  .sigs{display:flex;justify-content:space-between;margin-top:36px;}
  .sig{text-align:center;width:160px;}
  .sig-line{border-top:1px solid #374151;margin-top:40px;padding-top:5px;font-size:10px;color:#6b7280;}
  .footer{text-align:center;font-size:10px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px;margin-top:16px;}
  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .page{padding:10mm 8mm;}
    @page{size:A4;margin:0;}
  }
  @media print and (max-width:80mm){
    .page{padding:4mm;font-size:10px;}
    .grid2{grid-template-columns:1fr;}
    .header{flex-direction:column;gap:6px;}
    @page{size:80mm auto;margin:0;}
  }
</style></head><body>
<div class="page">
  <div class="header">
    <div>
      ${logoHtml}
      <div class="ent-info">
        ${adresseLine ? `<div>${adresseLine}</div>` : ''}
        ${info.telephone ? `<div>Tél : ${info.telephone}</div>` : ''}
      </div>
    </div>
    <div style="text-align:right;">
      <div class="doc-title">REÇU DE VERSEMENT</div>
      <div class="doc-sub">Facture N° ${facture.numero}</div>
      ${facture.boutique_nom ? `<div style="font-size:11px;color:#6b7280;margin-top:3px;">${facture.boutique_nom}</div>` : ''}
    </div>
  </div>

  <div class="grid2">
    <div class="card">
      <div class="card-title">Facture</div>
      <p><strong>N° ${facture.numero}</strong></p>
      <p>Date : <strong>${new Date(facture.date).toLocaleDateString('fr-FR')}</strong></p>
      <p>${facture.type === 'client' ? 'Client' : 'Partenaire'} : <strong>${facture.nom}</strong></p>
    </div>
    <div class="card" style="text-align:right;">
      <div class="card-title">Versement</div>
      <p>Date : <strong>${dateVers}</strong></p>
      ${versement.created_by_username ? `<p>Par : <strong>${versement.created_by_username}</strong></p>` : ''}
      <p>Statut : <strong style="color:${nouveauReste <= 0 ? '#16a34a' : '#d97706'};">${nouveauStatut}</strong></p>
    </div>
  </div>

  <div class="montant-box">
    <div class="montant-label">Montant du versement</div>
    <div class="montant-val">${versement.montant.toLocaleString('fr-FR')} <span style="font-size:16px;">FCFA</span></div>
  </div>

  <div class="bilan">
    <div class="bilan-title">Récapitulatif</div>
    <div class="bilan-row"><span>Total facture</span><span><strong>${facture.total.toLocaleString('fr-FR')} FCFA</strong></span></div>
    <div class="bilan-row"><span>Déjà versé</span><span style="color:#16a34a;"><strong>${facture.verse.toLocaleString('fr-FR')} FCFA</strong></span></div>
    <div class="bilan-row"><span>Ce versement</span><span style="color:#059669;"><strong>+${versement.montant.toLocaleString('fr-FR')} FCFA</strong></span></div>
    <div class="bilan-row"><span>Reste à payer</span><span style="color:${nouveauReste > 0 ? '#dc2626' : '#16a34a'};"><strong>${nouveauReste.toLocaleString('fr-FR')} FCFA</strong></span></div>
  </div>

  <div class="sigs">
    <div class="sig"><div class="sig-line">Signature du client</div></div>
    <div class="sig"><div class="sig-line">Signature du caissier</div></div>
  </div>

  <div class="footer">
    <p>${info.nom || facture.boutique_nom || ''} — Ce reçu fait foi de paiement</p>
    <p>Généré le ${now.toLocaleString('fr-FR')}</p>
  </div>
</div>
</body></html>`

    printHtml(html)
  }

  return { genererPDFFacture, genererPDFRecu }
}
