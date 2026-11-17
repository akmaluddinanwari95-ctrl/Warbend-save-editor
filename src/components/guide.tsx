export function Guide() {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="font-display text-lg text-fg">Pakai di HP, tanpa APK</h2>
        <p className="mt-2 text-sm text-muted">
          Editor ini sudah jalan di browser. Tidak perlu Android Studio untuk mengubah save.
          Chrome di Android bisa membuka file <span className="text-fg">sg00.sav</span>, menyuntingnya, lalu mengunduh hasilnya.
        </p>
        <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-fg">
          <li>Tutup Mount & Blade sepenuhnya.</li>
          <li>Salin <span className="text-accent">sg00.sav</span> (atau slot lain) ke folder Download. Lihat bagian folder di bawah.</li>
          <li>Di halaman ini, pilih file itu. Ubah denar, atribut, skill, pasukan, atau relasi.</li>
          <li>Ketuk <span className="text-accent">Unduh save</span>. File baru berakhiran <span className="text-fg">-edited.sav</span>.</li>
          <li>Salin kembali ke folder save, ganti nama menjadi persis seperti aslinya (misalnya sg00.sav), lalu buka game.</li>
        </ol>
        <p className="mt-3 text-sm text-muted">
          Simpan salinan file asli dulu. Kalau game menolak save, kembalikan salinan itu. Tambahkan halaman ini ke layar utama lewat menu Chrome → Tambahkan ke layar utama supaya ikonnya seperti aplikasi.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="font-display text-lg text-fg">Folder save di Android & M&BTool</h2>
        <p className="mt-2 text-sm text-muted">
          Port Warband menyimpan slot yang sama dengan PC: <span className="text-fg">sg00.sav</span>, <span className="text-fg">sg01.sav</span>, dan seterusnya, biasanya di dalam folder bernama <span className="text-fg">Mount&Blade Warband Savegames</span> lalu nama modul (Native, atau mod yang kamu mainkan).
        </p>
        <p className="mt-2 text-sm text-muted">
          Lokasinya sering tersembunyi di penyimpanan launcher, bukan di Documents. Cara yang paling andal: buka pengelola file yang mampu mencari seluruh penyimpanan (misalnya pengelola dengan izin “semua file”), cari nama <span className="text-fg">sg00.sav</span>, lalu salin ke Download.
        </p>
        <p className="mt-2 text-sm text-danger">
          Sejak Android 11, folder <span className="text-fg">Android/data</span> ditutup untuk aplikasi biasa — termasuk APK yang kamu buat sendiri dan pemilih file Chrome. Izin “akses semua file” yang bisa menembus folder itu ditolak Play Store, dan banyak HP tetap memblokirnya. Karena itu editor ini tidak berpura-pura membuka folder data secara langsung. Alur salin keluar → sunting → salin masuk tetap jalan di Android baru.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="font-display text-lg text-fg">Apa yang benar-benar diubah</h2>
        <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-sm text-muted">
          <li><span className="text-fg">Denar</span> — emas troop pemain (yang dibaca game sebagai uangmu), bukan bendera emas party NPC.</li>
          <li><span className="text-fg">STR, AGI, INT, CHA</span> — empat bilangan utuh di troop pemain, plus poin atribut, skill, dan proficiency.</li>
          <li><span className="text-fg">Skill</span> — 4 bit per skill di dalam enam bilangan 32-bit. Urutan mengikuti Native. Skill cadangan sengaja ditampilkan; kalau angkanya acak, file itu bukan pola Native.</li>
          <li><span className="text-fg">Senjata</span> — tujuh proficiency (one-handed sampai firearm).</li>
          <li><span className="text-fg">Pasukan</span> — jumlah dan yang terluka pada stack yang sudah ada di party utama. Jenis pasukan baru tidak ditambah, karena satu stack tambahan menggeser data peta yang tidak aman diubah.</li>
          <li><span className="text-fg">Faksi</span> — matriks relasi (bilangan pecahan) antar faksi. Nama faksi diambil dari save.</li>
          <li><span className="text-fg">Lord</span> — slot 22, yaitu <span className="text-fg">troop_player_relation</span> di Native dan banyak mod. Kalau modmu memindahkan slot itu, ubah nomor slot di tab Lord sebelum menyimpan.</li>
        </ul>
        <p className="mt-3 text-sm text-muted">
          Angka diganti di tempatnya, panjang file tidak berubah, sisa save (quest, inventori, wajah) dibiarkan apa adanya. Bannerlord dan Mount & Blade 1.011 tidak didukung.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="font-display text-lg text-fg">Kalau tetap ingin APK</h2>
        <p className="mt-2 text-sm text-muted">
          APK tidak menambah kemampuan yang belum ada di halaman ini, dan tidak membuka <span className="text-fg">Android/data</span> secara ajaib. Yang bisa APK lakukan hanya membungkus editor yang sama plus pemilih folder Storage Access Framework — dan folder data aplikasi lain tetap tertutup.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Cara</th>
                <th className="px-3 py-2 font-medium">Hasil</th>
              </tr>
            </thead>
            <tbody className="text-fg">
              <tr className="border-t border-border">
                <td className="px-3 py-2">Browser HP</td>
                <td className="px-3 py-2 text-muted">Sudah cukup. Tidak perlu PC.</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Android Studio di PC</td>
                <td className="px-3 py-2 text-muted">Satu-satunya jalur APK yang stabil. Pasang SDK, buat proyek kosong, salin logika pembaca save, bangun APK debug.</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Termux</td>
                <td className="px-3 py-2 text-muted">Secara teori bisa (OpenJDK + Gradle + command-line SDK). Unduhan SDK sangat besar dan sering gagal di HP. Tidak praktis.</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2">AIDE</td>
                <td className="px-3 py-2 text-muted">Proyeknya usang terhadap Gradle sekarang. Jangan diandalkan.</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Sketchware</td>
                <td className="px-3 py-2 text-muted">Editor blok. Tidak cocok untuk parser biner bersyarat versi ini.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">
          Jadi: tidak wajib pakai PC. Wajib hanya jika kamu memang ingin file APK. Untuk menyunting save hari ini, pakai tombol pilih file di atas.
        </p>
      </section>
    </div>
  );
}
