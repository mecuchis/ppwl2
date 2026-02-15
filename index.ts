// Definisikan nama file di paling atas agar bisa diakses semua fungsi
const FILE_NAME = "notes.txt"

// --- TUGAS 2: FUNGSI BANTUAN UNTUK FORMAT TIMESTAMP ---
// Mengubah waktu menjadi format 2026-02-12 14:33:20 menggunakan toISOString()
function getFormattedTimestamp() {
  // toISOString() menghasilkan "2026-02-12T14:33:20.000Z"
  // Kita ganti "T" jadi spasi, lalu ambil 19 karakter pertamanya saja
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

// 1. Fungsi untuk menulis catatan ke dalam file
async function addNote(content: string) {
  try {
    const file = Bun.file(FILE_NAME);
    
    // Ambil isi lama jika ada
    const existingContent = await file.exists() ? await file.text() : "";
    
    // Tambahkan catatan baru (dengan timestamp yang sudah diupdate)
    const timestamp = getFormattedTimestamp();
    const formattedNote = `[${timestamp}] ${content}\n`;
    
    // Simpan kembali
    await Bun.write(FILE_NAME, existingContent + formattedNote);
    
    console.log("✅ Catatan berhasil disimpan!");
  } catch (error) {
    console.error("❌ Gagal menyimpan catatan:", error);
  }
}

// 2. Fungsi untuk membaca semua catatan
async function readNotes() {
  const file = Bun.file(FILE_NAME);
  if (await file.exists()) {
    const content = await file.text();
    console.log("\n--- DAFTAR CATATAN ---");
    // Menampilkan nomor baris agar mudah untuk dihapus nanti
    const lines = content.trim().split("\n");
    lines.forEach((line, index) => {
      console.log(`${index + 1}. ${line}`);
    });
  } else {
    console.log("\n📭 Belum ada catatan tersimpan.");
  }
}

// 3. Fungsi untuk menghapus catatan berdasarkan nomor baris
async function deleteNote(lineNumber: number) {
  try {
    const file = Bun.file(FILE_NAME);
    if (!(await file.exists())) return;

    const content = await file.text();
    const lines = content.trim().split("\n");

    if (lineNumber > 0 && lineNumber <= lines.length) {
      const removed = lines.splice(lineNumber - 1, 1);
      // Simpan kembali sisa barisnya, jangan lupa tambahkan newline di akhir
      await Bun.write(FILE_NAME, lines.join("\n") + (lines.length > 0 ? "\n" : ""));
      console.log(`🗑️ Berhasil menghapus: ${removed}`);
    } else {
      console.log("❌ Nomor catatan tidak valid!");
    }
  } catch (error) {
    console.error("❌ Gagal menghapus catatan:", error);
  }
}

// --- TUGAS 1: FUNGSI UNTUK MENGUPDATE CATATAN ---
async function updateNote(lineNumber: number, newContent: string) {
  try {
    const file = Bun.file(FILE_NAME);
    if (!(await file.exists())) return;

    const content = await file.text();
    const lines = content.trim().split("\n");

    if (lineNumber > 0 && lineNumber <= lines.length) {
      const timestamp = getFormattedTimestamp();
      const formattedNote = `[${timestamp}] ${newContent}`;
      
      // Timpa baris yang lama dengan catatan yang baru
      lines[lineNumber - 1] = formattedNote;
      
      // Simpan kembali ke file
      await Bun.write(FILE_NAME, lines.join("\n") + "\n");
      console.log(`✏️ Berhasil mengubah catatan nomor ${lineNumber}`);
    } else {
      console.log("❌ Nomor catatan tidak valid!");
    }
  } catch (error) {
    console.error("❌ Gagal mengubah catatan:", error);
  }
}

// --- TUGAS 3: FUNGSI UNTUK MENCARI CATATAN (SEARCH) ---
async function searchNotes(keyword: string) {
  try {
    const file = Bun.file(FILE_NAME);
    if (!(await file.exists())) {
      console.log("\n📭 Belum ada catatan tersimpan.");
      return;
    }

    const content = await file.text();
    const lines = content.trim().split("\n");
    
    console.log(`\n🔍 --- HASIL PENCARIAN: "${keyword}" ---`);
    let found = false; // Penanda jika kata ditemukan
    
    lines.forEach((line, index) => {
      // Ubah semua huruf jadi kecil (toLowerCase) agar pencariannya tidak sensitif huruf besar/kecil
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        console.log(`${index + 1}. ${line}`);
        found = true;
      }
    });

    if (!found) {
      console.log(`❌ Tidak ada catatan yang mengandung kata "${keyword}".`);
    }
  } catch (error) {
    console.error("❌ Gagal mencari catatan:", error);
  }
}


// ==========================================
// LOGIKA COMMAND LINE INTERFACE (CLI)
// ==========================================
const command = Bun.argv[2]; 
const value = Bun.argv[3];
const extraValue = Bun.argv[4]; // Diperlukan untuk mengambil argumen teks saat proses Update


if (command === "delete") {
  if (value) {
    const indexToDelete = parseInt(value);
    if (!isNaN(indexToDelete)) {
      await deleteNote(indexToDelete);
      await readNotes();
    } else {
      console.log("❌ Error: Harap masukkan angka.");
    }
  } else {
    console.log("⚠️ Masukkan nomor baris. Contoh: bun run index.ts delete 1");
  }
} 

// TAMBAHAN UNTUK UPDATE
else if (command === "update") {
  if (value && extraValue) {
    const indexToUpdate = parseInt(value);
    if (!isNaN(indexToUpdate)) {
      await updateNote(indexToUpdate, extraValue);
      await readNotes();
    } else {
      console.log("❌ Error: Harap masukkan angka.");
    }
  } else {
    console.log("⚠️ Format salah. Contoh: bun run index.ts update 1 \"isi catatan baru\"");
  }
}

// TAMBAHAN UNTUK SEARCH
else if (command === "search") {
  if (value) {
    await searchNotes(value);
  } else {
    console.log("⚠️ Masukkan kata kunci. Contoh: bun run index.ts search coding");
  }
}

else if (command === "list" || command === "view") {
  await readNotes();
} 

else if (command) {
  // Jika argumen bukan 'delete', 'list', 'update', atau 'search', maka dianggap menambah catatan
  await addNote(command);
  await readNotes(); // Tampilkan list setelah menambah
} 

else {
  console.log("💡 Tips Perintah:");
  console.log("   Lihat Semua : bun run index.ts list");
  console.log("   Tambah      : bun run index.ts \"isi catatan\"");
  console.log("   Edit        : bun run index.ts update [nomor] \"isi baru\"");
  console.log("   Hapus       : bun run index.ts delete [nomor]");
  console.log("   Cari        : bun run index.ts search [kata kunci]");
}