const fs = require('fs');
const path = require('path');

// Try to read the Excel file using Node.js XLSX library from frontend
async function readCnaeFile() {
    try {
        const XLSX = require('./frontend/node_modules/xlsx');
        const filePath = 'D:/Projetos Cursor/Youtube Aula/LISTA COMPLETA DE CNAES.xlsx';
        
        console.log('📊 Reading CNAE Excel file...');
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`✅ Successfully read ${data.length} CNAE entries`);
        console.log('📋 Columns:', Object.keys(data[0] || {}));
        console.log('\n🔍 First 10 entries:');
        data.slice(0, 10).forEach((row, i) => {
            console.log(`${i + 1}:`, JSON.stringify(row, null, 2));
        });
        
        // Look for specific CNAEs we're using in the system
        console.log('\n🔍 Looking for specific CNAEs used in Varejo Especializado...');
        const currentVarejoCnaes = ["4789099", "4774100", "4754701", "4755502", "4744001"];
        const oldVarejoCnaes = ["4211101", "4212000", "4213800"];
        
        console.log('\n✅ Current system CNAEs for Varejo Especializado (ID 13):');
        currentVarejoCnaes.forEach(cnae => {
            const found = data.find(row => String(row.CNAE) === cnae || String(row.CNAE) === cnae.substring(0, 6));
            if (found) {
                console.log(`- ${found.CNAE}: ${found['DESCRIÇÃO DO CNAE']}`);
            } else {
                console.log(`- ${cnae}: NOT FOUND in CNAE file`);
            }
        });
        
        console.log('\n❌ Old system CNAEs (construction - should NOT be used):');
        oldVarejoCnaes.forEach(cnae => {
            const found = data.find(row => String(row.CNAE) === cnae || String(row.CNAE) === cnae.substring(0, 6));
            if (found) {
                console.log(`- ${found.CNAE}: ${found['DESCRIÇÃO DO CNAE']}`);
            } else {
                console.log(`- ${cnae}: NOT FOUND in CNAE file`);
            }
        });
        
        // Search for commerce/retail related CNAEs
        console.log('\n🛒 Searching for commerce/retail related CNAEs...');
        const comercioRelated = data.filter(row => {
            const description = row['DESCRIÇÃO DO CNAE'].toLowerCase();
            return description.includes('comércio') || description.includes('venda') || 
                   description.includes('varejo') || description.includes('atacado') ||
                   description.includes('produtos') || description.includes('artigos');
        });
        
        console.log(`📊 Found ${comercioRelated.length} commerce-related CNAEs:`);
        comercioRelated.slice(0, 30).forEach(row => {
            console.log(`- ${row.CNAE}: ${row['DESCRIÇÃO DO CNAE']}`);
        });
        
    } catch (error) {
        console.error('❌ Error reading CNAE file:', error.message);
        console.log('\n💡 Trying alternative approach - file system check...');
        
        const filePath = 'D:/Projetos Cursor/Youtube Aula/LISTA COMPLETA DE CNAES.xlsx';
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`✅ File exists: ${stats.size} bytes, modified: ${stats.mtime}`);
        } else {
            console.log('❌ File not found');
        }
        
        // List files in directory
        console.log('\n📁 Files in directory:');
        const dirPath = 'D:/Projetos Cursor/Youtube Aula/';
        try {
            const files = fs.readdirSync(dirPath);
            files.filter(f => f.includes('CNAE') || f.includes('cnae') || f.endsWith('.xlsx')).forEach(f => {
                console.log(`- ${f}`);
            });
        } catch (e) {
            console.error('Error listing directory:', e.message);
        }
    }
}

readCnaeFile();