/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  FileText, 
  Settings, 
  Download, 
  Copy, 
  Check, 
  Loader2, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Printer,
  Sparkles,
  History,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { DSKP_DATA } from './data/dskp';

// --- Types ---

interface RPHData {
  week: string;
  year: string;
  date: string;
  day: string;
  time: string;
  duration: string;
  className: string;
  studentCount: string;
  unit: string;
  standardContent: string;
  standardLearning: string;
  values: string;
  objectives: string;
  successCriteria: string;
  studentLevel: string;
  bbm: string;
  focus: string;
  variation: string;
}

const INITIAL_RPH_DATA: RPHData = {
  week: 'Minggu 1',
  year: 'Tahun 4',
  date: new Date().toISOString().split('T')[0],
  day: '',
  time: '8.00 - 9.00',
  duration: '60 minit',
  className: '4 Marikh',
  studentCount: '30',
  unit: DSKP_DATA['Tahun 4']?.[0]?.unit || '',
  standardContent: DSKP_DATA['Tahun 4']?.[0]?.standardContent || '',
  standardLearning: '',
  values: DSKP_DATA['Tahun 4']?.[0]?.value || '',
  objectives: '',
  successCriteria: '',
  studentLevel: 'Sederhana',
  bbm: 'Buku Teks, Slaid Pembentangan',
  focus: 'Aktiviti Berkumpulan',
  variation: 'Lengkap',
};

