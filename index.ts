const FILE_NAME = "notes.txt"

function getFormattedTimestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

async function addNote(content: string) {
  try {
    const file = Bun.file(FILE_NAME);
    
    const existingContent = await file.exists() ? await file.text() : "";
    
    const timestamp = getFormattedTimestamp();
    const formattedNote = `[${timestamp}] ${content}\n`;

    await Bun.write(FILE_NAME, existingContent + formattedNote);
    
    console.log("✅ Catatan berhasil disimpan!");
  } catch (error) {
    console.error("❌ Gagal menyimpan catatan:", error);
  }
}

async function readNotes() {
  const file = Bun.file(FILE_NAME);
  if (await file.exists()) {
    const content = await file.text();
    console.log("\n--- DAFTAR CATATAN ---");
    const lines = content.trim().split("\n");
    lines.forEach((line, index) => {
      console.log(`${index + 1}. ${line}`);
    });
  } else {
    console.log("\n📭 Belum ada catatan tersimpan.");
  }
}

async function deleteNote(lineNumber: number) {
  try {
    const file = Bun.file(FILE_NAME);
    if (!(await file.exists())) return;

    const content = await file.text();
    const lines = content.trim().split("\n");

    if (lineNumber > 0 && lineNumber <= lines.length) {
      const removed = lines.splice(lineNumber - 1, 1);
      await Bun.write(FILE_NAME, lines.join("\n") + (lines.length > 0 ? "\n" : ""));
      console.log(`🗑️ Berhasil menghapus: ${removed}`);
    } else {
      console.log("❌ Nomor catatan tidak valid!");
    }
  } catch (error) {
    console.error("❌ Gagal menghapus catatan:", error);
  }
}

async function updateNote(lineNumber: number, newContent: string) {
  try {
    const file = Bun.file(FILE_NAME);
    if (!(await file.exists())) return;

    const content = await file.text();
    const lines = content.trim().split("\n");

    if (lineNumber > 0 && lineNumber <= lines.length) {
      const timestamp = getFormattedTimestamp();
      const formattedNote = `[${timestamp}] ${newContent}`;
      
      lines[lineNumber - 1] = formattedNote;

      await Bun.write(FILE_NAME, lines.join("\n") + "\n");
      console.log(`✏️ Berhasil mengubah catatan nomor ${lineNumber}`);
    } else {
      console.log("❌ Nomor catatan tidak valid!");
    }
  } catch (error) {
    console.error("❌ Gagal mengubah catatan:", error);
  }
}

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
    let found = false; 
    
    lines.forEach((line, index) => {
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

const command = Bun.argv[2]; 
const value = Bun.argv[3];
const extraValue = Bun.argv[4]; 


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
  await addNote(command);
  await readNotes(); 
} 

else {
  console.log("💡 Tips Perintah:");
  console.log("   Lihat Semua : bun run index.ts list");
  console.log("   Tambah      : bun run index.ts \"isi catatan\"");
  console.log("   Edit        : bun run index.ts update [nomor] \"isi baru\"");
  console.log("   Hapus       : bun run index.ts delete [nomor]");
  console.log("   Cari        : bun run index.ts search [kata kunci]");
}
