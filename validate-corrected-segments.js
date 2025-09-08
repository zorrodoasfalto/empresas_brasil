const fs = require('fs');
const XLSX = require('./frontend/node_modules/xlsx');

// NEW corrected business segments mapping from server.js
const correctedSegmentMappings = [
  { id: 1, cnaes: ["5611201", "5611203", "5612100", "5620104"] },
  { id: 2, cnaes: ["5611203", "5611201", "5620104", "5612100"] },
  { id: 3, cnaes: ["9602501", "9602502", "4772500"] },
  { id: 4, cnaes: ["4530703", "4530705", "4541205"] },
  { id: 5, cnaes: ["4120400", "4110700", "4291000", "4223500"] },
  { id: 6, cnaes: ["4930201", "4930202", "5320202", "5229099"] },
  { id: 7, cnaes: ["6202300", "6201501", "6204000"] },
  { id: 8, cnaes: ["6201500", "6201501", "6202300", "6203100"] },
  { id: 9, cnaes: ["4771701", "8712300", "8630501", "8650099"] },
  { id: 10, cnaes: ["8599699", "8599604", "8513900", "8520100"] },
  { id: 11, cnaes: ["4520008", "4520001", "4530703"] },
  { id: 12, cnaes: ["8112500", "9491800", "9499500", "9430800"] },
  { id: 13, cnaes: ["4789099", "4774100", "4754701", "4755502", "4744001"] },
  { id: 14, cnaes: ["1091101", "1091102", "1099699", "1094800"] },
  { id: 15, cnaes: ["9700500", "8121400", "8122200", "8129000"] },
  { id: 16, cnaes: ["9001901", "9001902", "9002701"] },
  { id: 17, cnaes: ["7490104", "7490199", "8299799"] },
  { id: 18, cnaes: ["4110700", "4120400", "4291000"] },
  { id: 19, cnaes: ["8630502", "8630503", "8640205", "8640299"] },
  { id: 20, cnaes: ["4661300", "4661399", "4669999"] }
];

// Business segment names from UI
const segmentNames = {
    1: "Alimentação e Restaurantes",
    2: "Restaurantes e Alimentação", 
    3: "Beleza e Estética",
    4: "Comércio Automotivo",
    5: "Construção Civil",
    6: "Transportes e Logística",
    7: "Serviços Profissionais",
    8: "Tecnologia e Informática", 
    9: "Saúde e Farmácias",
    10: "Educação e Treinamento",
    11: "Automóveis e Oficinas",
    12: "Organizações e Associações",
    13: "Varejo Especializado",
    14: "Alimentação - Produção",
    15: "Serviços Domésticos",
    16: "Comunicação e Mídia",
    17: "Serviços Diversos",
    18: "Construção e Infraestrutura",
    19: "Saúde Especializada",
    20: "Distribuidoras e Atacado"
};

