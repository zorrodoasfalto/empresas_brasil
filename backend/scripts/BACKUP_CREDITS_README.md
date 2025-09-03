# 🔄 Sistema de Backup de Créditos - Empresas Brasil

Sistema automático de backup diário dos créditos dos usuários para prevenção contra bugs e perdas de dados.

## 📋 Visão Geral

O sistema cria backups diários automáticos de todos os créditos dos usuários às **02:00 AM** (horário de Brasília), mantendo histórico dos últimos **30 dias**.

## 🛠️ Arquivos do Sistema

- `backup-credits-daily.js` - Script principal de backup
- `restore-credits-from-backup.js` - Script de restore de backups
- `setup-credits-backup-cron.js` - Configuração do cron job automático
- `backups/credits/` - Pasta onde ficam armazenados os backups

## 📊 Dados do Backup

Cada backup contém:

### Informações dos Usuários:
- ID do usuário
- Email
- Role (admin, trial, pro, premium, max)
- Créditos atuais
- Plano ativo
- Status da assinatura
- Datas de criação/atualização

### Estatísticas Resumidas:
- Total de usuários
- Total de créditos distribuídos
- Usuários por plano
- Créditos por plano

## 🚀 Como Usar

### Backup Manual
```bash
cd backend/scripts
node setup-credits-backup-cron.js manual
```

### Listar Backups Disponíveis
```bash
cd backend/scripts
node restore-credits-from-backup.js list
```

### Simular Restore (Dry Run)
```bash
cd backend/scripts
node restore-credits-from-backup.js restore
node restore-credits-from-backup.js restore 2025-09-03
```

### Aplicar Restore Real
```bash
cd backend/scripts
node restore-credits-from-backup.js restore --apply
node restore-credits-from-backup.js restore 2025-09-03 --apply
```

### Testar Configuração do Cron
```bash
cd backend/scripts
node setup-credits-backup-cron.js test
```

## ⏰ Backup Automático

O backup automático está **ATIVADO** no servidor principal e roda:
- **Horário**: 02:00 AM (Brasília) todos os dias
- **Retenção**: 30 dias (backups mais antigos são removidos automaticamente)
- **Formatos**: JSON (completo) + CSV (visualização)

## 📁 Localização dos Arquivos

Os backups são salvos em:
```
backend/backups/credits/
├── credits_backup_2025-09-03.json
├── credits_backup_2025-09-03.csv
├── credits_backup_2025-09-04.json
├── credits_backup_2025-09-04.csv
└── ...
```

## 🔒 Casos de Uso

### Quando Usar o Sistema

1. **Bug nos créditos**: Se algum bug zerrar ou alterar créditos incorretamente
2. **Auditoria**: Para verificar histórico de mudanças nos créditos
3. **Rollback**: Após mudanças problemáticas no sistema
4. **Investigação**: Para entender problemas reportados pelos usuários

### Exemplo de Uso Completo

```bash
# 1. Verificar backups disponíveis
node restore-credits-from-backup.js list

# 2. Simular restore para ver o que será alterado
node restore-credits-from-backup.js restore 2025-09-02

# 3. Se estiver correto, aplicar o restore
node restore-credits-from-backup.js restore 2025-09-02 --apply
```

## ⚠️ Precauções

- **Sempre usar DRY RUN primeiro** - teste antes de aplicar mudanças reais
- **Verificar data do backup** - certifique-se de usar o backup correto
- **Fazer backup atual antes do restore** - execute um backup manual antes de restaurar
- **Comunicar aos usuários** - avise sobre manutenções que possam afetar créditos

## 📊 Monitoramento

O sistema loga automaticamente:
- Sucesso/falha dos backups
- Quantidade de usuários e créditos
- Arquivos criados/removidos
- Erros durante o processo

Verifique os logs do servidor para acompanhar a execução do backup automático.

## 🔧 Configuração Avançada

Para alterar o horário do backup, edite o arquivo `setup-credits-backup-cron.js`:

```javascript
// Mudar horário (exemplo: 03:30 AM)
const cronExpression = '30 3 * * *'; // minuto hora dia mês dia_da_semana
```

Para alterar a retenção de backups, edite o arquivo `backup-credits-daily.js`:

```javascript
// Manter 60 dias em vez de 30
cutoffDate.setDate(cutoffDate.getDate() - 60);
```

## ✅ Status Atual

- ✅ Backup automático **ATIVADO** no servidor
- ✅ Sistema testado e funcionando
- ✅ Primeiro backup criado: 2025-09-03
- ✅ 35 usuários, 20.327 créditos totais protegidos
- ✅ Próximo backup: todo dia às 02:00 AM

---

**🚨 IMPORTANTE**: Este sistema é essencial para a proteção dos dados dos usuários. NÃO desative sem uma alternativa adequada.