#!/bin/bash

# Memeriksa apakah rtk sudah terinstal
if ! command -v rtk &> /dev/null; then
    echo "RTK (Rust Token Killer) belum terinstal di sistem Anda."
    echo "Mencoba menginstal RTK menggunakan Quick Script..."
    
    # Menjalankan instalasi
    curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
    
    if [ $? -eq 0 ]; then
        echo "✅ RTK berhasil terinstal!"
    else
        echo "❌ Gagal menginstal RTK secara otomatis."
        echo "Silakan instal manual menggunakan Brew: 'brew install rtk'"
        exit 1
    fi
else
    echo "✅ RTK sudah terinstal di: $(which rtk)"
fi

echo "Menginisialisasi hook global untuk agen AI..."
rtk init -g

echo "🎉 Setup RTK selesai!"
echo "PENTING: Silakan restart terminal atau sesi editor Anda agar perubahan aktif sepenuhnya."