async function validateCorrectedSegments() {
    try {
        console.log('📊 Reading CNAE Excel file...');
        const filePath = 'D:/Projetos Cursor/Youtube Aula/LISTA COMPLETA DE CNAES.xlsx';
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`✅ Successfully read ${data.length} CNAE entries\n`);
        
        console.log('🔍 VALIDATING CORRECTED BUSINESS SEGMENTS:');
        console.log('====================================================');
        
        const issues = [];
        const validSegments = [];
        
        for (const segment of correctedSegmentMappings) {
            const segmentName = segmentNames[segment.id] || `Segment ${segment.id}`;
            console.log(`\n📋 ${segment.id}. ${segmentName}`);
            console.log(`CNAEs: [${segment.cnaes.join(', ')}]`);
            
            const foundCnaes = [];
            const notFoundCnaes = [];
            
            for (const cnae of segment.cnaes) {
                const found = data.find(row => String(row.CNAE) === cnae || String(row.CNAE) === cnae.substring(0, 6));
                if (found) {
                    foundCnaes.push({
                        cnae: found.CNAE,
                        description: found['DESCRIÇÃO DO CNAE']
                    });
                } else {
                    notFoundCnaes.push(cnae);
                }
            }
            
            if (notFoundCnaes.length > 0) {
                console.log(`❌ NOT FOUND: ${notFoundCnaes.join(', ')}`);
                issues.push({
                    id: segment.id,
                    name: segmentName,
                    notFound: notFoundCnaes,
                    found: foundCnaes
                });
            } else {
                console.log('✅ All CNAEs found');
                validSegments.push({
                    id: segment.id,
                    name: segmentName,
                    cnaes: foundCnaes
                });
            }
            
            // Show the descriptions
            foundCnaes.forEach(cnae => {
                console.log(`   ${cnae.cnae}: ${cnae.description}`);
            });
        }
        
        console.log('\n\n🚨 SUMMARY OF CORRECTED SEGMENTS:');
        console.log('=====================================');
        
        if (issues.length > 0) {
            console.log(`❌ Found ${issues.length} segments with invalid CNAEs:`);
            issues.forEach(issue => {
                console.log(`- ${issue.id}. ${issue.name}: ${issue.notFound.join(', ')} not found`);
            });
        } else {
            console.log('✅ All corrected segments have valid CNAEs!');
        }
        
        console.log(`\n✅ ${validSegments.length} segments are correctly mapped`);
        console.log(`❌ ${issues.length} segments still need correction`);
        
        // Check for duplicated CNAEs across segments
        console.log('\n\n🤔 CHECKING FOR DUPLICATED CNAEs:');
        console.log('=====================================');
        
        const cnaeUsage = {};
        correctedSegmentMappings.forEach(segment => {
            segment.cnaes.forEach(cnae => {
                if (!cnaeUsage[cnae]) cnaeUsage[cnae] = [];
                cnaeUsage[cnae].push(segment.id);
            });
        });
        
        const duplicatedCnaes = Object.entries(cnaeUsage).filter(([cnae, segments]) => segments.length > 1);
        if (duplicatedCnaes.length > 0) {
            console.log('⚠️ CNAEs used in multiple segments:');
            duplicatedCnaes.forEach(([cnae, segments]) => {
                const found = data.find(row => String(row.CNAE) === cnae);
                const desc = found ? found['DESCRIÇÃO DO CNAE'] : 'NOT FOUND';
                console.log(`   ${cnae} (${desc}) used in segments: ${segments.join(', ')}`);
            });
        } else {
            console.log('✅ No duplicated CNAEs across segments');
        }
        
        console.log('\n\n🎯 LOGICAL COHERENCE CHECK:');
        console.log('=====================================');
        
        // Check if segment names match their CNAEs logically
        const logicalChecks = [
            {
                segments: [1, 2],
                name: "Food/Restaurant segments",
                expectedKeywords: ["restaurante", "lanchonete", "alimentação"],
                actualCnaes: [...correctedSegmentMappings[0].cnaes, ...correctedSegmentMappings[1].cnaes]
            },
            {
                segments: [3],
                name: "Beauty segment",
                expectedKeywords: ["cabeleireiro", "estética", "cosmético"],
                actualCnaes: correctedSegmentMappings[2].cnaes
            },
            {
                segments: [13],
                name: "Retail segment", 
                expectedKeywords: ["comércio", "varejista"],
                actualCnaes: correctedSegmentMappings[12].cnaes
            }
        ];
        
        logicalChecks.forEach(check => {
            console.log(`\n🔍 ${check.name}:`);
            check.actualCnaes.forEach(cnae => {
                const found = data.find(row => String(row.CNAE) === cnae);
                if (found) {
                    const desc = found['DESCRIÇÃO DO CNAE'].toLowerCase();
                    const matches = check.expectedKeywords.some(keyword => desc.includes(keyword.toLowerCase()));
                    const status = matches ? '✅' : '❌';
                    console.log(`   ${status} ${found.CNAE}: ${found['DESCRIÇÃO DO CNAE']}`);
                }
            });
        });
        
        return {
            issues,
            validSegments,
            duplicatedCnaes,
            cnaeData: data
        };
        
    } catch (error) {
        console.error('❌ Error validating corrected segments:', error.message);
        return null;
    }
}

validateCorrectedSegments();