const generateMingguOptions = () => {
  const options = [];
  const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
  
  // Kumpulan B (Johor, Melaka, Negeri Sembilan, Pahang, Perak, Perlis, Pulau Pinang, Sabah, Sarawak, Selangor, WPKL, WP Labuan, WP Putrajaya)
  // Starts 12 Jan 2026
  let currentDate = new Date(2026, 0, 12); // 12 Jan 2026
  let weekNumber = 1;
  
  const addWeek = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    end.setDate(end.getDate() + 4); // Friday
    
    const startStr = `${start.getDate()} ${months[start.getMonth()]}`;
    const endStr = `${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
    
    options.push({
      id: `Minggu ${weekNumber}`,
      label: `Minggu ${weekNumber} (${startStr} - ${endStr})`
    });
    
    weekNumber++;
    currentDate.setDate(currentDate.getDate() + 7);
  };

  // Penggal 1: 10 weeks (12 Jan - 20 Mar)
  for (let i = 0; i < 10; i++) addWeek();
  
  // Cuti Penggal 1: 1 week (21 Mar - 29 Mar)
  currentDate.setDate(currentDate.getDate() + 7);
  
  // Penggal 2: 8 weeks (30 Mar - 22 May)
  for (let i = 0; i < 8; i++) addWeek();
  
  // Cuti Pertengahan Tahun: 2 weeks (23 May - 7 Jun)
  currentDate.setDate(currentDate.getDate() + 14);
  
  // Penggal 3: 12 weeks (8 Jun - 28 Aug)
  for (let i = 0; i < 12; i++) addWeek();
  
  // Cuti Penggal 2: 1 week (29 Aug - 6 Sep)
  currentDate.setDate(currentDate.getDate() + 7);
  
  // Penggal 4: 13 weeks (7 Sep - 4 Dec)
  for (let i = 0; i < 13; i++) addWeek();

  return options;
};

const MINGGU_OPTIONS = generateMingguOptions();

const VARIATIONS = [
  { id: 'Lengkap', label: 'RPH Lengkap' },
  { id: 'Ringkas', label: 'RPH Ringkas' },
  { id: 'PAK21', label: 'Berfokus PAK21' },
  { id: 'KBAT', label: 'Berfokus KBAT' },
  { id: 'Lembaran', label: 'Dengan Lembaran Kerja' },
];

const TIME_OPTIONS = [
  '7.00 - 7.30',
  '7.00 - 8.00',
  '7.30 - 8.00',
  '7.30 - 8.30',
  '8.00 - 8.30',
  '8.00 - 9.00',
  '8.30 - 9.00',
  '8.30 - 9.30',
  '9.00 - 9.30',
  '9.00 - 10.00',
  '9.30 - 10.00',
  '9.30 - 10.30',
  '10.00 - 10.30',
  '10.00 - 11.00',
  '10.30 - 11.00',
  '10.30 - 11.30',
  '11.00 - 11.30',
  '11.00 - 12.00',
  '11.30 - 12.00',
  '11.30 - 12.30',
  '12.00 - 12.30',
  '12.00 - 1.00',
  '12.30 - 1.00',
  '12.30 - 1.30',
];

// --- Components ---

const InputField = ({ label, value, onChange, placeholder, type = 'text', disabled = false }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold uppercase tracking-widest text-emerald-500/80">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm text-gray-200 placeholder:text-gray-600 focus:scale-[1.01] ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-700'}`}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }: any) => (
  <div className="flex flex-col gap-1.5 relative">
    <label className="text-xs font-bold uppercase tracking-widest text-emerald-500/80">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm text-gray-200 appearance-none pr-10 hover:border-gray-700 focus:scale-[1.01]"
      >
        {options.map((opt: any) => (
          <option key={opt.id || opt} value={opt.id || opt} className="bg-[#1a1a1a]">
            {opt.label || opt}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500/50">
        <ChevronDown size={16} />
      </div>
    </div>
  </div>
);

export default function App() {
  const [formData, setFormData] = useState<RPHData>(INITIAL_RPH_DATA);
  const [generatedRPH, setGeneratedRPH] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  const updateField = (field: keyof RPHData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-update Unit, Standard Content, and Values when Year changes
      if (field === 'year') {
        const yearData = DSKP_DATA[value];
        if (yearData && yearData.length > 0) {
          newData.unit = yearData[0].unit;
          newData.standardContent = yearData[0].standardContent;
          newData.values = yearData[0].value;
        } else {
          newData.unit = '';
          newData.standardContent = '';
          newData.values = '';
        }
      }
      
      // Auto-update Standard Content and Values when Unit changes
      if (field === 'unit') {
        const yearData = DSKP_DATA[newData.year];
        const unitData = yearData?.find(u => u.unit === value);
        if (unitData) {
          newData.standardContent = unitData.standardContent;
          newData.values = unitData.value;
        }
      }
      
      return newData;
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3.1-pro-preview";
      
      const isRingkas = formData.variation === 'Ringkas';

      const prompt = `
        Hasilkan Rancangan Pengajaran Harian (RPH) Pendidikan Moral Malaysia berdasarkan maklumat berikut:
        
        Minggu: ${formData.week}
        Tahun: ${formData.year}
        Tarikh: ${formData.date}
        Hari: ${formData.day}
        Masa: ${formData.time}
        Tempoh: ${formData.duration}
        Kelas: ${formData.className}
        Bilangan Murid: ${formData.studentCount}
        Unit/Tajuk: ${formData.unit}
        Standard Kandungan: ${formData.standardContent}
        Standard Pembelajaran: ${formData.standardLearning}
        Nilai: ${formData.values}
        Objektif: ${formData.objectives}
        Kriteria Kejayaan: ${formData.successCriteria}
        Tahap Murid: ${formData.studentLevel}
        BBM: ${formData.bbm}
        Fokus: ${formData.focus}
        Variasi: ${formData.variation}
        
        ${isRingkas ? 'Sila hasilkan RPH dalam format RINGKAS. Fokuskan hanya kepada maklumat asas, objektif, aktiviti ringkas, dan refleksi.' : 'Sila patuhi format RPH rasmi yang telah ditetapkan dalam arahan sistem anda.'}
        Pastikan aktiviti adalah kreatif, relevan dengan Pendidikan Moral, dan menggunakan istilah standard (PAK21, KBAT, EMK).
        ${!isRingkas ? 'PENTING: Sila pastikan RPH ini selaras dengan Rancangan Pengajaran Tahunan (RPT) Pendidikan Moral dengan menyertakan elemen-elemen RPT seperti Minggu Persekolahan (andaikan minggu yang sesuai berdasarkan tajuk), Tema, dan Catatan RPT jika berkaitan.' : ''}
        ${!isRingkas ? 'SANGAT PENTING: Sila sertakan contoh soalan latihan/lembaran kerja yang spesifik dan selaras dengan tajuk/unit Buku Teks Pendidikan Moral di bahagian Pentaksiran atau sebagai lampiran ringkas di hujung RPH.' : ''}
      `;

      const systemInstruction = isRingkas ? `
        Anda ialah Sistem Penjana Rancangan Pengajaran Harian (RPH) Pendidikan Moral Malaysia.
        Tugas anda ialah membina RPH RINGKAS.
        
        JANGAN gunakan sebarang format Markdown seperti ** (bold), * (italic), atau # (heading). Hasilkan teks biasa (plain text) sahaja.
        
        Format output wajib untuk RPH RINGKAS:
        RANCANGAN PENGAJARAN HARIAN (RINGKAS)
        Mata Pelajaran: Pendidikan Moral
        Tahun: [Input]
        Kelas: [Input]
        Tarikh: [Input]
        Hari: [Input]
        Masa: [Input]
        Tajuk: [Input]
        Standard Kandungan: [Input]
        Standard Pembelajaran: [Input]
        Objektif: [Jana ringkas]
        Aktiviti: [Jana 3-4 langkah ringkas sahaja]
        Refleksi: [Template kosong]
      ` : `
        Anda ialah Sistem Penjana Rancangan Pengajaran Harian (RPH) Pendidikan Moral Malaysia yang sangat teliti, tersusun, dan patuh kurikulum. 
        Tugas anda ialah membina RPH yang selaras dengan DSKP Pendidikan Moral, RPT Pendidikan Moral, dan kandungan Buku Teks Pendidikan Moral.
        
        PENTING: JANGAN gunakan sebarang format Markdown seperti ** (bold), * (italic), atau # (heading). Hasilkan teks biasa (plain text) sahaja.
        
        Format output wajib:
        RANCANGAN PENGAJARAN HARIAN (RPH) PENDIDIKAN MORAL
        
        Mata Pelajaran: Pendidikan Moral
        Tahun: [Input]
        Kelas: [Input]
        Tarikh: [Input]
        Hari: [Input]
        Masa: [Input]
        Bilangan Murid: [Input]
        Minggu RPT: [Jana berdasarkan susunan unit]
        Tema/Bidang/Unit/Tajuk: [Input]
        
        Standard Kandungan: [Input]
        Standard Pembelajaran: [Input]
        Nilai: [Input]
        Pengetahuan Sedia Ada: [Jana berdasarkan tajuk]
        
        Objektif Pembelajaran:
        1. [Jana]
        2. [Jana]
        
        Kriteria Kejayaan:
        1. [Jana]
        2. [Jana]
        
        Elemen Merentas Kurikulum (EMK): [Jana]
        KBAT: [Jana]
        PAK21: [Jana]
        Bahan Bantu Mengajar (BBM): [Input + Jana]
        
        Aktiviti Pengajaran & Pembelajaran:
        Set Induksi (5 minit): [Jana]
        Langkah 1 (15 minit): [Jana]
        Langkah 2 (15 minit): [Jana]
        Langkah 3 (15 minit): [Jana]
        Penutup (10 minit): [Jana]
        
        Pentaksiran: [Jana]
        Pemulihan: [Jana]
        Pengayaan: [Jana]
        Refleksi: [Sediakan template kosong atau contoh]
      `;

      const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      let text = result.text || '';
      // Remove markdown symbols like **, *, ###, #
      text = text.replace(/[*#]/g, '');
      
      setGeneratedRPH(text);
      setHistory(prev => [text, ...prev].slice(0, 5));
    } catch (error) {
      console.error('Error generating RPH:', error);
      alert('Gagal menjana RPH. Sila cuba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedRPH);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const generateTableHTML = () => {
    const safeExtract = (regex: RegExp, fallback = '') => {
      const match = generatedRPH.match(regex);
      return match ? match[1].trim().replace(/\n/g, '<br>') : fallback;
    };

    const isRingkas = formData.variation === 'Ringkas';
    
    if (isRingkas) {
      return `
        <div style="font-family: 'Times New Roman', serif; font-size: 12pt; padding: 20px;">
          <h2 style="text-align: center; text-decoration: underline;">RANCANGAN PENGAJARAN HARIAN (RINGKAS)</h2>
          <p><strong>MATA PELAJARAN:</strong> Pendidikan Moral</p>
          <p><strong>KELAS:</strong> ${formData.className} &nbsp;&nbsp;&nbsp; <strong>MASA:</strong> ${formData.time}</p>
          <p><strong>TARIKH:</strong> ${formData.date} &nbsp;&nbsp;&nbsp; <strong>HARI:</strong> ${formData.day}</p>
          <hr>
          <p><strong>TAJUK:</strong> ${formData.unit}</p>
          <p><strong>STANDARD KANDUNGAN:</strong> ${formData.standardContent}</p>
          <p><strong>STANDARD PEMBELAJARAN:</strong> ${formData.standardLearning}</p>
          <p><strong>OBJEKTIF:</strong><br>${safeExtract(/Objektif Pembelajaran:\s*([\s\S]*?)\s*Kriteria Kejayaan:/i, safeExtract(/Objektif:\s*([\s\S]*?)\s*Aktiviti:/i))}</p>
          <p><strong>AKTIVITI:</strong><br>${safeExtract(/Aktiviti Pengajaran[^:]*:\s*([\s\S]*?)\s*Refleksi:/i, safeExtract(/Aktiviti:\s*([\s\S]*?)\s*Refleksi:/i))}</p>
          <p><strong>REFLEKSI:</strong><br>${safeExtract(/Refleksi:\s*([\s\S]*?)$/i)}</p>
        </div>
      `;
    }

    const minggu = formData.week;
    const bidang = safeExtract(/Tema\/Bidang\/Unit\/Tajuk:\s*(.*)/i, formData.unit);
    
    const objektif = safeExtract(/Objektif Pembelajaran:\s*([\s\S]*?)\s*Kriteria Kejayaan:/i);
    const kriteria = safeExtract(/Kriteria Kejayaan:\s*([\s\S]*?)\s*Elemen Merentas Kurikulum/i);
    const emk = safeExtract(/Elemen Merentas Kurikulum[^:]*:\s*([\s\S]*?)\s*Bahan Bantu Mengajar/i);
    const bbm = safeExtract(/Bahan Bantu Mengajar[^:]*:\s*([\s\S]*?)\s*Pentaksiran/i, formData.bbm);
    const pentaksiran = safeExtract(/Pentaksiran[^:]*:\s*([\s\S]*?)\s*Aktiviti Pengajaran/i);
    
    const setInduksi = safeExtract(/Set Induksi[^:]*:\s*([\s\S]*?)\s*Langkah 1/i);
    const langkah1 = safeExtract(/Langkah 1[^:]*:\s*([\s\S]*?)\s*Langkah 2/i);
    const langkah2 = safeExtract(/Langkah 2[^:]*:\s*([\s\S]*?)\s*(?:Langkah 3|Penutup)/i);
    const langkah3 = safeExtract(/Langkah 3[^:]*:\s*([\s\S]*?)\s*Penutup/i);
    const penutup = safeExtract(/Penutup[^:]*:\s*([\s\S]*?)\s*Refleksi:/i);
    
    const refleksi = safeExtract(/Refleksi:\s*([\s\S]*?)\s*(?:Tindakan susulan:|Pemulihan:)/i);
    const pemulihan = safeExtract(/Pemulihan:\s*([\s\S]*?)\s*Pengayaan:/i);
    const pengayaan = safeExtract(/Pengayaan:\s*([\s\S]*?)$/i);

    const aktivitiUtama = [langkah1, langkah2, langkah3].filter(Boolean).join('<br><br>');

    return `
      <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', serif; font-size: 11pt; border: 1px solid black;">
        <tr>
          <td colspan="4" style="text-align: center; background-color: #e0f2f1; font-weight: bold; font-size: 14pt; padding: 10px;">RANCANGAN PENGAJARAN HARIAN</td>
        </tr>
        <tr>
          <td style="width: 20%; font-weight: bold; text-transform: uppercase;">Mata Pelajaran</td>
          <td style="width: 30%;">Pendidikan Moral</td>
          <td style="width: 20%; font-weight: bold; text-transform: uppercase;">Minggu</td>
          <td style="width: 30%;">${minggu}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-transform: uppercase;">Kelas</td>
          <td>${formData.className}</td>
          <td style="font-weight: bold; text-transform: uppercase;">Masa</td>
          <td>${formData.time}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-transform: uppercase;">Tarikh</td>
          <td>${formData.date}</td>
          <td style="font-weight: bold; text-transform: uppercase;">Hari</td>
          <td>${formData.day}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-transform: uppercase;">Bidang :</td>
          <td>${bidang}</td>
          <td style="font-weight: bold; text-transform: uppercase;">Tajuk :</td>
          <td>${formData.unit}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-transform: uppercase;">Kod Standard Kandungan</td>
          <td>${formData.standardContent}</td>
          <td style="font-weight: bold; text-transform: uppercase;">Kod Standard Pembelajaran</td>
          <td>${formData.standardLearning}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-transform: uppercase;">Objektif Pembelajaran</td>
          <td valign="top">${objektif}</td>
          <td style="font-weight: bold; text-transform: uppercase;">Kriteria Kejayaan</td>
          <td valign="top">${kriteria}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-transform: uppercase;">Elemen Merentas Kurikulum (EMK)</td>
          <td colspan="3">${emk}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-transform: uppercase;">Pentaksiran</td>
          <td colspan="3">${pentaksiran}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-transform: uppercase;">Bahan Bantu Mengajar</td>
          <td colspan="3">${bbm}</td>
        </tr>
        <tr>
          <td colspan="4" style="text-align: center; background-color: #e0f2f1; font-weight: bold; padding: 10px; text-transform: uppercase;">Strategi Pembelajaran & Pengajaran</td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-align: center;"></td>
          <td colspan="2" style="font-weight: bold; text-align: center; text-transform: uppercase;">Kandungan</td>
          <td style="font-weight: bold; text-align: center; text-transform: uppercase;">Catatan</td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-transform: uppercase;">Aktiviti Permulaan</td>
          <td colspan="2" valign="top">${setInduksi}</td>
          <td></td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-transform: uppercase;">Aktiviti Utama</td>
          <td colspan="2" valign="top">${aktivitiUtama}</td>
          <td></td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-transform: uppercase;">Aktiviti Penutup</td>
          <td colspan="2" valign="top">${penutup}</td>
          <td></td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-transform: uppercase;">Refleksi</td>
          <td colspan="3" valign="top">${refleksi}</td>
        </tr>
        <tr>
          <td rowspan="2" style="font-weight: bold; text-transform: uppercase;" valign="middle">Kerja Susulan Untuk Murid</td>
          <td style="font-weight: bold; text-transform: uppercase;">Pemulihan</td>
          <td colspan="2" valign="top">${pemulihan}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; text-transform: uppercase;">Pengayaan</td>
          <td colspan="2" valign="top">${pengayaan}</td>
        </tr>
      </table>
    `;
  };

  const handlePrint = () => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Cetak RPH</title>
            <style>
              body { font-family: 'Times New Roman', serif; line-height: 1.5; padding: 2rem; color: black; max-width: 1000px; margin: 0 auto; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            ${generateTableHTML()}
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                }, 300);
              };
            </script>
          </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error('Print error:', error);
      window.print(); // Fallback
    }
  };

  const handleDownload = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>RPH Pendidikan Moral</title></head><body>";
    const footer = "</body></html>";
    
    const sourceHTML = header + generateTableHTML() + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `RPH_Moral_${formData.className}_${formData.date}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-gray-200">
      {/* Header */}
      <header className="bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">KauByte RPH Assistant</h1>
              <p className="text-[10px] text-emerald-500 font-bold tracking-[0.2em] uppercase">Assistant RPH Moral Kauluan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFormData(INITIAL_RPH_DATA)}
              className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
              title="Reset Form"
            >
              <Trash2 size={20} />
            </button>
            <button className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 flex flex-col gap-6"
        >
          <section className="bg-[#141414] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 bg-[#1a1a1a] flex items-center justify-between">
              <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <FileText size={18} />
                Maklumat Pengajaran
              </h2>
              <span className="text-[10px] font-bold bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Input Wajib
              </span>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <SelectField 
                  label="Minggu" 
                  value={formData.week} 
                  onChange={(val: string) => updateField('week', val)}
                  options={MINGGU_OPTIONS}
                />
                <SelectField 
                  label="Tahun" 
                  value={formData.year} 
                  onChange={(val: string) => updateField('year', val)}
                  options={['Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4', 'Tahun 5', 'Tahun 6']}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="Tarikh" 
                  type="date" 
                  value={formData.date} 
                  onChange={(val: string) => updateField('date', val)} 
                />
                <InputField 
                  label="Hari" 
                  placeholder="Isnin" 
                  value={formData.day} 
                  onChange={(val: string) => updateField('day', val)} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField 
                  label="Masa" 
                  value={formData.time} 
                  onChange={(val: string) => updateField('time', val)} 
                  options={TIME_OPTIONS}
                />
                <SelectField 
                  label="Kelas" 
                  value={formData.className} 
                  onChange={(val: string) => updateField('className', val)}
                  options={['1 Marikh', '2 Marikh', '3 Marikh', '4 Marikh', '5 Marikh', '6 Marikh']}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="Bil. Murid" 
                  placeholder="30" 
                  value={formData.studentCount} 
                  onChange={(val: string) => updateField('studentCount', val)} 
                />
                <div className="hidden md:block"></div>
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-800">
                {DSKP_DATA[formData.year] ? (
                  <SelectField 
                    label="Tajuk / Unit" 
                    value={formData.unit} 
                    onChange={(val: string) => updateField('unit', val)}
                    options={DSKP_DATA[formData.year].map(d => ({ id: d.unit, label: d.unit }))}
                  />
                ) : (
                  <InputField 
                    label="Tajuk / Unit" 
                    placeholder="Unit 1: Kepercayaan kepada Tuhan" 
                    value={formData.unit} 
                    onChange={(val: string) => updateField('unit', val)} 
                  />
                )}
                
                <InputField 
                  label="Standard Kandungan" 
                  placeholder="Contoh: 1.1 Mengetahui..." 
                  value={formData.standardContent} 
                  onChange={(val: string) => updateField('standardContent', val)} 
                  disabled={!!DSKP_DATA[formData.year]}
                />
                
                <SelectField 
                  label="Standard Pembelajaran" 
                  value={formData.standardLearning} 
                  onChange={(val: string) => updateField('standardLearning', val)} 
                  options={[
                    { id: '', label: 'Sila Pilih Standard Pembelajaran' },
                    { id: `${formData.standardContent.split(' ')[0].replace('.0', '')}.1.1 Menyatakan / Menyenaraikan...`, label: `${formData.standardContent.split(' ')[0].replace('.0', '')}.1.1 Menyatakan / Menyenaraikan...` },
                    { id: `${formData.standardContent.split(' ')[0].replace('.0', '')}.1.2 Menerangkan / Menjelaskan...`, label: `${formData.standardContent.split(' ')[0].replace('.0', '')}.1.2 Menerangkan / Menjelaskan...` },
                    { id: `${formData.standardContent.split(' ')[0].replace('.0', '')}.1.3 Menghubungkait / Menghuraikan...`, label: `${formData.standardContent.split(' ')[0].replace('.0', '')}.1.3 Menghubungkait / Menghuraikan...` },
                    { id: `${formData.standardContent.split(' ')[0].replace('.0', '')}.1.4 Mengekspresikan perasaan...`, label: `${formData.standardContent.split(' ')[0].replace('.0', '')}.1.4 Mengekspresikan perasaan...` },
                    { id: `${formData.standardContent.split(' ')[0].replace('.0', '')}.1.5 Mengamalkan sikap / perlakuan...`, label: `${formData.standardContent.split(' ')[0].replace('.0', '')}.1.5 Mengamalkan sikap / perlakuan...` }
                  ]}
                />
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-800">
                <InputField 
                  label="Nilai Moral" 
                  placeholder="Kepercayaan kepada Tuhan, Hormat" 
                  value={formData.values} 
                  onChange={(val: string) => updateField('values', val)} 
                  disabled={!!DSKP_DATA[formData.year]}
                />
                <SelectField 
                  label="Variasi RPH" 
                  value={formData.variation} 
                  onChange={(val: string) => updateField('variation', val)}
                  options={VARIATIONS}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/20 mt-4 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Menjana RPH...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
                    Jana RPH Sekarang
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Tips Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-emerald-950/20 border border-emerald-500/10 rounded-2xl p-4 flex gap-3 group hover:border-emerald-500/30 transition-all"
          >
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Info className="text-emerald-500" size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Tips Profesional</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Gunakan maklumat yang tepat daripada DSKP untuk hasil yang lebih berkualiti. Sistem akan menjana aktiviti PAK21 secara automatik berdasarkan tajuk anda.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Pratonton RPH</h2>
              {generatedRPH && (
                <span className="text-[10px] font-bold bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Sedia untuk digunakan
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {generatedRPH && (
                <>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-gray-800 rounded-lg text-xs font-bold text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all"
                  >
                    {copySuccess ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copySuccess ? 'Disalin!' : 'Salin'}
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-gray-800 rounded-lg text-xs font-bold text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all"
                  >
                    <Download size={14} />
                    Muat Turun
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 rounded-lg text-xs font-bold text-white hover:bg-emerald-500 transition-all"
                  >
                    <Printer size={14} />
                    Cetak
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 bg-[#141414] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
            {generatedRPH ? (
              <div className="flex-1 overflow-auto p-8 bg-white text-black print:p-0">
                <div ref={previewRef} className="max-w-3xl mx-auto whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-800 print:text-black">
                  {generatedRPH}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center text-gray-700 mb-6 border border-gray-800 relative">
                  <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-ping" />
                  <Sparkles size={40} className="relative z-10" />
                </div>
                <h3 className="text-lg font-bold text-gray-400 mb-2">Belum Ada RPH Dijana</h3>
                <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
                  Isi maklumat pengajaran di sebelah kiri dan klik butang "Jana RPH" untuk melihat hasilnya di sini.
                </p>
                
                {history.length > 0 && (
                  <div className="mt-8 w-full max-w-sm">
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-700 uppercase tracking-widest">
                      <History size={14} />
                      Sejarah Terkini
                    </div>
                    <div className="space-y-2">
                      {history.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setGeneratedRPH(item)}
                          className="w-full text-left px-4 py-2 bg-[#1a1a1a] hover:bg-emerald-500/10 rounded-lg text-xs text-gray-500 hover:text-emerald-400 truncate transition-all border border-gray-800 hover:border-emerald-500/30"
                        >
                          RPH {idx + 1}: {item.split('\n')[0].substring(0, 40)}...
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {generatedRPH && (
              <div className="px-6 py-4 bg-[#1a1a1a] border-t border-gray-800 flex items-center justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                <span>Dijana secara AI • Selaras DSKP</span>
                <span>© 2026 Penjana RPH Moral</span>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-gray-800 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-gray-600 max-w-md text-center md:text-left">
            Sistem ini bertujuan untuk membantu guru Pendidikan Moral Malaysia dalam penyediaan RPH yang berkualiti.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-bold text-gray-500 hover:text-emerald-400 transition-colors">Panduan Pengguna</a>
            <a href="#" className="text-xs font-bold text-gray-500 hover:text-emerald-400 transition-colors">Hubungi Kami</a>
            <a href="#" className="text-xs font-bold text-gray-500 hover:text-emerald-400 transition-colors">Dasar Privasi</a>
          </div>
        </div>
      </footer>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          header, footer, .lg\\:col-span-5, button, .flex-none {
            display: none !important;
          }
          main {
            display: block !important;
            padding: 0 !important;
          }
          .lg\\:col-span-7 {
            width: 100% !important;
          }
          .bg-white {
            border: none !important;
            box-shadow: none !important;
          }
          .whitespace-pre-wrap {
            font-size: 12pt !important;
            line-height: 1.5 !important;
          }
        }
      `}} />
    </div>
  );
}
