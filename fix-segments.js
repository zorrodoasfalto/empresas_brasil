const fs = require('fs');
const XLSX = require('./frontend/node_modules/xlsx');

// Read CNAE file to find correct alternatives
async function findCorrectCnaesForSegments() {
    try {
        console.log('📊 Reading CNAE Excel file...');
        const filePath = 'D:/Projetos Cursor/Youtube Aula/LISTA COMPLETA DE CNAES.xlsx';
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        // Helper function to find CNAEs by keywords
        const findCnaesByKeywords = (keywords, limit = 5) => {
            return data.filter(row => {
                const description = row['DESCRIÇÃO DO CNAE'].toLowerCase();
                return keywords.some(keyword => description.includes(keyword.toLowerCase()));
            }).slice(0, limit);
        };
        
        console.log('🔧 GENERATING CORRECTED BUSINESS SEGMENT MAPPINGS:\n');
        
        // Generate correct mappings for each segment
        const correctedMappings = {
            1: {
                name: "Alimentação e Restaurantes",
                keywords: ["restaurante", "lanchonete", "alimentação", "refeição"],
                cnaes: findCnaesByKeywords(["restaurante", "lanchonete", "alimentação", "refeição"])
            },
            2: {
                name: "Restaurantes e Alimentação", 
                keywords: ["bar", "cafeteria", "pizzaria", "food", "bebida"],
                cnaes: findCnaesByKeywords(["bar", "cafeteria", "pizzaria", "bebida"])
            },
            3: {
                name: "Beleza e Estética",
                keywords: ["cabeleireiro", "estética", "cosmético", "beleza"],
                cnaes: findCnaesByKeywords(["cabeleireiro", "estética", "cosmético", "beleza"])
            },
            4: {
                name: "Comércio Automotivo",
                keywords: ["automotor", "veículo", "peças", "automóvel"],
                cnaes: findCnaesByKeywords(["automotor", "veículo", "peças", "automóvel"])
            },
            5: {
                name: "Construção Civil",
                keywords: ["construção", "edifícios", "obras", "imobiliário"],
                cnaes: findCnaesByKeywords(["construção", "edifícios", "obras", "imobiliário"])
            },
            6: {
                name: "Transportes e Logística",
                keywords: ["transporte", "logística", "carga", "entrega"],
                cnaes: findCnaesByKeywords(["transporte", "logística", "carga", "entrega"])
            },
            7: {
                name: "Serviços Profissionais",
                keywords: ["consultoria", "gestão", "administrativo", "escritório"],
                cnaes: findCnaesByKeywords(["consultoria", "gestão", "administrativo", "escritório"])
            },
            8: {
                name: "Tecnologia e Informática",
                keywords: ["computador", "software", "tecnologia", "informação"],
                cnaes: findCnaesByKeywords(["computador", "software", "tecnologia", "informação"])
            },
            9: {
                name: "Saúde e Farmácias",
                keywords: ["farmacêutica", "médica", "saúde", "clínica"],
                cnaes: findCnaesByKeywords(["farmacêutica", "médica", "saúde", "clínica"])
            },
            10: {
                name: "Educação e Treinamento",
                keywords: ["ensino", "educação", "treinamento", "escola"],
                cnaes: findCnaesByKeywords(["ensino", "educação", "treinamento", "escola"])
            },
            11: {
                name: "Automóveis e Oficinas",
                keywords: ["manutenção", "reparação", "oficina", "mecânica"],
                cnaes: findCnaesByKeywords(["manutenção", "reparação", "oficina", "mecânica"])
            },
            12: {
                name: "Organizações e Associações",
                keywords: ["associação", "organização", "sindicato", "condomínio"],
                cnaes: findCnaesByKeywords(["associação", "organização", "sindicato", "condomínio"])
            },
            13: {
                name: "Varejo Especializado",
                keywords: ["comércio varejista", "produtos", "artigos"],
                cnaes: findCnaesByKeywords(["comércio varejista", "produtos", "artigos"])
            },
            14: {
                name: "Alimentação - Produção",
                keywords: ["fabricação", "produção", "alimentos", "padaria"],
                cnaes: findCnaesByKeywords(["fabricação", "produção", "alimentos", "padaria"])
            },
            15: {
                name: "Serviços Domésticos",
                keywords: ["doméstico", "limpeza", "serviços", "reparação"],
                cnaes: findCnaesByKeywords(["doméstico", "limpeza", "serviços", "reparação"])
            },
            16: {
                name: "Comunicação e Mídia",
                keywords: ["comunicação", "mídia", "publicidade", "televisão"],
                cnaes: findCnaesByKeywords(["comunicação", "mídia", "publicidade", "televisão"])
            },
            17: {
                name: "Serviços Diversos",
                keywords: ["serviços", "atividades", "outras"],
                cnaes: findCnaesByKeywords(["serviços", "atividades", "outras"])
            },
            18: {
                name: "Construção e Infraestrutura",
                keywords: ["incorporação", "imobiliário", "infraestrutura"],
                cnaes: findCnaesByKeywords(["incorporação", "imobiliário", "infraestrutura"])
            },
            19: {
                name: "Saúde Especializada",
                keywords: ["diagnóstico", "ambulatorial", "exames"],
                cnaes: findCnaesByKeywords(["diagnóstico", "ambulatorial", "exames"])
            },
            20: {
                name: "Distribuidoras e Atacado",
                keywords: ["atacadista", "distribuição", "máquinas"],
                cnaes: findCnaesByKeywords(["atacadista", "distribuição", "máquinas"])
            }
        };
        
        // Display suggestions for each segment
        for (const [id, segment] of Object.entries(correctedMappings)) {
            console.log(`📋 ${id}. ${segment.name}`);
            console.log(`Keywords: ${segment.keywords.join(', ')}`);
            console.log('Suggested CNAEs:');
            segment.cnaes.forEach(cnae => {
                console.log(`   ${cnae.CNAE}: ${cnae['DESCRIÇÃO DO CNAE']}`);
            });
            console.log('');
        }
        
        // Generate JavaScript array for server.js
        console.log('\n🔧 CORRECTED BUSINESSSEGMENTS ARRAY FOR SERVER.JS:');
        console.log('=====================================');
        console.log('const businessSegments = [');
        
        for (const [id, segment] of Object.entries(correctedMappings)) {
            const cnaeCodes = segment.cnaes.slice(0, 4).map(cnae => `"${cnae.CNAE}"`);
            console.log(`        { id: ${id}, cnaes: [${cnaeCodes.join(', ')}] },`);
        }
        
        console.log('      ];');
        
        return correctedMappings;
        
    } catch (error) {
        console.error('❌ Error generating corrections:', error.message);
        return null;
    }
}

findCorrectCnaesForSegments();