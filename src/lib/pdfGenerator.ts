import { jsPDF } from 'jspdf';
import { UpcycleProjectResult } from '@/src/types';

export function generateUpcyclePDF(result: UpcycleProjectResult): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeaderWatermark();
    }
  };

  const drawHeaderWatermark = () => {
    // Subtle top banner line
    doc.setFillColor(33, 94, 97); // Deep Teal #215E61
    doc.rect(margin, y, contentWidth, 1.5, 'F');
    y += 5;
  };

  // --- 1. COVER / MAIN HEADER ---
  // Top brand badge
  doc.setFillColor(33, 94, 97); // #215E61 Deep Teal
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BUMIKITA  |  Panduan DIY Upcycle Offline', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Waste-to-Worth Blueprint • Generasi Bijak Kelola Sampah', margin + 6, y + 16);

  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.setFontSize(8);
  doc.text(`Dicetak: ${dateStr}`, pageWidth - margin - 6, y + 16, { align: 'right' });

  y += 30;

  // --- 2. PROJECT TITLE & TAGLINE ---
  doc.setTextColor(29, 33, 40); // Dark Charcoal #1D2128
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  
  const titleLines = doc.splitTextToSize(result.projectName, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 1;

  doc.setTextColor(82, 88, 102); // Neutral Slate #525866
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  const taglineLines = doc.splitTextToSize(`"${result.tagline}"`, contentWidth);
  doc.text(taglineLines, margin, y);
  y += taglineLines.length * 5 + 4;

  // --- 3. DETECTION & SPECS BADGES MATRIX ---
  checkPageBreak(35);

  doc.setFillColor(232, 242, 237); // Soft Teal #E8F2ED
  doc.setDrawColor(53, 122, 89);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(53, 122, 89);
  doc.text('HASIL DETEKSI AI DARI FOTO:', margin + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(29, 33, 40);
  const detectedText = result.detectedItemName || 'Sampah & Material Bekas';
  doc.text(detectedText, margin + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(82, 88, 102);
  const matText = `Material: ${result.detectedMaterialType || 'Daur Ulang'} • ${result.detectedCondition || 'Siap dikreasikan'}`;
  const matLines = doc.splitTextToSize(matText, contentWidth - 8);
  doc.text(matLines, margin + 4, y + 17);

  // Key stats bar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(33, 94, 97);
  doc.text(`Tingkat: ${result.difficulty}  |  Waktu: ${result.timeEstimate}  |  Estimasi Nilai: Rp ${result.estimatedValueIdr?.toLocaleString('id-ID')}  |  CO2 Saved: ${result.co2SavedKg} kg`, margin + 4, y + 23);

  y += 32;

  // --- 4. DETAILED PRODUCT DESCRIPTION ---
  if (result.productDescription) {
    checkPageBreak(25);
    doc.setFillColor(250, 248, 245);
    doc.setDrawColor(226, 224, 224);
    
    const descLines = doc.splitTextToSize(result.productDescription, contentWidth - 8);
    const boxHeight = 12 + descLines.length * 4.5;

    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(33, 94, 97);
    doc.text('RINCIAN & KEGUNAAN BARANG YANG DIBUAT:', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(29, 33, 40);
    doc.text(descLines, margin + 4, y + 12);

    y += boxHeight + 6;
  }

  // --- 5. 3-PILLAR BENEFITS ---
  if (result.benefits) {
    checkPageBreak(30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(33, 94, 97);
    doc.text('MANFAAT NYATA UPCYCLE (3 PILAR):', margin, y);
    y += 5;

    const colWidth = (contentWidth - 6) / 3;

    // Pillar 1: Economic
    doc.setFillColor(255, 245, 230); // #FFF5E6
    doc.setDrawColor(255, 158, 32);
    doc.roundedRect(margin, y, colWidth, 24, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(217, 126, 13);
    doc.text('Finansial & Hemat', margin + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(29, 33, 40);
    const econLines = doc.splitTextToSize(result.benefits.economic, colWidth - 6);
    doc.text(econLines, margin + 3, y + 10);

    // Pillar 2: Environmental
    const col2X = margin + colWidth + 3;
    doc.setFillColor(232, 242, 237); // #E8F2ED
    doc.setDrawColor(53, 122, 89);
    doc.roundedRect(col2X, y, colWidth, 24, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(53, 122, 89);
    doc.text('Dampak Lingkungan', col2X + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(29, 33, 40);
    const envLines = doc.splitTextToSize(result.benefits.environmental, colWidth - 6);
    doc.text(envLines, col2X + 3, y + 10);

    // Pillar 3: Practical
    const col3X = margin + (colWidth + 3) * 2;
    doc.setFillColor(250, 248, 245);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(col3X, y, colWidth, 24, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(29, 33, 40);
    doc.text('Praktis & Fungsional', col3X + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(29, 33, 40);
    const pracLines = doc.splitTextToSize(result.benefits.practical, colWidth - 6);
    doc.text(pracLines, col3X + 3, y + 10);

    y += 29;
  }

  // --- 6. MATERIALS & TOOLS ---
  checkPageBreak(35);

  const halfWidth = (contentWidth - 4) / 2;

  // Left Box: Materials
  doc.setFillColor(250, 248, 245);
  doc.setDrawColor(226, 224, 224);
  const matBoxHeight = Math.max(30, 10 + (result.requiredMaterials?.length || 0) * 5.5);
  doc.roundedRect(margin, y, halfWidth, matBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(33, 94, 97);
  doc.text('Bahan Baku yang Diperlukan:', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(29, 33, 40);
  let matY = y + 11;
  result.requiredMaterials?.forEach((mat) => {
    // Checkbox square
    doc.rect(margin + 4, matY - 2.5, 3, 3);
    const lines = doc.splitTextToSize(mat, halfWidth - 12);
    doc.text(lines, margin + 9, matY);
    matY += lines.length * 4 + 1.5;
  });

  // Right Box: Tools & Safety
  const rightX = margin + halfWidth + 4;
  const toolBoxHeight = matBoxHeight;
  doc.roundedRect(rightX, y, halfWidth, toolBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(33, 94, 97);
  doc.text('Peralatan yang Dibutuhkan:', rightX + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(29, 33, 40);
  let toolY = y + 11;
  result.toolsNeeded?.forEach((tool) => {
    doc.rect(rightX + 4, toolY - 2.5, 3, 3);
    const lines = doc.splitTextToSize(tool, halfWidth - 12);
    doc.text(lines, rightX + 9, toolY);
    toolY += lines.length * 4 + 1.5;
  });

  if (result.safetyNote) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(217, 126, 13);
    const safetyLines = doc.splitTextToSize(`Safety: ${result.safetyNote}`, halfWidth - 8);
    doc.text(safetyLines, rightX + 4, y + toolBoxHeight - 4);
  }

  y += matBoxHeight + 8;

  // --- 7. STEP-BY-STEP INSTRUCTIONS ---
  checkPageBreak(25);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(33, 94, 97);
  doc.text(`PANDUAN LANGKAH-DEMI-LANGKAH (${result.steps?.length || 0} TAHAP):`, margin, y);
  y += 6;

  result.steps?.forEach((step) => {
    const title = `Langkah ${step.stepNumber}: ${step.title} (~${step.timeMinutes} mnt)`;
    const instructionLines = doc.splitTextToSize(step.instruction, contentWidth - 14);
    const tipLines = step.tip ? doc.splitTextToSize(`Pro Tip: ${step.tip}`, contentWidth - 14) : [];

    const neededH = 10 + instructionLines.length * 4 + (tipLines.length ? tipLines.length * 3.5 + 4 : 0);
    checkPageBreak(neededH);

    // Step Card Background
    doc.setFillColor(250, 248, 245);
    doc.setDrawColor(226, 224, 224);
    doc.roundedRect(margin, y, contentWidth, neededH, 2, 2, 'FD');

    // Step Number Badge
    doc.setFillColor(33, 94, 97);
    doc.roundedRect(margin + 3, y + 3, 7, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(String(step.stepNumber), margin + 6.5, y + 7.5, { align: 'center' });

    // Step Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(29, 33, 40);
    doc.text(title, margin + 12, y + 7.5);

    // Step Instruction
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);
    doc.text(instructionLines, margin + 12, y + 13);

    let curY = y + 13 + instructionLines.length * 4;

    // Step Tip
    if (tipLines.length > 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(53, 122, 89);
      doc.text(tipLines, margin + 12, curY + 2);
    }

    y += neededH + 4;
  });

  // --- 8. STYLING TIPS & FOOTER ---
  if (result.stylingTips) {
    const styleLines = doc.splitTextToSize(`Tips Estetika & Styling: ${result.stylingTips}`, contentWidth - 8);
    const styleH = 8 + styleLines.length * 4;
    checkPageBreak(styleH);

    doc.setFillColor(232, 242, 237);
    doc.setDrawColor(53, 122, 89);
    doc.roundedRect(margin, y, contentWidth, styleH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(53, 122, 89);
    doc.text(styleLines, margin + 4, y + 5);

    y += styleH + 6;
  }

  // --- FOOTER ACROSS ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 145, 155);

    // Bottom line
    doc.setDrawColor(226, 224, 224);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.text('BumiKita — Platform Daur Ulang & Upcycling Cerdas (Waste-to-Worth)', margin, pageHeight - 6);
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // Sanitize filename
  const cleanName = (result.projectName || 'Panduan-Upcycle')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);

  doc.save(`BumiKita_Upcycle_${cleanName}.pdf`);
}
